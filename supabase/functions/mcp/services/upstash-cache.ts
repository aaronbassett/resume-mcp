// Upstash Redis Caching Service
// Global caching system for all MCP tools to improve performance and reduce database load
class UpstashRedis {
  config;
  constructor(config){
    this.config = config;
  }
  async sendCommand(command) {
    const url = `${this.config.url}${command.path}`;
    try {
      const response = await fetch(url, {
        method: command.method,
        headers: {
          "Authorization": `Bearer ${this.config.token}`,
          "Content-Type": "application/json"
        },
        body: command.body ? JSON.stringify(command.body) : undefined
      });
      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Upstash error: ${response.status} - ${error}`);
      }
      const result = await response.json();
      return result.result;
    } catch (error) {
      console.error("Upstash command error:", error);
      throw error;
    }
  }
  async get(key) {
    const result = await this.sendCommand({
      method: "POST",
      path: "/get",
      body: [
        key
      ]
    });
    return result;
  }
  async set(key, value, options) {
    const args = [
      key,
      value
    ];
    if (options?.ex) {
      args.push("EX", options.ex.toString());
    }
    const result = await this.sendCommand({
      method: "POST",
      path: "/set",
      body: args
    });
    return result;
  }
  async del(...keys) {
    const result = await this.sendCommand({
      method: "POST",
      path: "/del",
      body: keys
    });
    return result;
  }
  async keys(pattern) {
    const result = await this.sendCommand({
      method: "POST",
      path: "/keys",
      body: [
        pattern
      ]
    });
    return result || [];
  }
  async incr(key) {
    const result = await this.sendCommand({
      method: "POST",
      path: "/incr",
      body: [
        key
      ]
    });
    return result;
  }
  async expire(key, seconds) {
    const result = await this.sendCommand({
      method: "POST",
      path: "/expire",
      body: [
        key,
        seconds
      ]
    });
    return result;
  }
  async ttl(key) {
    const result = await this.sendCommand({
      method: "POST",
      path: "/ttl",
      body: [
        key
      ]
    });
    return result;
  }
}
// Cache configuration
const CACHE_CONFIG = {
  DEFAULT_TTL: 1800,
  MAX_KEY_LENGTH: 200,
  MAX_VALUE_SIZE: 1024 * 512
};
// Cache TTL configuration for different MCP tools (in seconds)
export const CACHE_TTL = {
  // Profile tools - longer cache
  get_profile_basics: 3600,
  get_contact_info: 3600,
  get_summary: 3600,
  // Experience tools - medium cache
  list_all_experiences: 1800,
  get_experience_by_company: 1800,
  get_experience_details: 1800,
  // Skills tools - medium cache
  list_all_skills: 1800,
  get_skills_by_category: 1800,
  search_skills: 900,
  // Projects tools - medium cache
  list_projects: 1800,
  get_projects_by_technology: 1800,
  get_featured_projects: 3600,
  get_project_details: 1800,
  // Education tools - long cache
  list_education: 86400,
  get_highest_degree: 86400,
  // Certification tools - long cache
  list_certifications: 86400,
  get_active_certifications: 43200,
  get_expiring_certifications: 21600,
  // Resume tools - short cache
  get_complete_resume: 600,
  generate_custom_resume: 300,
  // AI tools - handled separately by AI cache service
  generate_summary: 0,
  find_relevant_experience: 0,
  // Analytics tools - no cache
  track_view: 0,
  // Admin tools - no cache
  create_api_key: 0,
  list_api_keys: 0,
  update_api_key: 0,
  revoke_api_key: 0,
  rotate_api_key: 0,
  get_api_key_stats: 0,
  verify_api_key_permissions: 0
};
/**
 * Generate a deterministic cache key
 */ function generateCacheKey(method, resumeId, params = {}) {
  // Sort params for consistent key generation
  const sortedParams = Object.keys(params).sort().reduce((acc, key)=>{
    if (params[key] !== undefined && params[key] !== null) {
      acc[key] = params[key];
    }
    return acc;
  }, {});
  // Create a simple hash from params
  const paramsStr = JSON.stringify(sortedParams);
  const paramsHash = btoa(paramsStr).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16);
  const key = `mcp:${method}:${resumeId}:${paramsHash}`;
  // Ensure key doesn't exceed max length
  if (key.length > CACHE_CONFIG.MAX_KEY_LENGTH) {
    return key.slice(0, CACHE_CONFIG.MAX_KEY_LENGTH);
  }
  return key;
}
/**
 * Upstash Cache Service for MCP Tools
 */ export class UpstashCacheService {
  redis = null;
  enabled = false;
  stats = {
    hits: 0,
    misses: 0,
    errors: 0,
    responseTimes: []
  };
  constructor(){
    this.initialize();
  }
  initialize() {
    const url = Deno.env.get("UPSTASH_REDIS_URL");
    const token = Deno.env.get("UPSTASH_REDIS_TOKEN");
    if (url && token) {
      this.redis = new UpstashRedis({
        url,
        token
      });
      this.enabled = true;
      console.log("Upstash cache service initialized");
    } else {
      console.warn("Upstash Redis not configured. Caching disabled.");
      this.enabled = false;
    }
  }
  /**
   * Check if caching is enabled
   */ isEnabled() {
    return this.enabled;
  }
  /**
   * Get cached data for an MCP tool
   */ async get(method, resumeId, params = {}) {
    if (!this.enabled || !this.redis) {
      return {
        data: null,
        cached: false
      };
    }
    // Check if method should be cached
    const ttl = CACHE_TTL[method];
    if (!ttl || ttl === 0) {
      return {
        data: null,
        cached: false
      };
    }
    const key = generateCacheKey(method, resumeId, params);
    const startTime = Date.now();
    try {
      const cachedValue = await this.redis.get(key);
      const responseTime = Date.now() - startTime;
      this.stats.responseTimes.push(responseTime);
      if (cachedValue) {
        this.stats.hits++;
        await this.trackCacheHit(method, resumeId);
        const data = JSON.parse(cachedValue);
        // Get TTL for cache headers
        const remainingTTL = await this.redis.ttl(key);
        const headers = {
          "X-Cache": "HIT",
          "X-Cache-TTL": remainingTTL.toString(),
          "Cache-Control": `private, max-age=${remainingTTL}`
        };
        return {
          data: data,
          cached: true,
          headers
        };
      }
      this.stats.misses++;
      await this.trackCacheMiss(method, resumeId);
      return {
        data: null,
        cached: false,
        headers: {
          "X-Cache": "MISS"
        }
      };
    } catch (error) {
      this.stats.errors++;
      console.error("Cache get error:", error);
      return {
        data: null,
        cached: false
      };
    }
  }
  /**
   * Set cached data for an MCP tool
   */ async set(method, resumeId, params = {}, data) {
    if (!this.enabled || !this.redis) {
      return false;
    }
    // Check if method should be cached
    const ttl = CACHE_TTL[method];
    if (!ttl || ttl === 0) {
      return false;
    }
    const key = generateCacheKey(method, resumeId, params);
    try {
      const value = JSON.stringify(data);
      // Check size limit
      if (new TextEncoder().encode(value).length > CACHE_CONFIG.MAX_VALUE_SIZE) {
        console.warn(`Cache value too large for ${method}: ${value.length} bytes`);
        return false;
      }
      await this.redis.set(key, value, {
        ex: ttl
      });
      return true;
    } catch (error) {
      this.stats.errors++;
      console.error("Cache set error:", error);
      return false;
    }
  }
  /**
   * Invalidate all cache entries for a resume
   */ async invalidateResume(resumeId) {
    if (!this.enabled || !this.redis) {
      return;
    }
    try {
      const pattern = `mcp:*:${resumeId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`Invalidated ${keys.length} cache entries for resume ${resumeId}`);
      }
    } catch (error) {
      console.error("Cache invalidation error:", error);
    }
  }
  /**
   * Invalidate cache entries for a specific method and resume
   */ async invalidateMethod(method, resumeId) {
    if (!this.enabled || !this.redis) {
      return;
    }
    try {
      const pattern = `mcp:${method}:${resumeId}:*`;
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`Invalidated ${keys.length} cache entries for ${method}/${resumeId}`);
      }
    } catch (error) {
      console.error("Method cache invalidation error:", error);
    }
  }
  /**
   * Get cache statistics
   */ async getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 ? this.stats.hits / totalRequests : 0;
    // Calculate average response time
    const avgResponseTime = this.stats.responseTimes.length > 0 ? this.stats.responseTimes.reduce((a, b)=>a + b, 0) / this.stats.responseTimes.length : 0;
    // Get per-method stats if Redis is available
    const topMethods = [];
    if (this.enabled && this.redis) {
      try {
        // Get stats for each cached method
        for (const method of Object.keys(CACHE_TTL)){
          if (CACHE_TTL[method] === 0) continue;
          const hitKey = `stats:cache:hit:${method}`;
          const missKey = `stats:cache:miss:${method}`;
          const hits = parseInt(await this.redis.get(hitKey) || "0");
          const misses = parseInt(await this.redis.get(missKey) || "0");
          const total = hits + misses;
          if (total > 0) {
            topMethods.push({
              method,
              hits,
              misses,
              hitRate: hits / total
            });
          }
        }
        // Sort by total requests
        topMethods.sort((a, b)=>b.hits + b.misses - (a.hits + a.misses));
      } catch (error) {
        console.error("Failed to get method stats:", error);
      }
    }
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      errors: this.stats.errors,
      hitRate,
      avgResponseTime,
      topMethods: topMethods.slice(0, 10)
    };
  }
  /**
   * Clear all cache entries (admin only)
   */ async clearAll() {
    if (!this.enabled || !this.redis) {
      return;
    }
    try {
      const keys = await this.redis.keys("mcp:*");
      if (keys.length > 0) {
        await this.redis.del(...keys);
        console.log(`Cleared ${keys.length} cache entries`);
      }
    } catch (error) {
      console.error("Cache clear error:", error);
    }
  }
  /**
   * Track cache hit
   */ async trackCacheHit(method, resumeId) {
    if (!this.redis) return;
    try {
      await this.redis.incr(`stats:cache:hit:${method}`);
      await this.redis.incr(`stats:cache:hit:resume:${resumeId}`);
      // Set expiry on stats keys (7 days)
      await this.redis.expire(`stats:cache:hit:${method}`, 604800);
      await this.redis.expire(`stats:cache:hit:resume:${resumeId}`, 604800);
    } catch (error) {
      console.error("Failed to track cache hit:", error);
    }
  }
  /**
   * Track cache miss
   */ async trackCacheMiss(method, resumeId) {
    if (!this.redis) return;
    try {
      await this.redis.incr(`stats:cache:miss:${method}`);
      await this.redis.incr(`stats:cache:miss:resume:${resumeId}`);
      // Set expiry on stats keys (7 days)
      await this.redis.expire(`stats:cache:miss:${method}`, 604800);
      await this.redis.expire(`stats:cache:miss:resume:${resumeId}`, 604800);
    } catch (error) {
      console.error("Failed to track cache miss:", error);
    }
  }
}
// Singleton instance
let cacheServiceInstance = null;
export function getUpstashCacheService() {
  if (!cacheServiceInstance) {
    cacheServiceInstance = new UpstashCacheService();
  }
  return cacheServiceInstance;
}
/**
 * Cache middleware for MCP tools
 */ export function withUpstashCache(handler) {
  return async (params, context)=>{
    const cache = getUpstashCacheService();
    // Skip caching if not enabled
    if (!cache.isEnabled()) {
      return handler(params, context);
    }
    // Extract method name from context or handler
    const method = context.method || handler.name;
    const resumeId = params.resumeId || context.resumeId;
    if (!method || !resumeId) {
      // Can't cache without method and resumeId
      return handler(params, context);
    }
    // Check cache
    const cached = await cache.get(method, resumeId, params);
    if (cached.data) {
      // Add cache headers to response if supported
      if (context.setHeaders && cached.headers) {
        context.setHeaders(cached.headers);
      }
      return cached.data;
    }
    // Execute handler
    const result = await handler(params, context);
    // Cache the result
    await cache.set(method, resumeId, params, result);
    // Add cache headers
    if (context.setHeaders && cached.headers) {
      context.setHeaders(cached.headers);
    }
    return result;
  };
}
