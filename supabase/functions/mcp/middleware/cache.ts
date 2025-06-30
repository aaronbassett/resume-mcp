// Cache Middleware for MCP Tools
// Provides caching functionality for tool handlers
import { getUpstashCacheService } from "../services/upstash-cache.ts";
/**
 * Cache middleware that wraps tool handlers to provide automatic caching
 */ export function withCache(methodName, handler) {
  return async (params, context)=>{
    const cache = getUpstashCacheService();
    // Skip caching if not enabled
    if (!cache.isEnabled()) {
      return handler(params, context);
    }
    // Determine resume ID
    const resumeId = params.resumeId || context.resumeId;
    if (!resumeId) {
      // Can't cache without resumeId
      return handler(params, context);
    }
    // Create cacheable context
    const cacheableContext = {
      ...context,
      method: methodName
    };
    // Check cache
    const cached = await cache.get(methodName, resumeId, params);
    if (cached.data) {
      // Add cache headers to response if supported
      if (cacheableContext.setHeaders && cached.headers) {
        cacheableContext.setHeaders(cached.headers);
      }
      // Add cache metadata to response
      if (typeof cached.data === "object" && cached.data !== null) {
        return {
          ...cached.data,
          _cache: {
            hit: true,
            method: methodName,
            headers: cached.headers
          }
        };
      }
      return cached.data;
    }
    // Execute handler
    const result = await handler(params, context);
    // Don't cache error responses
    if (result && typeof result === "object" && result.error) {
      return result;
    }
    // Cache the result
    await cache.set(methodName, resumeId, params, result);
    // Add cache metadata to response
    if (typeof result === "object" && result !== null) {
      return {
        ...result,
        _cache: {
          hit: false,
          method: methodName,
          headers: cached.headers
        }
      };
    }
    return result;
  };
}
/**
 * Cache invalidation helper for mutations
 */ export async function invalidateCache(resumeId, methods) {
  const cache = getUpstashCacheService();
  if (methods && methods.length > 0) {
    // Invalidate specific methods
    for (const method of methods){
      await cache.invalidateMethod(method, resumeId);
    }
  } else {
    // Invalidate all cache for resume
    await cache.invalidateResume(resumeId);
  }
}
/**
 * Get related methods that should be invalidated when data changes
 */ export function getRelatedMethods(mutationType) {
  const invalidationMap = {
    // Profile mutations
    "update_profile": [
      "get_profile_basics",
      "get_contact_info",
      "get_summary",
      "get_complete_resume"
    ],
    // Experience mutations
    "create_experience": [
      "list_all_experiences",
      "get_experience_by_company",
      "get_complete_resume",
      "find_relevant_experience"
    ],
    "update_experience": [
      "list_all_experiences",
      "get_experience_by_company",
      "get_experience_details",
      "get_complete_resume",
      "find_relevant_experience"
    ],
    "delete_experience": [
      "list_all_experiences",
      "get_experience_by_company",
      "get_complete_resume",
      "find_relevant_experience"
    ],
    // Skills mutations
    "create_skill": [
      "list_all_skills",
      "get_skills_by_category",
      "search_skills",
      "get_complete_resume"
    ],
    "update_skill": [
      "list_all_skills",
      "get_skills_by_category",
      "search_skills",
      "get_complete_resume"
    ],
    "delete_skill": [
      "list_all_skills",
      "get_skills_by_category",
      "search_skills",
      "get_complete_resume"
    ],
    // Project mutations
    "create_project": [
      "list_projects",
      "get_projects_by_technology",
      "get_featured_projects",
      "get_complete_resume"
    ],
    "update_project": [
      "list_projects",
      "get_projects_by_technology",
      "get_featured_projects",
      "get_project_details",
      "get_complete_resume"
    ],
    "delete_project": [
      "list_projects",
      "get_projects_by_technology",
      "get_featured_projects",
      "get_complete_resume"
    ],
    // Education mutations
    "create_education": [
      "list_education",
      "get_highest_degree",
      "get_complete_resume"
    ],
    "update_education": [
      "list_education",
      "get_highest_degree",
      "get_complete_resume"
    ],
    "delete_education": [
      "list_education",
      "get_highest_degree",
      "get_complete_resume"
    ],
    // Certification mutations
    "create_certification": [
      "list_certifications",
      "get_active_certifications",
      "get_expiring_certifications",
      "get_complete_resume"
    ],
    "update_certification": [
      "list_certifications",
      "get_active_certifications",
      "get_expiring_certifications",
      "get_complete_resume"
    ],
    "delete_certification": [
      "list_certifications",
      "get_active_certifications",
      "get_expiring_certifications",
      "get_complete_resume"
    ]
  };
  return invalidationMap[mutationType] || [];
}
/**
 * Decorator for mutation handlers that automatically invalidates related caches
 */ export function withCacheInvalidation(mutationType, handler) {
  return async (params, context)=>{
    // Execute the mutation
    const result = await handler(params, context);
    // If mutation was successful, invalidate related caches
    if (result && !result.error) {
      const resumeId = params.resumeId || context.resumeId;
      if (resumeId) {
        const relatedMethods = getRelatedMethods(mutationType);
        await invalidateCache(resumeId, relatedMethods);
      }
    }
    return result;
  };
}
/**
 * Batch cache operations for multiple tools
 */ export class CacheBatch {
  operations = [];
  add(method, resumeId, params = {}) {
    this.operations.push({
      method,
      resumeId,
      params
    });
  }
  async checkAll() {
    const cache = getUpstashCacheService();
    const results = new Map();
    // Check all operations in parallel
    await Promise.all(this.operations.map(async (op)=>{
      const key = `${op.method}:${op.resumeId}:${JSON.stringify(op.params)}`;
      const cached = await cache.get(op.method, op.resumeId, op.params);
      if (cached.data) {
        results.set(key, cached.data);
      }
    }));
    return results;
  }
  async setAll(data) {
    const cache = getUpstashCacheService();
    // Set all operations in parallel
    await Promise.all(Array.from(data.entries()).map(async ([key, value])=>{
      // Parse key to get method, resumeId, params
      const parts = key.split(":");
      const method = parts[0];
      const resumeId = parts[1];
      const params = JSON.parse(parts.slice(2).join(":"));
      await cache.set(method, resumeId, params, value);
    }));
  }
}
