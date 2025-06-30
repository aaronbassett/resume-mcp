// Analytics Management Tools
// Comprehensive analytics tools for tracking API usage, performance, and detecting suspicious activity
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../../utils/errors.ts";
import { getPermissionService } from "../../services/permissions.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Check if user has analytics read permissions
 */ async function hasAnalyticsPermission(apiKeyId) {
  const permissionService = getPermissionService();
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  const hasAnalytics = await permissionService.checkPermission(apiKeyId, "analytics", "read");
  return hasAdmin || hasAnalytics;
}
/**
 * Calculate percentile from sorted array
 */ function calculatePercentile(sortedArray, percentile) {
  if (sortedArray.length === 0) return 0;
  const index = Math.ceil(percentile / 100 * sortedArray.length) - 1;
  return sortedArray[index] || 0;
}
/**
 * Detect suspicious patterns in request logs
 */ function detectSuspiciousPatterns(logs) {
  const suspiciousPatterns = [];
  // Group by API key and IP
  const keyActivityMap = new Map();
  const ipActivityMap = new Map();
  logs.forEach((log)=>{
    const key = log.api_key_id;
    const ip = log.ip_address;
    if (key) {
      if (!keyActivityMap.has(key)) keyActivityMap.set(key, []);
      keyActivityMap.get(key).push(log);
    }
    if (ip) {
      if (!ipActivityMap.has(ip)) ipActivityMap.set(ip, []);
      ipActivityMap.get(ip).push(log);
    }
  });
  // Check for excessive requests from single key
  keyActivityMap.forEach((keyLogs, keyId)=>{
    const requestsPerMinute = keyLogs.length / ((logs[logs.length - 1].created_at - logs[0].created_at) / 60000);
    if (requestsPerMinute > 100) {
      suspiciousPatterns.push({
        type: "excessive_requests",
        entityType: "api_key",
        entityId: keyId,
        requestCount: keyLogs.length,
        requestsPerMinute: Math.round(requestsPerMinute),
        severity: requestsPerMinute > 200 ? "high" : "medium"
      });
    }
    // Check for high error rate
    const errors = keyLogs.filter((l)=>l.response_status >= 400);
    const errorRate = errors.length / keyLogs.length;
    if (errorRate > 0.5 && keyLogs.length > 10) {
      suspiciousPatterns.push({
        type: "high_error_rate",
        entityType: "api_key",
        entityId: keyId,
        errorRate: Math.round(errorRate * 100),
        errorCount: errors.length,
        totalRequests: keyLogs.length,
        severity: errorRate > 0.8 ? "high" : "medium"
      });
    }
  });
  // Check for potential brute force attempts
  ipActivityMap.forEach((ipLogs, ip)=>{
    const failedAuths = ipLogs.filter((l)=>l.response_status === 401);
    if (failedAuths.length > 10) {
      suspiciousPatterns.push({
        type: "potential_brute_force",
        entityType: "ip_address",
        entityId: ip,
        failedAttempts: failedAuths.length,
        severity: failedAuths.length > 50 ? "critical" : "high"
      });
    }
  });
  return suspiciousPatterns;
}
/**
 * Infer LLM type from user agent and request patterns
 */ function inferLLMType(userAgent, headers = {}) {
  const ua = userAgent?.toLowerCase() || "";
  // Check user agent patterns
  if (ua.includes("openai")) return "openai";
  if (ua.includes("anthropic") || ua.includes("claude")) return "anthropic";
  if (ua.includes("google") && (ua.includes("bard") || ua.includes("palm"))) return "google";
  if (ua.includes("microsoft") || ua.includes("bing")) return "microsoft";
  if (ua.includes("cohere")) return "cohere";
  if (ua.includes("huggingface")) return "huggingface";
  // Check header patterns
  const authHeader = headers["authorization"] || "";
  if (authHeader.includes("Bearer sk-")) return "openai";
  if (authHeader.includes("x-api-key")) return "anthropic";
  // Check for known MCP clients
  if (ua.includes("mcp-client")) return "mcp-generic";
  return "unknown";
}
// Analytics handlers
const handlers = {
  /**
   * Get comprehensive usage statistics
   */ get_usage_stats: async (params, context)=>{
    const { keyId, dateRange, groupBy = "day" } = params;
    // Verify permissions
    if (!await hasAnalyticsPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to access analytics");
    }
    // Set default date range if not provided (last 30 days)
    const endDate = dateRange?.end || new Date().toISOString();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    try {
      // Build base query
      let query = supabase.from("request_logs").select("*", {
        count: "exact"
      }).gte("created_at", startDate).lte("created_at", endDate);
      // Filter by API key if provided
      if (keyId) {
        // Verify key belongs to user (unless admin)
        const permissionService = getPermissionService();
        const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
        if (!hasAdmin) {
          const { data: key } = await supabase.from("api_keys").select("id").eq("id", keyId).eq("user_id", context.userId).single();
          if (!key) {
            throw createError("FORBIDDEN", "Access denied to this API key");
          }
        }
        query = query.eq("api_key_id", keyId);
      } else {
        // Filter by user's API keys unless admin
        const permissionService = getPermissionService();
        const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
        if (!hasAdmin) {
          const { data: keys } = await supabase.from("api_keys").select("id").eq("user_id", context.userId);
          const keyIds = keys?.map((k)=>k.id) || [];
          if (keyIds.length === 0) {
            return {
              type: "usage_stats",
              data: {
                totalRequests: 0,
                uniqueMethods: 0,
                topMethods: [],
                responseTimes: {
                  p50: 0,
                  p95: 0,
                  p99: 0,
                  avg: 0
                },
                errorRate: 0,
                timeSeriesData: []
              }
            };
          }
          query = query.in("api_key_id", keyIds);
        }
      }
      // Execute query
      const { data: logs, error, count } = await query;
      if (error) {
        throw error;
      }
      // Calculate statistics
      const methodCounts = new Map();
      const responseTimes = [];
      const timeSeriesMap = new Map();
      let errorCount = 0;
      let totalResponseTime = 0;
      logs?.forEach((log)=>{
        // Count methods
        const method = log.method;
        methodCounts.set(method, (methodCounts.get(method) || 0) + 1);
        // Count errors
        if (log.response_status >= 400) {
          errorCount++;
        }
        // Collect response times
        if (log.response_time_ms) {
          responseTimes.push(log.response_time_ms);
          totalResponseTime += log.response_time_ms;
        }
        // Group by time period
        const date = new Date(log.created_at);
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
        if (!timeSeriesMap.has(timeKey)) {
          timeSeriesMap.set(timeKey, {
            timestamp: timeKey,
            requests: 0,
            errors: 0,
            totalResponseTime: 0,
            methods: new Map()
          });
        }
        const timeBucket = timeSeriesMap.get(timeKey);
        timeBucket.requests++;
        if (log.response_status >= 400) timeBucket.errors++;
        if (log.response_time_ms) timeBucket.totalResponseTime += log.response_time_ms;
        timeBucket.methods.set(method, (timeBucket.methods.get(method) || 0) + 1);
      });
      // Sort methods by count
      const topMethods = Array.from(methodCounts.entries()).map(([method, count])=>({
          method,
          count,
          percentage: count / (logs?.length || 1) * 100
        })).sort((a, b)=>b.count - a.count).slice(0, 10);
      // Calculate response time percentiles
      responseTimes.sort((a, b)=>a - b);
      const p50 = calculatePercentile(responseTimes, 50);
      const p95 = calculatePercentile(responseTimes, 95);
      const p99 = calculatePercentile(responseTimes, 99);
      const avgResponseTime = responseTimes.length > 0 ? totalResponseTime / responseTimes.length : 0;
      // Format time series data
      const timeSeriesData = Array.from(timeSeriesMap.values()).map((bucket)=>({
          timestamp: bucket.timestamp,
          requests: bucket.requests,
          errors: bucket.errors,
          errorRate: bucket.requests > 0 ? bucket.errors / bucket.requests : 0,
          avgResponseTime: bucket.totalResponseTime / bucket.requests || 0,
          topMethod: Array.from(bucket.methods.entries()).sort((a, b)=>b[1] - a[1])[0]?.[0] || null
        })).sort((a, b)=>a.timestamp.localeCompare(b.timestamp));
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("get_usage_stats", {
          date_range: {
            start: startDate,
            end: endDate
          },
          key_id: keyId,
          group_by: groupBy
        });
      }
      return {
        type: "usage_stats",
        data: {
          totalRequests: count || 0,
          uniqueMethods: methodCounts.size,
          topMethods,
          responseTimes: {
            p50,
            p95,
            p99,
            avg: Math.round(avgResponseTime)
          },
          errorRate: count && count > 0 ? errorCount / count : 0,
          errorCount,
          timeSeriesData,
          dateRange: {
            start: startDate,
            end: endDate
          }
        }
      };
    } catch (error) {
      console.error("Failed to get usage stats:", error);
      throw createError("DATABASE_ERROR", "Failed to retrieve usage statistics");
    }
  },
  /**
   * Get block performance analytics
   */ get_block_performance: async (params, context)=>{
    const { blockType, dateRange, limit = 20 } = params;
    // Verify permissions
    if (!await hasAnalyticsPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to access analytics");
    }
    // Set default date range if not provided (last 30 days)
    const endDate = dateRange?.end || new Date().toISOString();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    try {
      // Get block access logs
      let query = supabase.from("request_logs").select("method, response_time_ms, params").gte("created_at", startDate).lte("created_at", endDate).in("method", [
        "get_block",
        "list_blocks",
        "create_block",
        "update_block",
        "delete_block"
      ]);
      // Filter by user's API keys unless admin
      const permissionService = getPermissionService();
      const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
      if (!hasAdmin) {
        const { data: keys } = await supabase.from("api_keys").select("id").eq("user_id", context.userId);
        const keyIds = keys?.map((k)=>k.id) || [];
        if (keyIds.length > 0) {
          query = query.in("api_key_id", keyIds);
        }
      }
      const { data: logs, error } = await query;
      if (error) {
        throw error;
      }
      // Analyze block performance
      const blockStats = new Map();
      const typeStats = new Map();
      logs?.forEach((log)=>{
        // Extract block info from params
        const blockId = log.params?.blockId || log.params?.block_id;
        const type = log.params?.type || log.params?.blockType || blockType;
        if (blockId) {
          if (!blockStats.has(blockId)) {
            blockStats.set(blockId, {
              accessCount: 0,
              totalResponseTime: 0,
              operations: {
                get: 0,
                create: 0,
                update: 0,
                delete: 0
              }
            });
          }
          const stats = blockStats.get(blockId);
          stats.accessCount++;
          if (log.response_time_ms) {
            stats.totalResponseTime += log.response_time_ms;
          }
          // Count operations
          if (log.method === "get_block") stats.operations.get++;
          else if (log.method === "create_block") stats.operations.create++;
          else if (log.method === "update_block") stats.operations.update++;
          else if (log.method === "delete_block") stats.operations.delete++;
        }
        if (type) {
          if (!typeStats.has(type)) {
            typeStats.set(type, {
              accessCount: 0,
              totalResponseTime: 0,
              operations: {
                get: 0,
                create: 0,
                update: 0,
                delete: 0
              }
            });
          }
          const stats = typeStats.get(type);
          stats.accessCount++;
          if (log.response_time_ms) {
            stats.totalResponseTime += log.response_time_ms;
          }
          // Count operations by type
          if (log.method === "get_block" || log.method === "list_blocks") stats.operations.get++;
          else if (log.method === "create_block") stats.operations.create++;
          else if (log.method === "update_block") stats.operations.update++;
          else if (log.method === "delete_block") stats.operations.delete++;
        }
      });
      // Get most accessed blocks
      const mostAccessedBlocks = Array.from(blockStats.entries()).map(([blockId, stats])=>({
          blockId,
          accessCount: stats.accessCount,
          avgResponseTime: Math.round(stats.totalResponseTime / stats.accessCount),
          operations: stats.operations
        })).sort((a, b)=>b.accessCount - a.accessCount).slice(0, limit);
      // Get type statistics
      const typePerformance = Array.from(typeStats.entries()).map(([type, stats])=>({
          type,
          accessCount: stats.accessCount,
          avgResponseTime: Math.round(stats.totalResponseTime / stats.accessCount),
          operations: stats.operations
        })).sort((a, b)=>b.accessCount - a.accessCount);
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("get_block_performance", {
          date_range: {
            start: startDate,
            end: endDate
          },
          block_type: blockType
        });
      }
      return {
        type: "block_performance",
        data: {
          mostAccessedBlocks,
          typePerformance,
          totalBlockAccess: logs?.length || 0,
          dateRange: {
            start: startDate,
            end: endDate
          }
        }
      };
    } catch (error) {
      console.error("Failed to get block performance:", error);
      throw createError("DATABASE_ERROR", "Failed to retrieve block performance data");
    }
  },
  /**
   * Detect suspicious activity patterns
   */ detect_suspicious_activity: async (params, context)=>{
    const { dateRange, severityThreshold = "medium" } = params;
    // Verify permissions
    if (!await hasAnalyticsPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to access analytics");
    }
    // Set default date range if not provided (last 24 hours for suspicious activity)
    const endDate = dateRange?.end || new Date().toISOString();
    const startDate = dateRange?.start || new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    try {
      // Get request logs for analysis
      let query = supabase.from("request_logs").select("*").gte("created_at", startDate).lte("created_at", endDate).order("created_at", {
        ascending: true
      });
      // Filter by user's API keys unless admin
      const permissionService = getPermissionService();
      const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
      if (!hasAdmin) {
        const { data: keys } = await supabase.from("api_keys").select("id").eq("user_id", context.userId);
        const keyIds = keys?.map((k)=>k.id) || [];
        if (keyIds.length > 0) {
          query = query.in("api_key_id", keyIds);
        }
      }
      const { data: logs, error } = await query;
      if (error) {
        throw error;
      }
      // Detect suspicious patterns
      const suspiciousPatterns = detectSuspiciousPatterns(logs || []);
      // Filter by severity threshold
      const severityOrder = {
        low: 0,
        medium: 1,
        high: 2,
        critical: 3
      };
      const threshold = severityOrder[severityThreshold];
      const filteredPatterns = suspiciousPatterns.filter((p)=>severityOrder[p.severity] >= threshold);
      // Group patterns by type
      const patternsByType = filteredPatterns.reduce((acc, pattern)=>{
        if (!acc[pattern.type]) {
          acc[pattern.type] = [];
        }
        acc[pattern.type].push(pattern);
        return acc;
      }, {});
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("detect_suspicious_activity", {
          date_range: {
            start: startDate,
            end: endDate
          },
          patterns_found: filteredPatterns.length,
          severity_threshold: severityThreshold
        });
      }
      return {
        type: "suspicious_activity",
        data: {
          totalPatterns: filteredPatterns.length,
          patternsByType,
          patterns: filteredPatterns,
          dateRange: {
            start: startDate,
            end: endDate
          },
          severityThreshold
        }
      };
    } catch (error) {
      console.error("Failed to detect suspicious activity:", error);
      throw createError("DATABASE_ERROR", "Failed to analyze suspicious activity");
    }
  },
  /**
   * Get LLM usage statistics
   */ get_llm_usage: async (params, context)=>{
    const { dateRange, groupByType = true } = params;
    // Verify permissions
    if (!await hasAnalyticsPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to access analytics");
    }
    // Set default date range if not provided (last 30 days)
    const endDate = dateRange?.end || new Date().toISOString();
    const startDate = dateRange?.start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    try {
      // Get request logs with user agent data
      let query = supabase.from("request_logs").select("user_agent, headers, api_key_id, created_at").gte("created_at", startDate).lte("created_at", endDate);
      // Filter by user's API keys unless admin
      const permissionService = getPermissionService();
      const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
      if (!hasAdmin) {
        const { data: keys } = await supabase.from("api_keys").select("id").eq("user_id", context.userId);
        const keyIds = keys?.map((k)=>k.id) || [];
        if (keyIds.length > 0) {
          query = query.in("api_key_id", keyIds);
        }
      }
      const { data: logs, error } = await query;
      if (error) {
        throw error;
      }
      // Analyze LLM usage
      const llmStats = new Map();
      const timeSeriesMap = new Map();
      logs?.forEach((log)=>{
        const llmType = inferLLMType(log.user_agent, log.headers);
        if (!llmStats.has(llmType)) {
          llmStats.set(llmType, {
            type: llmType,
            requestCount: 0,
            apiKeys: new Set(),
            firstSeen: log.created_at,
            lastSeen: log.created_at
          });
        }
        const stats = llmStats.get(llmType);
        stats.requestCount++;
        if (log.api_key_id) {
          stats.apiKeys.add(log.api_key_id);
        }
        stats.lastSeen = log.created_at;
        // Time series data
        const date = new Date(log.created_at);
        const dayKey = date.toISOString().substring(0, 10);
        if (!timeSeriesMap.has(dayKey)) {
          timeSeriesMap.set(dayKey, new Map());
        }
        const dayStats = timeSeriesMap.get(dayKey);
        dayStats.set(llmType, (dayStats.get(llmType) || 0) + 1);
      });
      // Format LLM statistics
      const llmTypes = Array.from(llmStats.values()).map((stats)=>({
          type: stats.type,
          requestCount: stats.requestCount,
          uniqueApiKeys: stats.apiKeys.size,
          percentage: stats.requestCount / (logs?.length || 1) * 100,
          firstSeen: stats.firstSeen,
          lastSeen: stats.lastSeen
        })).sort((a, b)=>b.requestCount - a.requestCount);
      // Format time series data
      const timeSeriesData = Array.from(timeSeriesMap.entries()).map(([date, typeMap])=>({
          date,
          llmTypes: Object.fromEntries(typeMap),
          total: Array.from(typeMap.values()).reduce((sum, count)=>sum + count, 0)
        })).sort((a, b)=>a.date.localeCompare(b.date));
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("get_llm_usage", {
          date_range: {
            start: startDate,
            end: endDate
          },
          unique_llm_types: llmTypes.length
        });
      }
      return {
        type: "llm_usage",
        data: {
          totalRequests: logs?.length || 0,
          uniqueLLMTypes: llmTypes.length,
          llmTypes,
          timeSeriesData: groupByType ? timeSeriesData : [],
          topLLM: llmTypes[0]?.type || "none",
          dateRange: {
            start: startDate,
            end: endDate
          }
        }
      };
    } catch (error) {
      console.error("Failed to get LLM usage:", error);
      throw createError("DATABASE_ERROR", "Failed to retrieve LLM usage data");
    }
  },
  /**
   * Get aggregated metrics for dashboard
   */ get_dashboard_metrics: async (params, context)=>{
    const { dateRange, refreshInterval = 300 // 5 minutes default
     } = params;
    // Verify permissions
    if (!await hasAnalyticsPermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to access analytics");
    }
    try {
      // Get multiple metrics in parallel for dashboard
      const [usageStats, blockPerformance, suspiciousActivity, llmUsage] = await Promise.all([
        handlers.get_usage_stats({
          dateRange
        }, context),
        handlers.get_block_performance({
          dateRange,
          limit: 5
        }, context),
        handlers.detect_suspicious_activity({
          dateRange,
          severityThreshold: "high"
        }, context),
        handlers.get_llm_usage({
          dateRange,
          groupByType: false
        }, context)
      ]);
      // Calculate additional dashboard-specific metrics
      const currentPeriodEnd = new Date();
      const currentPeriodStart = new Date(currentPeriodEnd.getTime() - 24 * 60 * 60 * 1000);
      const previousPeriodEnd = currentPeriodStart;
      const previousPeriodStart = new Date(previousPeriodEnd.getTime() - 24 * 60 * 60 * 1000);
      // Get current vs previous period comparison
      const [currentStats, previousStats] = await Promise.all([
        handlers.get_usage_stats({
          dateRange: {
            start: currentPeriodStart.toISOString(),
            end: currentPeriodEnd.toISOString()
          }
        }, context),
        handlers.get_usage_stats({
          dateRange: {
            start: previousPeriodStart.toISOString(),
            end: previousPeriodEnd.toISOString()
          }
        }, context)
      ]);
      const requestGrowth = previousStats.data.totalRequests > 0 ? (currentStats.data.totalRequests - previousStats.data.totalRequests) / previousStats.data.totalRequests * 100 : 100;
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("get_dashboard_metrics", {
          date_range: dateRange,
          refresh_interval: refreshInterval
        });
      }
      return {
        type: "dashboard_metrics",
        data: {
          overview: {
            totalRequests: usageStats.data.totalRequests,
            errorRate: Math.round(usageStats.data.errorRate * 100) + "%",
            avgResponseTime: usageStats.data.responseTimes.avg + "ms",
            requestGrowth: Math.round(requestGrowth) + "%"
          },
          topMetrics: {
            topMethod: usageStats.data.topMethods[0] || null,
            topBlock: blockPerformance.data.mostAccessedBlocks[0] || null,
            topLLM: llmUsage.data.topLLM,
            criticalIssues: suspiciousActivity.data.totalPatterns
          },
          charts: {
            requestTimeSeries: usageStats.data.timeSeriesData,
            methodDistribution: usageStats.data.topMethods,
            blockTypePerformance: blockPerformance.data.typePerformance
          },
          alerts: suspiciousActivity.data.patterns.slice(0, 5),
          lastUpdated: new Date().toISOString(),
          nextRefresh: new Date(Date.now() + refreshInterval * 1000).toISOString()
        }
      };
    } catch (error) {
      console.error("Failed to get dashboard metrics:", error);
      throw createError("DATABASE_ERROR", "Failed to retrieve dashboard metrics");
    }
  }
};
// Export handlers
export { handlers };
