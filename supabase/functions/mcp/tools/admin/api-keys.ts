// API Key Management Tools - Admin Implementation
// MCP tools for managing API keys with admin privileges
import { createError } from "../../utils/errors.ts";
import { getApiKeyService } from "../../services/apiKey.ts";
import { getPermissionService } from "../../services/permissions.ts";
/**
 * Verify admin permissions
 */ async function verifyAdminAuth(context) {
  if (!context.apiKeyId) {
    throw createError("UNAUTHORIZED", "Authentication required");
  }
  const permissionService = getPermissionService();
  const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
  if (!hasAdmin) {
    throw createError("FORBIDDEN", "Admin privileges required");
  }
}
// API Key Admin tool handlers
export const handlers = {
  /**
   * Create a new API key
   */ create_api_key: async (params, context)=>{
    // Verify admin auth
    await verifyAdminAuth(context);
    const { userId, resumeId, name, permissions = [
      "read"
    ], rateLimit = 1000, expiresAt, ipWhitelist, rotationPolicy, metadata = {} } = params;
    // Validate required fields
    if (!name) {
      throw createError("INVALID_PARAMS", "Name is required");
    }
    // Use context userId if not provided (creating for self)
    const targetUserId = userId || context.userId;
    if (!targetUserId) {
      throw createError("INVALID_PARAMS", "User ID is required");
    }
    try {
      const apiKeyService = getApiKeyService();
      const { apiKey, details } = await apiKeyService.createApiKey(targetUserId, {
        resumeId,
        name,
        permissions,
        rateLimit,
        expiresAt,
        ipWhitelist,
        rotationPolicy,
        metadata
      });
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("create_api_key", {
          created_for_user: targetUserId,
          key_id: details.id,
          name,
          permissions,
          has_expiry: !!expiresAt
        });
      }
      return {
        type: "api_key_created",
        data: {
          id: details.id,
          apiKey,
          name: details.name,
          keyPrefix: details.keyPrefix,
          permissions: details.permissions,
          rateLimit: details.rateLimit,
          expiresAt: details.expiresAt,
          createdAt: details.createdAt
        },
        message: "API key created successfully. Save the key securely - it won't be shown again."
      };
    } catch (error) {
      console.error("Failed to create API key:", error);
      throw createError("INTERNAL_ERROR", "Failed to create API key: " + error.message);
    }
  },
  /**
   * List API keys with usage statistics
   */ list_api_keys: async (params, context)=>{
    // Verify admin auth
    await verifyAdminAuth(context);
    const { userId, resumeId, includeRevoked = false, includeExpired = false, limit = 50, offset = 0 } = params;
    try {
      const apiKeyService = getApiKeyService();
      // If userId is provided, list keys for that user
      // Otherwise, list all keys (admin view)
      let keys;
      if (userId) {
        keys = await apiKeyService.listUserApiKeys(userId, includeRevoked);
      } else {
        // Get all keys with pagination (admin view)
        keys = await apiKeyService.listAllApiKeys({
          includeRevoked,
          includeExpired,
          resumeId,
          limit,
          offset
        });
      }
      // Get usage statistics for each key
      const keysWithStats = await Promise.all(keys.map(async (key)=>{
        const stats = await apiKeyService.getApiKeyUsageStats(key.id);
        return {
          id: key.id,
          name: key.name,
          keyPrefix: key.keyPrefix,
          maskedKey: `${key.keyPrefix}_****`,
          userId: key.userId,
          resumeId: key.resumeId,
          permissions: key.permissions,
          rateLimit: key.rateLimit,
          isActive: key.isActive,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt,
          expiresAt: key.expiresAt,
          rotationPolicy: key.rotationPolicy,
          nextRotationDate: key.nextRotationDate,
          usageStats: {
            totalRequests: stats.totalRequests,
            successfulRequests: stats.successfulRequests,
            failedRequests: stats.failedRequests,
            averageResponseTime: stats.averageResponseTime,
            lastDayRequests: stats.lastDayRequests,
            lastWeekRequests: stats.lastWeekRequests,
            lastMonthRequests: stats.lastMonthRequests
          }
        };
      }));
      return {
        type: "api_keys_list",
        count: keysWithStats.length,
        data: keysWithStats,
        pagination: {
          limit,
          offset,
          hasMore: keys.length === limit
        }
      };
    } catch (error) {
      console.error("Failed to list API keys:", error);
      throw createError("INTERNAL_ERROR", "Failed to list API keys");
    }
  },
  /**
   * Update API key settings
   */ update_api_key: async (params, context)=>{
    // Verify admin auth
    await verifyAdminAuth(context);
    const { keyId, name, permissions, rateLimit, expiresAt, ipWhitelist, rotationPolicy, metadata } = params;
    if (!keyId) {
      throw createError("INVALID_PARAMS", "Key ID is required");
    }
    try {
      const apiKeyService = getApiKeyService();
      // Get current key details
      const currentKey = await apiKeyService.getApiKeyDetails(keyId);
      if (!currentKey) {
        throw createError("NOT_FOUND", "API key not found");
      }
      // Update the key
      await apiKeyService.updateApiKey(keyId, {
        name,
        permissions,
        rateLimit,
        expiresAt,
        ipWhitelist,
        rotationPolicy,
        metadata
      });
      // Get updated details
      const updatedKey = await apiKeyService.getApiKeyDetails(keyId);
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("update_api_key", {
          key_id: keyId,
          changes: Object.keys(params).filter((k)=>k !== "keyId")
        });
      }
      return {
        type: "api_key_updated",
        data: {
          id: updatedKey.id,
          name: updatedKey.name,
          permissions: updatedKey.permissions,
          rateLimit: updatedKey.rateLimit,
          expiresAt: updatedKey.expiresAt,
          ipWhitelist: updatedKey.metadata.ipWhitelist,
          rotationPolicy: updatedKey.rotationPolicy,
          nextRotationDate: updatedKey.nextRotationDate
        },
        message: "API key updated successfully"
      };
    } catch (error) {
      console.error("Failed to update API key:", error);
      throw createError("INTERNAL_ERROR", "Failed to update API key");
    }
  },
  /**
   * Revoke an API key
   */ revoke_api_key: async (params, context)=>{
    // Verify admin auth
    await verifyAdminAuth(context);
    const { keyId, reason = "Admin revocation" } = params;
    if (!keyId) {
      throw createError("INVALID_PARAMS", "Key ID is required");
    }
    try {
      const apiKeyService = getApiKeyService();
      // Get key details before revocation
      const keyDetails = await apiKeyService.getApiKeyDetails(keyId);
      if (!keyDetails) {
        throw createError("NOT_FOUND", "API key not found");
      }
      if (!keyDetails.isActive) {
        throw createError("INVALID_REQUEST", "API key is already revoked");
      }
      // Revoke the key
      await apiKeyService.revokeApiKey(keyId, reason);
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("revoke_api_key", {
          key_id: keyId,
          key_name: keyDetails.name,
          reason
        });
      }
      return {
        type: "api_key_revoked",
        data: {
          id: keyId,
          name: keyDetails.name,
          revokedAt: new Date().toISOString(),
          reason
        },
        message: "API key revoked successfully"
      };
    } catch (error) {
      console.error("Failed to revoke API key:", error);
      throw createError("INTERNAL_ERROR", "Failed to revoke API key");
    }
  },
  /**
   * Rotate an API key
   */ rotate_api_key: async (params, context)=>{
    // Verify admin auth
    await verifyAdminAuth(context);
    const { keyId, reason = "manual" } = params;
    if (!keyId) {
      throw createError("INVALID_PARAMS", "Key ID is required");
    }
    try {
      const apiKeyService = getApiKeyService();
      // Get key details before rotation
      const keyDetails = await apiKeyService.getApiKeyDetails(keyId);
      if (!keyDetails) {
        throw createError("NOT_FOUND", "API key not found");
      }
      if (!keyDetails.isActive) {
        throw createError("INVALID_REQUEST", "Cannot rotate revoked API key");
      }
      // Rotate the key
      const result = await apiKeyService.rotateApiKey(keyId, reason, context.userId);
      if (!result.success) {
        throw createError("INTERNAL_ERROR", result.message);
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("rotate_api_key", {
          key_id: keyId,
          key_name: keyDetails.name,
          reason
        });
      }
      return {
        type: "api_key_rotated",
        data: {
          id: keyId,
          name: keyDetails.name,
          newApiKey: result.newApiKey,
          rotatedAt: new Date().toISOString(),
          reason
        },
        message: "API key rotated successfully. Save the new key securely - it won't be shown again."
      };
    } catch (error) {
      console.error("Failed to rotate API key:", error);
      throw createError("INTERNAL_ERROR", "Failed to rotate API key");
    }
  },
  /**
   * Get API key usage statistics
   */ get_api_key_stats: async (params, context)=>{
    // Verify admin auth
    await verifyAdminAuth(context);
    const { keyId, period = "30d" } = params;
    if (!keyId) {
      throw createError("INVALID_PARAMS", "Key ID is required");
    }
    try {
      const apiKeyService = getApiKeyService();
      // Get key details
      const keyDetails = await apiKeyService.getApiKeyDetails(keyId);
      if (!keyDetails) {
        throw createError("NOT_FOUND", "API key not found");
      }
      // Get detailed usage statistics
      const stats = await apiKeyService.getDetailedUsageStats(keyId, period);
      return {
        type: "api_key_stats",
        data: {
          keyId,
          keyName: keyDetails.name,
          period,
          summary: {
            totalRequests: stats.totalRequests,
            successfulRequests: stats.successfulRequests,
            failedRequests: stats.failedRequests,
            averageResponseTime: stats.averageResponseTime,
            peakHour: stats.peakHour,
            peakDay: stats.peakDay
          },
          byMethod: stats.byMethod,
          byStatus: stats.byStatus,
          byHour: stats.byHour,
          byDay: stats.byDay,
          errors: stats.topErrors,
          rateLimitInfo: {
            limit: keyDetails.rateLimit,
            remaining: stats.rateLimitRemaining,
            resetAt: stats.rateLimitResetAt
          }
        }
      };
    } catch (error) {
      console.error("Failed to get API key stats:", error);
      throw createError("INTERNAL_ERROR", "Failed to get API key statistics");
    }
  },
  /**
   * Verify API key permissions
   */ verify_api_key_permissions: async (params, context)=>{
    // Verify admin auth
    await verifyAdminAuth(context);
    const { keyId, resource, action } = params;
    if (!keyId || !resource || !action) {
      throw createError("INVALID_PARAMS", "Key ID, resource, and action are required");
    }
    try {
      const apiKeyService = getApiKeyService();
      const permissionService = getPermissionService();
      // Get key details
      const keyDetails = await apiKeyService.getApiKeyDetails(keyId);
      if (!keyDetails) {
        throw createError("NOT_FOUND", "API key not found");
      }
      // Check permission
      const hasPermission = await permissionService.checkPermission(keyId, resource, action);
      // Get permission details
      const permissionDetails = await permissionService.getPermissionDetails(keyId, resource, action);
      return {
        type: "permission_check",
        data: {
          keyId,
          keyName: keyDetails.name,
          resource,
          action,
          hasPermission,
          grantedBy: permissionDetails?.grantedBy || [],
          effectivePermissions: keyDetails.permissions,
          isActive: keyDetails.isActive,
          expiresAt: keyDetails.expiresAt
        }
      };
    } catch (error) {
      console.error("Failed to verify permissions:", error);
      throw createError("INTERNAL_ERROR", "Failed to verify permissions");
    }
  }
};
