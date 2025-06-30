// API Key Service
// Comprehensive API key management and verification
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { getPermissionService } from "./permissions.ts";
export class ApiKeyService {
  supabase;
  permissionService = getPermissionService();
  constructor(supabaseUrl, supabaseServiceKey){
    const url = supabaseUrl || Deno.env.get("SUPABASE_URL");
    const key = supabaseServiceKey || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    this.supabase = createClient(url, key);
  }
  /**
   * Comprehensive API key validation with all checks
   */ async validateApiKey(apiKey, ipAddress, userAgent) {
    try {
      // Use the database function for validation
      const { data, error } = await this.supabase.rpc("validate_api_key", {
        p_api_key: apiKey,
        p_ip_address: ipAddress || null,
        p_user_agent: userAgent || null
      });
      if (error) {
        console.error("API key validation error:", error);
        return {
          isValid: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Failed to validate API key"
          }
        };
      }
      if (!data || !data.is_valid) {
        return {
          isValid: false,
          error: {
            code: "INVALID_API_KEY",
            message: data?.message || "Invalid or expired API key"
          }
        };
      }
      // Get expanded permissions
      const { permissions } = await this.permissionService.getExpandedPermissions(data.api_key_id);
      // Extract key prefix
      const keyPrefix = apiKey.split("_")[0];
      const context = {
        id: data.api_key_id,
        userId: data.user_id,
        resumeId: data.resume_id,
        permissions,
        rateLimit: data.rate_limit || 1000,
        keyPrefix,
        metadata: data.metadata || {}
      };
      return {
        isValid: true,
        context
      };
    } catch (error) {
      console.error("Unexpected validation error:", error);
      return {
        isValid: false,
        error: {
          code: "INTERNAL_ERROR",
          message: "An unexpected error occurred during validation"
        }
      };
    }
  }
  /**
   * Get API key details (for management)
   */ async getApiKeyDetails(apiKeyId) {
    const { data, error } = await this.supabase.from("api_keys").select(`
        *,
        api_key_scope_mappings (
          scope_id,
          api_key_scopes (
            name,
            resource_pattern
          )
        )
      `).eq("id", apiKeyId).single();
    if (error || !data) {
      return null;
    }
    // Get expanded permissions
    const { permissions } = await this.permissionService.getExpandedPermissions(apiKeyId);
    return {
      id: data.id,
      userId: data.user_id,
      resumeId: data.resume_id,
      name: data.name,
      keyPrefix: data.key_prefix,
      permissions,
      rateLimit: data.rate_limit,
      createdAt: data.created_at,
      lastUsedAt: data.last_used_at,
      expiresAt: data.expires_at,
      isActive: data.is_active,
      metadata: data.metadata || {},
      usageCount: data.usage_count || 0,
      rotationPolicy: data.rotation_policy,
      nextRotationDate: data.next_rotation_date
    };
  }
  /**
   * Create a new API key
   */ async createApiKey(userId, options) {
    // Generate new API key
    const { data: keyData, error: keyError } = await this.supabase.rpc("generate_api_key", {
      p_prefix: options.resumeId ? "rk" : "sk"
    });
    if (keyError || !keyData) {
      throw new Error("Failed to generate API key");
    }
    const { api_key: apiKey, key_hash: keyHash } = keyData;
    // Calculate next rotation date
    let nextRotationDate = null;
    if (options.rotationPolicy && options.rotationPolicy !== "never") {
      const now = new Date();
      switch(options.rotationPolicy){
        case "monthly":
          nextRotationDate = new Date(now.setMonth(now.getMonth() + 1));
          break;
        case "quarterly":
          nextRotationDate = new Date(now.setMonth(now.getMonth() + 3));
          break;
        case "yearly":
          nextRotationDate = new Date(now.setFullYear(now.getFullYear() + 1));
          break;
      }
    }
    // Insert API key record
    const { data: newKey, error: insertError } = await this.supabase.from("api_keys").insert({
      user_id: userId,
      resume_id: options.resumeId,
      name: options.name,
      key_hash: keyHash,
      key_prefix: options.resumeId ? "rk" : "sk",
      permissions: options.permissions || [
        "read"
      ],
      rate_limit: options.rateLimit || 1000,
      expires_at: options.expiresAt,
      metadata: options.metadata || {},
      ip_whitelist: options.ipWhitelist,
      rotation_policy: options.rotationPolicy,
      next_rotation_date: nextRotationDate?.toISOString()
    }).select().single();
    if (insertError || !newKey) {
      throw new Error("Failed to create API key");
    }
    // Get full details
    const details = await this.getApiKeyDetails(newKey.id);
    if (!details) {
      throw new Error("Failed to retrieve API key details");
    }
    return {
      apiKey,
      details
    };
  }
  /**
   * Rotate an API key
   */ async rotateApiKey(apiKeyId, reason, rotatedBy) {
    const { data, error } = await this.supabase.rpc("rotate_api_key", {
      p_api_key_id: apiKeyId,
      p_reason: reason,
      p_user_id: rotatedBy || null
    });
    if (error || !data) {
      return {
        newApiKey: "",
        success: false,
        message: error?.message || "Failed to rotate API key"
      };
    }
    return {
      newApiKey: data.new_api_key,
      success: data.success,
      message: data.message
    };
  }
  /**
   * Revoke an API key
   */ async revokeApiKey(apiKeyId, reason) {
    const { error } = await this.supabase.from("api_keys").update({
      is_active: false,
      metadata: this.supabase.sql`
          COALESCE(metadata, '{}'::jsonb) || 
          jsonb_build_object('revoked_reason', ${reason || "Manual revocation"})
        `
    }).eq("id", apiKeyId);
    if (error) {
      throw new Error("Failed to revoke API key");
    }
    // Clear permission cache
    this.permissionService.clearCache(apiKeyId);
  }
  /**
   * List API keys for a user
   */ async listUserApiKeys(userId, includeRevoked = false) {
    let query = this.supabase.from("api_keys").select("*").eq("user_id", userId).order("created_at", {
      ascending: false
    });
    if (!includeRevoked) {
      query = query.eq("is_active", true);
    }
    const { data, error } = await query;
    if (error || !data) {
      return [];
    }
    // Get details for each key
    const details = await Promise.all(data.map((key)=>this.getApiKeyDetails(key.id)));
    return details.filter(Boolean);
  }
  /**
   * Check if API key needs rotation
   */ async checkRotationNeeded(apiKeyId) {
    const { data, error } = await this.supabase.from("api_keys").select("rotation_policy, next_rotation_date").eq("id", apiKeyId).single();
    if (error || !data) {
      return false;
    }
    if (data.rotation_policy === "never" || !data.next_rotation_date) {
      return false;
    }
    return new Date(data.next_rotation_date) <= new Date();
  }
  /**
   * Update API key metadata
   */ async updateApiKeyMetadata(apiKeyId, metadata) {
    const { error } = await this.supabase.from("api_keys").update({
      metadata: this.supabase.sql`
          COALESCE(metadata, '{}'::jsonb) || ${JSON.stringify(metadata)}::jsonb
        `
    }).eq("id", apiKeyId);
    if (error) {
      throw new Error("Failed to update API key metadata");
    }
  }
  /**
   * Get API key usage statistics
   */ async getApiKeyUsageStats(apiKeyId, startDate, endDate) {
    let query = this.supabase.from("api_usage_logs").select("*").eq("api_key_id", apiKeyId);
    if (startDate) {
      query = query.gte("created_at", startDate.toISOString());
    }
    if (endDate) {
      query = query.lte("created_at", endDate.toISOString());
    }
    const { data, error } = await query;
    if (error || !data) {
      return {
        totalRequests: 0,
        successfulRequests: 0,
        failedRequests: 0,
        averageResponseTime: 0,
        uniqueMethods: [],
        errorRate: 0
      };
    }
    const totalRequests = data.length;
    const successfulRequests = data.filter((log)=>log.response_status >= 200 && log.response_status < 300).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalResponseTime = data.reduce((sum, log)=>sum + (log.response_time_ms || 0), 0);
    const averageResponseTime = totalRequests > 0 ? Math.round(totalResponseTime / totalRequests) : 0;
    const uniqueMethods = [
      ...new Set(data.map((log)=>log.method))
    ];
    const errorRate = totalRequests > 0 ? Math.round(failedRequests / totalRequests * 100) : 0;
    return {
      totalRequests,
      successfulRequests,
      failedRequests,
      averageResponseTime,
      uniqueMethods,
      errorRate
    };
  }
  /**
   * List all API keys (admin function)
   */ async listAllApiKeys(options) {
    let query = this.supabase.from("api_keys").select("*").order("created_at", {
      ascending: false
    });
    if (!options.includeRevoked) {
      query = query.eq("is_active", true);
    }
    if (!options.includeExpired) {
      query = query.or("expires_at.is.null,expires_at.gt." + new Date().toISOString());
    }
    if (options.resumeId) {
      query = query.eq("resume_id", options.resumeId);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }
    if (options.offset) {
      query = query.range(options.offset, options.offset + (options.limit || 50) - 1);
    }
    const { data, error } = await query;
    if (error || !data) {
      return [];
    }
    // Get details for each key
    const details = await Promise.all(data.map((key)=>this.getApiKeyDetails(key.id)));
    return details.filter(Boolean);
  }
  /**
   * Update API key settings
   */ async updateApiKey(apiKeyId, updates) {
    const updateData = {};
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.permissions !== undefined) updateData.permissions = updates.permissions;
    if (updates.rateLimit !== undefined) updateData.rate_limit = updates.rateLimit;
    if (updates.expiresAt !== undefined) updateData.expires_at = updates.expiresAt;
    if (updates.ipWhitelist !== undefined) updateData.ip_whitelist = updates.ipWhitelist;
    if (updates.rotationPolicy !== undefined) updateData.rotation_policy = updates.rotationPolicy;
    // Calculate next rotation date if policy changed
    if (updates.rotationPolicy && updates.rotationPolicy !== null) {
      const now = new Date();
      let nextRotationDate = null;
      switch(updates.rotationPolicy){
        case "monthly":
          nextRotationDate = new Date(now.setMonth(now.getMonth() + 1));
          break;
        case "quarterly":
          nextRotationDate = new Date(now.setMonth(now.getMonth() + 3));
          break;
        case "yearly":
          nextRotationDate = new Date(now.setFullYear(now.getFullYear() + 1));
          break;
      }
      if (nextRotationDate) {
        updateData.next_rotation_date = nextRotationDate.toISOString();
      }
    }
    const { error } = await this.supabase.from("api_keys").update(updateData).eq("id", apiKeyId);
    if (error) {
      throw new Error("Failed to update API key");
    }
    // Update metadata separately if provided
    if (updates.metadata) {
      await this.updateApiKeyMetadata(apiKeyId, updates.metadata);
    }
    // Clear permission cache
    this.permissionService.clearCache(apiKeyId);
  }
  /**
   * Get detailed usage statistics for an API key
   */ async getDetailedUsageStats(apiKeyId, period = "30d") {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    switch(period){
      case "24h":
        startDate.setDate(endDate.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(endDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(endDate.getDate() - 30);
        break;
      case "90d":
        startDate.setDate(endDate.getDate() - 90);
        break;
    }
    // Get basic stats
    const basicStats = await this.getApiKeyUsageStats(apiKeyId, startDate, endDate);
    // Get detailed usage logs
    const { data: logs, error } = await this.supabase.from("api_key_usage").select("*").eq("api_key_id", apiKeyId).gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString()).order("created_at", {
      ascending: false
    });
    if (error || !logs) {
      return {
        ...basicStats,
        byMethod: {},
        byStatus: {},
        byHour: {},
        byDay: {},
        topErrors: [],
        peakHour: "N/A",
        peakDay: "N/A"
      };
    }
    // Calculate detailed stats
    const byMethod = {};
    const byStatus = {};
    const byHour = {};
    const byDay = {};
    const errors = {};
    logs.forEach((log)=>{
      // By method
      byMethod[log.method] = (byMethod[log.method] || 0) + 1;
      // By status
      const statusGroup = log.is_successful ? "success" : "failure";
      byStatus[statusGroup] = (byStatus[statusGroup] || 0) + 1;
      // By hour
      const hour = new Date(log.created_at).getHours().toString();
      byHour[hour] = (byHour[hour] || 0) + 1;
      // By day
      const day = new Date(log.created_at).toLocaleDateString();
      byDay[day] = (byDay[day] || 0) + 1;
      // Errors
      if (!log.is_successful && log.error_type) {
        errors[log.error_type] = (errors[log.error_type] || 0) + 1;
      }
    });
    // Find peak hour and day
    const peakHour = Object.entries(byHour).sort((a, b)=>b[1] - a[1])[0]?.[0] || "N/A";
    const peakDay = Object.entries(byDay).sort((a, b)=>b[1] - a[1])[0]?.[0] || "N/A";
    // Top errors
    const topErrors = Object.entries(errors).sort((a, b)=>b[1] - a[1]).slice(0, 5).map(([error, count])=>({
        error,
        count
      }));
    // Get rate limit info (if available from Redis)
    // This would need to be implemented with the rate limiter service
    // Get period-specific request counts
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const lastDayRequests = logs.filter((log)=>new Date(log.created_at) >= oneDayAgo).length;
    const lastWeekRequests = logs.filter((log)=>new Date(log.created_at) >= oneWeekAgo).length;
    const lastMonthRequests = logs.filter((log)=>new Date(log.created_at) >= oneMonthAgo).length;
    return {
      ...basicStats,
      byMethod,
      byStatus,
      byHour,
      byDay,
      topErrors,
      peakHour,
      peakDay,
      lastDayRequests,
      lastWeekRequests,
      lastMonthRequests
    };
  }
}
// Singleton instance
let apiKeyService = null;
export function getApiKeyService() {
  if (!apiKeyService) {
    apiKeyService = new ApiKeyService();
  }
  return apiKeyService;
}
