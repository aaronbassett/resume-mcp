// Admin Tools for Injection Detection Management
// Review and manage captured injection attempts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../../utils/errors.ts";
import { getPermissionService } from "../../services/permissions.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Check if user has admin permissions
 */ async function hasAdminPermission(apiKeyId) {
  const permissionService = getPermissionService();
  return await permissionService.checkPermission(apiKeyId, "admin", "*");
}
// Admin handlers for injection detection
const handlers = {
  /**
   * List captured injection attempts
   */ list_injection_captures: async (params, context)=>{
    const { userId, apiKeyId, dateRange, limit = 50, offset = 0, minConfidence = 0 } = params;
    // Verify admin permissions
    if (!await hasAdminPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "Admin permission required");
    }
    try {
      // Build query
      let query = supabase.from("injection_captures").select("*, api_keys(name, description), users(email)", {
        count: "exact"
      }).gte("confidence_score", minConfidence).order("captured_at", {
        ascending: false
      }).range(offset, offset + limit - 1);
      // Apply filters
      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (apiKeyId) {
        query = query.eq("api_key_id", apiKeyId);
      }
      if (dateRange) {
        query = query.gte("captured_at", dateRange.start).lte("captured_at", dateRange.end);
      }
      const { data: captures, error, count } = await query;
      if (error) {
        throw error;
      }
      // Format response
      const formattedCaptures = captures?.map((capture)=>({
          id: capture.id,
          apiKeyId: capture.api_key_id,
          apiKeyName: capture.api_keys?.name,
          userId: capture.user_id,
          userEmail: capture.users?.email,
          requestId: capture.request_id,
          transactionId: capture.transaction_id,
          method: capture.method,
          responseText: capture.response_text,
          wrapperType: capture.wrapper_type,
          confidenceScore: capture.confidence_score,
          capturedAt: capture.captured_at,
          reviewed: capture.reviewed,
          reviewedBy: capture.reviewed_by,
          reviewedAt: capture.reviewed_at,
          reviewNotes: capture.review_notes
        }));
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("list_injection_captures", {
          filters: {
            userId,
            apiKeyId,
            dateRange,
            minConfidence
          },
          results: count
        });
      }
      return {
        type: "injection_captures",
        data: {
          captures: formattedCaptures,
          total: count || 0,
          limit,
          offset,
          hasMore: (count || 0) > offset + limit
        }
      };
    } catch (error) {
      console.error("Failed to list injection captures:", error);
      throw createError("DATABASE_ERROR", "Failed to retrieve injection captures");
    }
  },
  /**
   * Get detailed injection capture
   */ get_injection_capture: async (params, context)=>{
    const { captureId } = params;
    if (!captureId) {
      throw createError("INVALID_INPUT", "Capture ID is required");
    }
    // Verify admin permissions
    if (!await hasAdminPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "Admin permission required");
    }
    try {
      const { data: capture, error } = await supabase.from("injection_captures").select(`
          *,
          api_keys(id, name, description, permissions),
          users(id, email, created_at),
          request_logs(
            method,
            params,
            response_status,
            response_time_ms,
            ip_address,
            user_agent
          )
        `).eq("id", captureId).single();
      if (error || !capture) {
        throw createError("NOT_FOUND", "Injection capture not found");
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("get_injection_capture", {
          capture_id: captureId
        });
      }
      return {
        type: "injection_capture_detail",
        data: {
          id: capture.id,
          apiKey: {
            id: capture.api_keys.id,
            name: capture.api_keys.name,
            description: capture.api_keys.description,
            permissions: capture.api_keys.permissions
          },
          user: {
            id: capture.users.id,
            email: capture.users.email,
            createdAt: capture.users.created_at
          },
          request: capture.request_logs ? {
            method: capture.request_logs.method,
            params: capture.request_logs.params,
            responseStatus: capture.request_logs.response_status,
            responseTimeMs: capture.request_logs.response_time_ms,
            ipAddress: capture.request_logs.ip_address,
            userAgent: capture.request_logs.user_agent
          } : null,
          capture: {
            requestId: capture.request_id,
            transactionId: capture.transaction_id,
            method: capture.method,
            responseText: capture.response_text,
            wrapperType: capture.wrapper_type,
            confidenceScore: capture.confidence_score,
            capturedAt: capture.captured_at
          },
          review: {
            reviewed: capture.reviewed,
            reviewedBy: capture.reviewed_by,
            reviewedAt: capture.reviewed_at,
            reviewNotes: capture.review_notes
          }
        }
      };
    } catch (error) {
      console.error("Failed to get injection capture:", error);
      throw createError("DATABASE_ERROR", "Failed to retrieve injection capture details");
    }
  },
  /**
   * Review and mark injection capture
   */ review_injection_capture: async (params, context)=>{
    const { captureId, reviewNotes, action } = params;
    if (!captureId || !action) {
      throw createError("INVALID_INPUT", "Capture ID and action are required");
    }
    // Verify admin permissions
    if (!await hasAdminPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "Admin permission required");
    }
    try {
      // Get admin user ID
      const { data: adminKey } = await supabase.from("api_keys").select("user_id").eq("id", context.apiKeyId).single();
      if (!adminKey) {
        throw createError("NOT_FOUND", "Admin key not found");
      }
      // Update capture with review
      const { data: capture, error } = await supabase.from("injection_captures").update({
        reviewed: true,
        reviewed_by: adminKey.user_id,
        reviewed_at: new Date().toISOString(),
        review_notes: reviewNotes,
        review_action: action
      }).eq("id", captureId).select().single();
      if (error || !capture) {
        throw createError("NOT_FOUND", "Failed to update injection capture");
      }
      // If verified as injection attempt, take action
      if (action === "verified") {
      // You could implement additional actions here:
      // - Flag the API key
      // - Send notification
      // - Increment violation counter
      // - Apply rate limiting
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("review_injection_capture", {
          capture_id: captureId,
          action,
          review_notes: reviewNotes
        });
      }
      return {
        type: "review_result",
        data: {
          captureId,
          action,
          reviewed: true,
          reviewedAt: capture.reviewed_at,
          message: `Injection capture marked as ${action}`
        }
      };
    } catch (error) {
      console.error("Failed to review injection capture:", error);
      throw createError("DATABASE_ERROR", "Failed to review injection capture");
    }
  },
  /**
   * Get injection detection statistics
   */ get_injection_stats: async (params, context)=>{
    const { dateRange, groupBy = "day" } = params;
    // Verify admin permissions
    if (!await hasAdminPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "Admin permission required");
    }
    // Set default date range (last 30 days)
    const endDate = dateRange?.end || new Date().toISOString();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    try {
      // Get all captures in date range
      const { data: captures, error } = await supabase.from("injection_captures").select("*").gte("captured_at", startDate).lte("captured_at", endDate).order("captured_at", {
        ascending: true
      });
      if (error) {
        throw error;
      }
      // Calculate statistics
      const stats = {
        totalCaptures: captures?.length || 0,
        highConfidence: captures?.filter((c)=>c.confidence_score >= 0.8).length || 0,
        mediumConfidence: captures?.filter((c)=>c.confidence_score >= 0.5 && c.confidence_score < 0.8).length || 0,
        lowConfidence: captures?.filter((c)=>c.confidence_score < 0.5).length || 0,
        reviewed: captures?.filter((c)=>c.reviewed).length || 0,
        unreviewed: captures?.filter((c)=>!c.reviewed).length || 0,
        verifiedAttempts: captures?.filter((c)=>c.review_action === "verified").length || 0,
        falsePositives: captures?.filter((c)=>c.review_action === "false_positive").length || 0,
        byMethod: {},
        byWrapperType: {},
        byApiKey: {},
        timeSeries: []
      };
      // Group by method and wrapper type
      captures?.forEach((capture)=>{
        stats.byMethod[capture.method] = (stats.byMethod[capture.method] || 0) + 1;
        stats.byWrapperType[capture.wrapper_type] = (stats.byWrapperType[capture.wrapper_type] || 0) + 1;
        stats.byApiKey[capture.api_key_id] = (stats.byApiKey[capture.api_key_id] || 0) + 1;
      });
      // Create time series data
      const timeSeriesMap = new Map();
      captures?.forEach((capture)=>{
        const date = new Date(capture.captured_at);
        let timeKey;
        switch(groupBy){
          case "hour":
            timeKey = date.toISOString().substring(0, 13) + ":00:00Z";
            break;
          case "week":
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            weekStart.setHours(0, 0, 0, 0);
            timeKey = weekStart.toISOString();
            break;
          case "month":
            timeKey = date.toISOString().substring(0, 7) + "-01T00:00:00Z";
            break;
          default:
            timeKey = date.toISOString().substring(0, 10) + "T00:00:00Z";
        }
        timeSeriesMap.set(timeKey, (timeSeriesMap.get(timeKey) || 0) + 1);
      });
      stats.timeSeries = Array.from(timeSeriesMap.entries()).map(([timestamp, count])=>({
          timestamp,
          count
        })).sort((a, b)=>a.timestamp.localeCompare(b.timestamp));
      // Get top offending API keys
      const topApiKeys = Object.entries(stats.byApiKey).sort((a, b)=>b[1] - a[1]).slice(0, 10).map(([apiKeyId, count])=>({
          apiKeyId,
          count
        }));
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("get_injection_stats", {
          date_range: {
            start: startDate,
            end: endDate
          },
          group_by: groupBy
        });
      }
      return {
        type: "injection_statistics",
        data: {
          dateRange: {
            start: startDate,
            end: endDate
          },
          summary: {
            total: stats.totalCaptures,
            highConfidence: stats.highConfidence,
            mediumConfidence: stats.mediumConfidence,
            lowConfidence: stats.lowConfidence,
            reviewed: stats.reviewed,
            unreviewed: stats.unreviewed,
            verified: stats.verifiedAttempts,
            falsePositives: stats.falsePositives
          },
          byMethod: stats.byMethod,
          byWrapperType: stats.byWrapperType,
          topApiKeys,
          timeSeries: stats.timeSeries
        }
      };
    } catch (error) {
      console.error("Failed to get injection statistics:", error);
      throw createError("DATABASE_ERROR", "Failed to retrieve injection statistics");
    }
  },
  /**
   * Configure injection detection for an API key
   */ configure_injection_detection: async (params, context)=>{
    const { apiKeyId, enabled } = params;
    if (!apiKeyId || enabled === undefined) {
      throw createError("INVALID_INPUT", "API key ID and enabled status are required");
    }
    // Verify admin permissions
    if (!await hasAdminPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "Admin permission required");
    }
    try {
      // Check if settings exist
      const { data: existing } = await supabase.from("api_key_settings").select("id").eq("api_key_id", apiKeyId).single();
      let result;
      if (existing) {
        // Update existing settings
        const { data, error } = await supabase.from("api_key_settings").update({
          injection_detection_enabled: enabled,
          updated_at: new Date().toISOString()
        }).eq("api_key_id", apiKeyId).select().single();
        if (error) {
          throw error;
        }
        result = data;
      } else {
        // Create new settings
        const { data, error } = await supabase.from("api_key_settings").insert({
          api_key_id: apiKeyId,
          injection_detection_enabled: enabled
        }).select().single();
        if (error) {
          throw error;
        }
        result = data;
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("configure_injection_detection", {
          api_key_id: apiKeyId,
          enabled
        });
      }
      return {
        type: "configuration_result",
        data: {
          apiKeyId,
          injectionDetectionEnabled: result.injection_detection_enabled,
          message: `Injection detection ${enabled ? "enabled" : "disabled"} for API key`
        }
      };
    } catch (error) {
      console.error("Failed to configure injection detection:", error);
      throw createError("DATABASE_ERROR", "Failed to update injection detection settings");
    }
  }
};
// Export handlers
export { handlers };
