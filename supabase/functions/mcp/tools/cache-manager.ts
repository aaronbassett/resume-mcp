// Cache Manager Tools
// Provides cache statistics and management capabilities for administrators
import { createError } from "../utils/errors.ts";
import { getPermissionService } from "../services/permissions.ts";
import { getUpstashCacheService } from "../services/upstash-cache.ts";
/**
 * Check if user has admin permissions
 */ async function hasAdminPermission(apiKeyId) {
  const permissionService = getPermissionService();
  return await permissionService.checkPermission(apiKeyId, "admin", "*");
}
// Cache manager handlers
export const handlers = {
  /**
   * Get cache statistics
   */ get_cache_stats: async (params, context)=>{
    const { resumeId } = params;
    // Check admin permissions for global stats
    if (!resumeId && !await hasAdminPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "Admin permission required for global cache statistics");
    }
    // Check resume access for resume-specific stats
    if (resumeId && context.resumeId !== resumeId) {
      throw createError("FORBIDDEN", "Access denied to this resume");
    }
    const cacheService = getUpstashCacheService();
    if (!cacheService.isEnabled()) {
      return {
        type: "cache_stats",
        enabled: false,
        message: "Cache service is not enabled"
      };
    }
    try {
      const stats = await cacheService.getStats();
      return {
        type: "cache_stats",
        enabled: true,
        data: {
          summary: {
            hits: stats.hits,
            misses: stats.misses,
            errors: stats.errors,
            hitRate: `${(stats.hitRate * 100).toFixed(2)}%`,
            avgResponseTime: `${stats.avgResponseTime.toFixed(2)}ms`
          },
          methods: stats.topMethods.map((method)=>({
              name: method.method,
              hits: method.hits,
              misses: method.misses,
              hitRate: `${(method.hitRate * 100).toFixed(2)}%`,
              totalRequests: method.hits + method.misses
            }))
        }
      };
    } catch (error) {
      console.error("Failed to get cache stats:", error);
      throw createError("CACHE_ERROR", "Failed to retrieve cache statistics");
    }
  },
  /**
   * Clear cache for a specific resume
   */ clear_resume_cache: async (params, context)=>{
    const { resumeId, methods } = params;
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access or admin permission
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "resume", "write");
    const hasAdmin = await hasAdminPermission(context.apiKeyId);
    if (!hasWrite && !hasAdmin) {
      throw createError("FORBIDDEN", "No permission to clear cache");
    }
    // Verify access to the specific resume
    if (context.resumeId && context.resumeId !== targetResumeId && !hasAdmin) {
      throw createError("FORBIDDEN", "Access denied to this resume");
    }
    const cacheService = getUpstashCacheService();
    if (!cacheService.isEnabled()) {
      return {
        type: "cache_clear",
        enabled: false,
        message: "Cache service is not enabled"
      };
    }
    try {
      if (methods && methods.length > 0) {
        // Clear specific methods
        for (const method of methods){
          await cacheService.invalidateMethod(method, targetResumeId);
        }
        // Log audit event
        if (context.monitor) {
          await context.monitor.logAudit("clear_cache_methods", {
            resume_id: targetResumeId,
            methods
          });
        }
        return {
          type: "cache_clear",
          message: `Cache cleared for ${methods.length} methods`,
          data: {
            resumeId: targetResumeId,
            methods
          }
        };
      } else {
        // Clear all cache for resume
        await cacheService.invalidateResume(targetResumeId);
        // Log audit event
        if (context.monitor) {
          await context.monitor.logAudit("clear_cache_resume", {
            resume_id: targetResumeId
          });
        }
        return {
          type: "cache_clear",
          message: "All cache cleared for resume",
          data: {
            resumeId: targetResumeId
          }
        };
      }
    } catch (error) {
      console.error("Failed to clear cache:", error);
      throw createError("CACHE_ERROR", "Failed to clear cache");
    }
  },
  /**
   * Clear all cache (admin only)
   */ clear_all_cache: async (params, context)=>{
    // Check admin permissions
    if (!await hasAdminPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "Admin permission required to clear all cache");
    }
    const cacheService = getUpstashCacheService();
    if (!cacheService.isEnabled()) {
      return {
        type: "cache_clear",
        enabled: false,
        message: "Cache service is not enabled"
      };
    }
    try {
      await cacheService.clearAll();
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("clear_cache_all", {
          admin_id: context.userId
        });
      }
      return {
        type: "cache_clear",
        message: "All cache cleared successfully"
      };
    } catch (error) {
      console.error("Failed to clear all cache:", error);
      throw createError("CACHE_ERROR", "Failed to clear all cache");
    }
  },
  /**
   * Get cache configuration
   */ get_cache_config: async (params, context)=>{
    // Check admin permissions
    if (!await hasAdminPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "Admin permission required to view cache configuration");
    }
    const cacheService = getUpstashCacheService();
    if (!cacheService.isEnabled()) {
      return {
        type: "cache_config",
        enabled: false,
        message: "Cache service is not enabled"
      };
    }
    // Import the TTL configuration
    const { CACHE_TTL } = await import("../services/upstash-cache.ts");
    return {
      type: "cache_config",
      enabled: true,
      data: {
        ttl: Object.entries(CACHE_TTL).map(([method, seconds])=>({
            method,
            ttl: seconds,
            ttlFormatted: seconds === 0 ? "No cache" : formatTTL(seconds)
          })).filter((item)=>item.ttl > 0),
        stats: {
          totalMethods: Object.keys(CACHE_TTL).length,
          cachedMethods: Object.values(CACHE_TTL).filter((ttl)=>ttl > 0).length,
          uncachedMethods: Object.values(CACHE_TTL).filter((ttl)=>ttl === 0).length
        }
      }
    };
  }
};
/**
 * Format TTL seconds to human-readable string
 */ function formatTTL(seconds) {
  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  } else if (seconds < 86400) {
    const hours = Math.floor(seconds / 3600);
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  } else {
    const days = Math.floor(seconds / 86400);
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
}
