// AI Response Caching Service
// Provides caching for expensive AI operations to improve performance and reduce costs
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
// Initialize Supabase client for cache storage
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 24 * 60 * 60 * 1000,
  MAX_CACHE_SIZE: 1000000,
  CLEANUP_INTERVAL: 60 * 60 * 1000
};
/**
 * Generate cache key from parameters
 */ function generateCacheKey(prefix, params) {
  // Create deterministic key from sorted parameters
  const sortedParams = Object.keys(params).sort().map((key)=>`${key}:${JSON.stringify(params[key])}`).join("|");
  // Create hash-like key (simple but deterministic)
  const hash = btoa(sortedParams).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
  return `${prefix}:${hash}`;
}
/**
 * Calculate size of cache entry in bytes
 */ function calculateSize(value) {
  return new TextEncoder().encode(JSON.stringify(value)).length;
}
/**
 * AI Cache Service Class
 */ export class AICacheService {
  inMemoryCache = new Map();
  stats = {
    hits: 0,
    misses: 0
  };
  constructor(){
    // Start periodic cleanup
    this.startCleanupTimer();
  }
  /**
   * Get cache statistics
   */ getStats() {
    const entries = Array.from(this.inMemoryCache.values());
    const totalSize = entries.reduce((sum, entry)=>sum + entry.size, 0);
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hitRate: this.stats.hits + this.stats.misses > 0 ? this.stats.hits / (this.stats.hits + this.stats.misses) : 0,
      totalEntries: entries.length,
      totalSize,
      oldestEntry: entries.length > 0 ? new Date(Math.min(...entries.map((e)=>e.createdAt.getTime()))) : undefined,
      newestEntry: entries.length > 0 ? new Date(Math.max(...entries.map((e)=>e.createdAt.getTime()))) : undefined
    };
  }
  /**
   * Generate cache key for AI operations
   */ generateKey(operation, resumeId, params) {
    const keyParams = {
      resumeId,
      operation,
      ...params
    };
    return generateCacheKey("ai", keyParams);
  }
  /**
   * Get cached value
   */ async get(key) {
    // Check in-memory cache first
    const memoryEntry = this.inMemoryCache.get(key);
    if (memoryEntry) {
      if (memoryEntry.expiresAt > new Date()) {
        this.stats.hits++;
        return memoryEntry.value;
      } else {
        // Expired entry
        this.inMemoryCache.delete(key);
      }
    }
    // Check database cache
    try {
      const { data, error } = await supabase.from("ai_cache").select("*").eq("key", key).gt("expires_at", new Date().toISOString()).single();
      if (error || !data) {
        this.stats.misses++;
        return null;
      }
      // Parse cached value
      const cachedValue = JSON.parse(data.value);
      // Store in memory cache for faster future access
      const cacheEntry = {
        key,
        value: cachedValue,
        createdAt: new Date(data.created_at),
        expiresAt: new Date(data.expires_at),
        metadata: data.metadata || {},
        size: calculateSize(cachedValue)
      };
      this.inMemoryCache.set(key, cacheEntry);
      this.stats.hits++;
      return cachedValue;
    } catch (error) {
      console.error("Cache retrieval error:", error);
      this.stats.misses++;
      return null;
    }
  }
  /**
   * Set cached value
   */ async set(key, value, options = {}) {
    const ttl = options.ttl || CACHE_CONFIG.DEFAULT_TTL;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttl);
    const size = calculateSize(value);
    // Check size limit
    if (size > CACHE_CONFIG.MAX_CACHE_SIZE) {
      console.warn(`Cache entry too large: ${size} bytes (max: ${CACHE_CONFIG.MAX_CACHE_SIZE})`);
      return;
    }
    const cacheEntry = {
      key,
      value,
      createdAt: now,
      expiresAt,
      metadata: options.metadata || {},
      size
    };
    // Store in memory cache
    this.inMemoryCache.set(key, cacheEntry);
    // Store in database cache for persistence
    try {
      const { error } = await supabase.from("ai_cache").upsert({
        key,
        value: JSON.stringify(value),
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString(),
        metadata: options.metadata || {},
        tags: options.tags || [],
        size
      });
      if (error) {
        console.error("Cache storage error:", error);
      }
    } catch (error) {
      console.error("Cache storage error:", error);
    }
  }
  /**
   * Delete cached value
   */ async delete(key) {
    // Remove from memory cache
    this.inMemoryCache.delete(key);
    // Remove from database cache
    try {
      await supabase.from("ai_cache").delete().eq("key", key);
    } catch (error) {
      console.error("Cache deletion error:", error);
    }
  }
  /**
   * Clear all cache entries (or by tag)
   */ async clear(tag) {
    if (tag) {
      // Clear by tag
      try {
        const { data } = await supabase.from("ai_cache").select("key").contains("tags", [
          tag
        ]);
        if (data) {
          // Remove from memory cache
          data.forEach((entry)=>this.inMemoryCache.delete(entry.key));
          // Remove from database
          await supabase.from("ai_cache").delete().contains("tags", [
            tag
          ]);
        }
      } catch (error) {
        console.error("Tagged cache clear error:", error);
      }
    } else {
      // Clear all
      this.inMemoryCache.clear();
      try {
        await supabase.from("ai_cache").delete().neq("key", ""); // Delete all rows
      } catch (error) {
        console.error("Full cache clear error:", error);
      }
    }
  }
  /**
   * Get or set with cache-aside pattern
   */ async getOrSet(key, fetcher, options = {}) {
    // Try to get from cache first
    const cached = await this.get(key);
    if (cached !== null) {
      return cached;
    }
    // Not in cache, fetch value
    const value = await fetcher();
    // Store in cache
    await this.set(key, value, options);
    return value;
  }
  /**
   * Invalidate cache entries by resume ID
   */ async invalidateByResume(resumeId) {
    const pattern = `ai:${resumeId}`;
    // Remove matching entries from memory cache
    for (const [key, entry] of this.inMemoryCache.entries()){
      if (key.includes(pattern)) {
        this.inMemoryCache.delete(key);
      }
    }
    // Remove from database
    try {
      await supabase.from("ai_cache").delete().like("key", `%${pattern}%`);
    } catch (error) {
      console.error("Resume cache invalidation error:", error);
    }
  }
  /**
   * Clean up expired entries
   */ async cleanupExpired() {
    const now = new Date();
    // Clean memory cache
    for (const [key, entry] of this.inMemoryCache.entries()){
      if (entry.expiresAt <= now) {
        this.inMemoryCache.delete(key);
      }
    }
    // Clean database cache
    try {
      await supabase.from("ai_cache").delete().lt("expires_at", now.toISOString());
    } catch (error) {
      console.error("Cache cleanup error:", error);
    }
  }
  /**
   * Start periodic cleanup timer
   */ startCleanupTimer() {
    setInterval(()=>{
      this.cleanupExpired().catch((error)=>{
        console.error("Scheduled cache cleanup failed:", error);
      });
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }
}
// Singleton instance
let cacheServiceInstance = null;
export function getAICacheService() {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new AICacheService();
  }
  return cacheServiceInstance;
}
/**
 * Cache middleware for AI tools
 */ export function withCache(fn, keyGenerator, options = {}) {
  return async (...args)=>{
    const cache = getAICacheService();
    const key = keyGenerator(...args);
    return await cache.getOrSet(key, ()=>fn(...args), options);
  };
}
