// Authentication Middleware
// Integrates API key verification with the MCP request pipeline
import { verifyApiKey, extractApiKey, hasPermission } from "../utils/auth.ts";
import { createError } from "../utils/errors.ts";
/**
 * Create authentication middleware for MCP requests
 */ export function createAuthMiddleware() {
  return async (params, context, next)=>{
    try {
      // Get the request from global context (set by handler)
      const request = globalThis.currentRequest;
      if (!request) {
        throw createError("INTERNAL_ERROR", "Request context not available");
      }
      // Extract API key
      const apiKey = extractApiKey(request);
      if (!apiKey) {
        throw createError("UNAUTHORIZED", "API key is required in x-api-key header");
      }
      // Verify API key and get context
      const authContext = await verifyApiKey(apiKey);
      // Add auth context to MCP context
      context.apiKeyId = authContext.id;
      context.userId = authContext.userId;
      context.resumeId = authContext.resumeId;
      context.permissions = authContext.permissions;
      // Store additional auth info
      context.auth = {
        keyPrefix: authContext.keyPrefix,
        rateLimit: authContext.rateLimit,
        metadata: authContext.metadata
      };
      // Extract IP and user agent for RLS and logging
      context.ipAddress = request.headers.get("x-forwarded-for") || request.headers.get("cf-connecting-ip") || "0.0.0.0";
      context.userAgent = request.headers.get("user-agent") || undefined;
      // Set API key context for RLS policies
      const supabase = globalThis.supabaseClient;
      if (supabase) {
        await supabase.rpc("set_api_key_context", {
          p_api_key_hash: await hashApiKey(apiKey)
        });
      }
      // Check method-specific permissions
      const methodPermissions = getMethodPermissions(context.method || "");
      if (methodPermissions) {
        for (const { resource, action } of methodPermissions){
          if (!hasPermission(authContext, resource, action)) {
            throw createError("FORBIDDEN", `Insufficient permissions for ${resource}:${action}`);
          }
        }
      }
      // Log successful authentication
      if (context.monitor) {
        await context.monitor.logAudit("api_key_authenticated", "api_key", authContext.id, {
          metadata: {
            method: context.method,
            ip: context.ipAddress,
            userAgent: context.userAgent
          }
        });
      }
      // Continue to next middleware
      return await next(params, context);
    } catch (error) {
      // Log authentication failure
      if (context.monitor) {
        await context.monitor.logError(error, {
          method: context.method || "unknown",
          params,
          severity: "high"
        });
      }
      // Re-throw the error for error handler
      throw error;
    }
  };
}
/**
 * Get required permissions for each MCP method
 */ function getMethodPermissions(method) {
  const permissionMap = {
    // Profile methods
    "get_profile_basics": [
      {
        resource: "profile",
        action: "read"
      }
    ],
    "update_profile": [
      {
        resource: "profile",
        action: "write"
      }
    ],
    // Contact methods
    "get_contact_info": [
      {
        resource: "contact",
        action: "read"
      }
    ],
    "update_contact": [
      {
        resource: "contact",
        action: "write"
      }
    ],
    // Experience methods
    "list_all_experiences": [
      {
        resource: "experience",
        action: "read"
      }
    ],
    "get_experience_by_company": [
      {
        resource: "experience",
        action: "read"
      }
    ],
    "get_experience_by_role": [
      {
        resource: "experience",
        action: "read"
      }
    ],
    "get_recent_experience": [
      {
        resource: "experience",
        action: "read"
      }
    ],
    "create_experience": [
      {
        resource: "experience",
        action: "write"
      }
    ],
    "update_experience": [
      {
        resource: "experience",
        action: "write"
      }
    ],
    "delete_experience": [
      {
        resource: "experience",
        action: "delete"
      }
    ],
    "search_experiences": [
      {
        resource: "experience",
        action: "read"
      }
    ],
    // Skills methods
    "list_all_skills": [
      {
        resource: "skills",
        action: "read"
      }
    ],
    "get_skills_by_category": [
      {
        resource: "skills",
        action: "read"
      }
    ],
    "search_skills": [
      {
        resource: "skills",
        action: "read"
      }
    ],
    "add_skill": [
      {
        resource: "skills",
        action: "write"
      }
    ],
    "update_skill": [
      {
        resource: "skills",
        action: "write"
      }
    ],
    "delete_skill": [
      {
        resource: "skills",
        action: "delete"
      }
    ],
    // Projects methods
    "list_projects": [
      {
        resource: "projects",
        action: "read"
      }
    ],
    "get_featured_projects": [
      {
        resource: "projects",
        action: "read"
      }
    ],
    "search_projects_by_tech": [
      {
        resource: "projects",
        action: "read"
      }
    ],
    "create_project": [
      {
        resource: "projects",
        action: "write"
      }
    ],
    "update_project": [
      {
        resource: "projects",
        action: "write"
      }
    ],
    "delete_project": [
      {
        resource: "projects",
        action: "delete"
      }
    ],
    // Education methods
    "list_education": [
      {
        resource: "education",
        action: "read"
      }
    ],
    "get_highest_degree": [
      {
        resource: "education",
        action: "read"
      }
    ],
    "add_education": [
      {
        resource: "education",
        action: "write"
      }
    ],
    "update_education": [
      {
        resource: "education",
        action: "write"
      }
    ],
    "delete_education": [
      {
        resource: "education",
        action: "delete"
      }
    ],
    // Certifications methods
    "list_certifications": [
      {
        resource: "certifications",
        action: "read"
      }
    ],
    "get_active_certifications": [
      {
        resource: "certifications",
        action: "read"
      }
    ],
    "add_certification": [
      {
        resource: "certifications",
        action: "write"
      }
    ],
    "update_certification": [
      {
        resource: "certifications",
        action: "write"
      }
    ],
    "delete_certification": [
      {
        resource: "certifications",
        action: "delete"
      }
    ],
    // Resume methods
    "get_complete_resume": [
      {
        resource: "resume",
        action: "read"
      }
    ],
    "generate_custom_resume": [
      {
        resource: "resume",
        action: "read"
      },
      {
        resource: "resume",
        action: "write"
      }
    ],
    // AI methods
    "get_ai_suggestions": [
      {
        resource: "resume",
        action: "read"
      },
      {
        resource: "ai",
        action: "read"
      }
    ],
    "apply_ai_suggestion": [
      {
        resource: "resume",
        action: "write"
      },
      {
        resource: "ai",
        action: "write"
      }
    ],
    // Analytics methods
    "track_view": [
      {
        resource: "analytics",
        action: "write"
      }
    ],
    "get_analytics": [
      {
        resource: "analytics",
        action: "read"
      }
    ],
    // API key management (admin only)
    "create_api_key": [
      {
        resource: "api_keys",
        action: "write"
      }
    ],
    "list_api_keys": [
      {
        resource: "api_keys",
        action: "read"
      }
    ],
    "revoke_api_key": [
      {
        resource: "api_keys",
        action: "delete"
      }
    ],
    "rotate_api_key": [
      {
        resource: "api_keys",
        action: "write"
      }
    ]
  };
  return permissionMap[method] || null;
}
/**
 * Hash API key for RLS context
 */ async function hashApiKey(apiKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b)=>b.toString(16).padStart(2, "0")).join("");
}
/**
 * Create a middleware that checks for specific permissions
 */ export function requirePermissions(permissions) {
  return async (params, context, next)=>{
    // Check if auth context exists
    const authContext = context.auth;
    if (!authContext) {
      throw createError("UNAUTHORIZED", "Authentication required");
    }
    // Check each required permission
    for (const { resource, action } of permissions){
      if (!hasPermission(authContext, resource, action)) {
        throw createError("FORBIDDEN", `Missing required permission: ${resource}:${action}`);
      }
    }
    return await next(params, context);
  };
}
/**
 * Create a middleware that allows anonymous access
 */ export function allowAnonymous() {
  return async (params, context, next)=>{
    // Mark context as allowing anonymous access
    context.allowAnonymous = true;
    return await next(params, context);
  };
}
