// Permission Service
// Handles permission checking, caching, and scope management
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
export class PermissionService {
  supabase;
  constructor(supabaseUrl, supabaseServiceKey){
    const url = supabaseUrl || Deno.env.get("SUPABASE_URL");
    const key = supabaseServiceKey || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    this.supabase = createClient(url, key);
  }
  /**
   * Get expanded permissions for an API key including scopes
   */ async getExpandedPermissions(apiKeyId) {
    // Check cache first
    const cached = permissionCache.get(apiKeyId);
    if (cached && cached.expiresAt > Date.now()) {
      return {
        permissions: cached.permissions,
        scopes: cached.scopes
      };
    }
    // Get base permissions from API key
    const { data: apiKey, error: keyError } = await this.supabase.from("api_keys").select("permissions").eq("id", apiKeyId).single();
    if (keyError || !apiKey) {
      throw new Error("Failed to fetch API key permissions");
    }
    // Get scope-based permissions
    const { data: scopeMappings, error: scopeError } = await this.supabase.from("api_key_scope_mappings").select(`
        scope_id,
        api_key_scopes!inner (
          name,
          resource_pattern,
          is_active
        )
      `).eq("api_key_id", apiKeyId);
    if (scopeError) {
      console.error("Failed to fetch scope mappings:", scopeError);
    }
    // Parse permissions
    const basePermissions = this.parsePermissions(apiKey.permissions);
    const scopePermissions = this.parseScopePermissions(scopeMappings || []);
    // Combine permissions
    const allPermissions = new Set([
      ...basePermissions
    ]);
    const resourceScopes = new Map();
    // Add scope-based permissions
    for (const scope of scopePermissions){
      allPermissions.add(scope);
      // Parse resource:action format
      const [resource, action] = scope.split(":");
      if (resource && action) {
        if (!resourceScopes.has(resource)) {
          resourceScopes.set(resource, new Set());
        }
        resourceScopes.get(resource).add(action);
      }
    }
    // Convert to array format
    const scopes = Array.from(resourceScopes.entries()).map(([resource, actions])=>({
        resource,
        actions: Array.from(actions)
      }));
    // Cache the result
    const result = {
      permissions: Array.from(allPermissions),
      scopes
    };
    permissionCache.set(apiKeyId, {
      ...result,
      expiresAt: Date.now() + CACHE_TTL
    });
    return result;
  }
  /**
   * Check if API key has a specific permission
   */ async checkPermission(apiKeyId, resource, action) {
    const { permissions } = await this.getExpandedPermissions(apiKeyId);
    // Check for admin/wildcard permissions
    if (permissions.includes("admin") || permissions.includes("*")) {
      return true;
    }
    // Check specific permission
    const specificPerm = `${resource}:${action}`;
    if (permissions.includes(specificPerm)) {
      return true;
    }
    // Check wildcard patterns
    if (permissions.includes(`${resource}:*`) || permissions.includes(`*:${action}`) || permissions.includes(action)) {
      return true;
    }
    return false;
  }
  /**
   * Check multiple permissions at once
   */ async checkPermissions(apiKeyId, requirements) {
    const { permissions } = await this.getExpandedPermissions(apiKeyId);
    const missing = [];
    // Check for admin access
    if (permissions.includes("admin") || permissions.includes("*")) {
      return {
        allowed: true,
        missing: []
      };
    }
    for (const { resource, action } of requirements){
      const hasPermission = permissions.includes(`${resource}:${action}`) || permissions.includes(`${resource}:*`) || permissions.includes(`*:${action}`) || permissions.includes(action);
      if (!hasPermission) {
        missing.push({
          resource,
          action
        });
      }
    }
    return {
      allowed: missing.length === 0,
      missing
    };
  }
  /**
   * Get permission details for a specific check
   */ async getPermissionDetails(apiKeyId, resource, action) {
    const { permissions } = await this.getExpandedPermissions(apiKeyId);
    const grantedBy = [];
    // Check for exact match
    if (permissions.includes(`${resource}:${action}`)) {
      grantedBy.push(`${resource}:${action}`);
    }
    // Check for resource wildcard
    if (permissions.includes(`${resource}:*`)) {
      grantedBy.push(`${resource}:*`);
    }
    // Check for action wildcard
    if (permissions.includes(`*:${action}`)) {
      grantedBy.push(`*:${action}`);
    }
    // Check for global permissions
    if (permissions.includes(action)) {
      grantedBy.push(action);
    }
    // Check for admin
    if (permissions.includes("admin")) {
      grantedBy.push("admin");
    }
    // Check for wildcard
    if (permissions.includes("*")) {
      grantedBy.push("*");
    }
    if (grantedBy.length === 0) {
      return null;
    }
    return {
      grantedBy,
      effectivePermissions: permissions
    };
  }
  /**
   * Get all available scopes
   */ async getAvailableScopes() {
    const { data, error } = await this.supabase.from("api_key_scopes").select("*").eq("is_active", true).order("name");
    if (error) {
      throw new Error("Failed to fetch available scopes");
    }
    return data.map((scope)=>({
        id: scope.id,
        name: scope.name,
        description: scope.description,
        resourcePattern: scope.resource_pattern,
        isActive: scope.is_active
      }));
  }
  /**
   * Grant scopes to an API key
   */ async grantScopes(apiKeyId, scopeIds, grantedBy) {
    const mappings = scopeIds.map((scopeId)=>({
        api_key_id: apiKeyId,
        scope_id: scopeId,
        granted_by: grantedBy
      }));
    const { error } = await this.supabase.from("api_key_scope_mappings").insert(mappings);
    if (error) {
      throw new Error("Failed to grant scopes");
    }
    // Clear cache
    permissionCache.delete(apiKeyId);
  }
  /**
   * Revoke scopes from an API key
   */ async revokeScopes(apiKeyId, scopeIds) {
    const { error } = await this.supabase.from("api_key_scope_mappings").delete().eq("api_key_id", apiKeyId).in("scope_id", scopeIds);
    if (error) {
      throw new Error("Failed to revoke scopes");
    }
    // Clear cache
    permissionCache.delete(apiKeyId);
  }
  /**
   * Check rate limit permissions
   */ async getRateLimitOverride(apiKeyId) {
    const { data, error } = await this.supabase.from("api_keys").select("rate_limit, metadata").eq("id", apiKeyId).single();
    if (error || !data) {
      return null;
    }
    // Check for custom rate limit in metadata
    const customLimit = data.metadata?.rate_limit_override;
    return customLimit || data.rate_limit;
  }
  /**
   * Validate IP whitelist
   */ async validateIpWhitelist(apiKeyId, ipAddress) {
    const { data, error } = await this.supabase.from("api_keys").select("ip_whitelist").eq("id", apiKeyId).single();
    if (error || !data || !data.ip_whitelist) {
      return true; // No whitelist means all IPs allowed
    }
    // Check if IP is in whitelist
    return data.ip_whitelist.includes(ipAddress);
  }
  /**
   * Clear permission cache
   */ clearCache(apiKeyId) {
    if (apiKeyId) {
      permissionCache.delete(apiKeyId);
    } else {
      permissionCache.clear();
    }
  }
  /**
   * Parse permissions from JSONB
   */ parsePermissions(permissions) {
    if (Array.isArray(permissions)) {
      return permissions;
    }
    if (typeof permissions === "object" && permissions !== null) {
      return Object.keys(permissions);
    }
    return [];
  }
  /**
   * Parse scope permissions
   */ parseScopePermissions(scopeMappings) {
    const permissions = [];
    for (const mapping of scopeMappings){
      if (mapping.api_key_scopes?.is_active) {
        const pattern = mapping.api_key_scopes.resource_pattern;
        permissions.push(pattern);
      }
    }
    return permissions;
  }
}
// Singleton instance
let permissionService = null;
export function getPermissionService() {
  if (!permissionService) {
    permissionService = new PermissionService();
  }
  return permissionService;
}
