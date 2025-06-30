// API Key Authentication Utilities
// Handles secure API key extraction, hashing, and validation
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
// API Key format regex
const API_KEY_REGEX = /^(sk|rk|pk|adm|test|demo|ro|rw)_[a-zA-Z0-9]{32,64}$/;
// Error types
export class AuthError extends Error {
  code;
  statusCode;
  constructor(message, code, statusCode = 401){
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = "AuthError";
  }
}
/**
 * Extract API key from various sources in the request
 */ export function extractApiKey(request) {
  // 1. Check Authorization header (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const match = authHeader.match(/^Bearer\s+(.+)$/i);
    if (match) {
      return match[1];
    }
  }
  // 2. Check X-API-Key header (most common for API keys)
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }
  // 3. Check query parameter (less secure, but sometimes needed)
  const url = new URL(request.url);
  const queryApiKey = url.searchParams.get("api_key");
  if (queryApiKey) {
    return queryApiKey;
  }
  // 4. Check custom headers (for backwards compatibility)
  const customHeader = request.headers.get("api-key");
  if (customHeader) {
    return customHeader;
  }
  return null;
}
/**
 * Validate API key format
 */ export function validateApiKeyFormat(apiKey) {
  if (!apiKey || typeof apiKey !== "string") {
    return false;
  }
  // Check against regex pattern
  if (!API_KEY_REGEX.test(apiKey)) {
    return false;
  }
  // Additional security checks
  const parts = apiKey.split("_");
  if (parts.length !== 2) {
    return false;
  }
  const [prefix, key] = parts;
  // Validate prefix
  const validPrefixes = [
    "sk",
    "rk",
    "pk",
    "adm",
    "test",
    "demo",
    "ro",
    "rw"
  ];
  if (!validPrefixes.includes(prefix)) {
    return false;
  }
  // Validate key length (should be at least 32 characters)
  if (key.length < 32) {
    return false;
  }
  return true;
}
/**
 * Hash API key using SHA-256
 */ export async function hashApiKey(apiKey) {
  const encoder = new TextEncoder();
  const data = encoder.encode(apiKey);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b)=>b.toString(16).padStart(2, "0")).join("");
}
/**
 * Extract key prefix from API key
 */ export function extractKeyPrefix(apiKey) {
  const parts = apiKey.split("_");
  return parts[0] || "";
}
/**
 * Verify API key against database
 */ export async function verifyApiKey(apiKey, supabaseUrl, supabaseServiceKey) {
  // Validate format first
  if (!validateApiKeyFormat(apiKey)) {
    throw new AuthError("Invalid API key format", "INVALID_KEY_FORMAT", 400);
  }
  // Initialize Supabase client
  const url = supabaseUrl || Deno.env.get("SUPABASE_URL");
  const serviceKey = supabaseServiceKey || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !serviceKey) {
    throw new AuthError("Server configuration error", "SERVER_ERROR", 500);
  }
  const supabase = createClient(url, serviceKey);
  // Hash the API key
  const keyHash = await hashApiKey(apiKey);
  const keyPrefix = extractKeyPrefix(apiKey);
  // Call the database verification function
  console.log("Verifying API key:", {
    keyPrefix,
    keyLength: apiKey.length
  });
  const { data, error } = await supabase.rpc("validate_api_key", {
    p_api_key: apiKey,
    p_ip_address: null,
    p_user_agent: null
  });
  if (error) {
    console.error("Database error during API key verification:", error);
    throw new AuthError("Failed to verify API key", "VERIFICATION_ERROR", 500);
  }
  console.log("API key verification result:", data);
  // RPC returns array for functions with RETURNS TABLE
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || !result.is_valid) {
    const message = result?.message || "Invalid or expired API key";
    throw new AuthError(message, "INVALID_API_KEY", 401);
  }
  // Note: Last used timestamp is already updated by the validate_api_key function
  // So we don't need to update it here
  // Parse permissions from JSONB
  const permissions = Array.isArray(result.permissions) ? result.permissions : Object.keys(result.permissions || {});
  return {
    id: result.api_key_id,
    userId: result.user_id,
    resumeId: result.resume_id,
    permissions,
    rateLimit: result.rate_limit || 1000,
    keyPrefix,
    metadata: result.metadata || {}
  };
}
/**
 * Check if API key has specific permission
 */ export function hasPermission(context, resource, action = "read") {
  const { permissions } = context;
  // Check for admin permission (has all access)
  if (permissions.includes("admin") || permissions.includes("*")) {
    return true;
  }
  // Check for specific resource:action permission
  const specificPermission = `${resource}:${action}`;
  if (permissions.includes(specificPermission)) {
    return true;
  }
  // Check for wildcard resource permission
  const wildcardResource = `${resource}:*`;
  if (permissions.includes(wildcardResource)) {
    return true;
  }
  // Check for wildcard action permission
  const wildcardAction = `*:${action}`;
  if (permissions.includes(wildcardAction)) {
    return true;
  }
  // Check for general action permission (e.g., "read", "write")
  if (permissions.includes(action)) {
    return true;
  }
  return false;
}
/**
 * Create auth middleware for Supabase Edge Functions
 */ export function createAuthMiddleware(options) {
  return async (req, context, next)=>{
    try {
      const apiKey = extractApiKey(req);
      if (!apiKey) {
        if (options?.requireAuth) {
          throw new AuthError("API key is required", "MISSING_API_KEY", 401);
        }
        // Continue without auth if not required
        return next();
      }
      // Verify the API key
      const authContext = await verifyApiKey(apiKey);
      // Check required permissions
      if (options?.requiredPermissions) {
        for (const { resource, action } of options.requiredPermissions){
          if (!hasPermission(authContext, resource, action)) {
            throw new AuthError(`Insufficient permissions for ${resource}:${action}`, "FORBIDDEN", 403);
          }
        }
      }
      // Add auth context to request context
      context.auth = authContext;
      // Continue to next middleware/handler
      return next();
    } catch (error) {
      if (error instanceof AuthError) {
        return new Response(JSON.stringify({
          error: {
            code: error.code,
            message: error.message
          }
        }), {
          status: error.statusCode,
          headers: {
            "Content-Type": "application/json"
          }
        });
      }
      // Unknown error
      console.error("Auth middleware error:", error);
      return new Response(JSON.stringify({
        error: {
          code: "INTERNAL_ERROR",
          message: "An error occurred during authentication"
        }
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json"
        }
      });
    }
  };
}
/**
 * Generate a new API key (for testing/admin use)
 */ export function generateApiKey(prefix = "sk") {
  const validPrefixes = [
    "sk",
    "rk",
    "pk",
    "adm",
    "test",
    "demo",
    "ro",
    "rw"
  ];
  if (!validPrefixes.includes(prefix)) {
    throw new Error(`Invalid key prefix: ${prefix}`);
  }
  // Generate 32 bytes of random data
  const randomBytes = crypto.getRandomValues(new Uint8Array(32));
  // Convert to base64 and remove special characters
  const key = btoa(String.fromCharCode(...randomBytes)).replace(/[+/=]/g, "").substring(0, 43); // Use 43 chars for consistent length
  return `${prefix}_${key}`;
}
/**
 * Constant-time string comparison to prevent timing attacks
 */ export function secureCompare(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  let result = 0;
  for(let i = 0; i < a.length; i++){
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
