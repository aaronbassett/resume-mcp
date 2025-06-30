// MCP Analytics and Logging Utilities
// Structured logging and analytics for MCP requests
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
// Initialize Supabase client for analytics
let supabaseClient = null;
function getSupabaseClient() {
  if (!supabaseClient) {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (supabaseUrl && supabaseServiceKey) {
      supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    }
  }
  return supabaseClient;
}
/**
 * Log an MCP request to the database
 */ export async function logRequest(log) {
  try {
    const client = getSupabaseClient();
    if (!client) {
      console.warn("Supabase client not initialized, skipping analytics");
      return;
    }
    // Insert log entry
    const { error } = await client.from("api_requests").insert({
      method: log.method,
      params: log.params,
      response_time_ms: log.response_time_ms,
      status_code: log.status_code,
      error_code: log.error_code,
      ip_address: log.ip_address,
      user_agent: log.user_agent
    });
    if (error) {
      console.error("Failed to log request:", error);
    }
  } catch (error) {
    console.error("Analytics logging error:", error);
  }
}
/**
 * Analytics middleware for automatic request logging
 */ export async function analyticsMiddleware(params, context, next) {
  const startTime = Date.now();
  const analyticsContext = context;
  // Store start time in context for other middleware to use
  analyticsContext.startTime = startTime;
  let statusCode = 200;
  let errorCode;
  try {
    const result = await next(params, context);
    return result;
  } catch (error) {
    // Capture error details
    statusCode = 500;
    if (error && typeof error === "object" && "code" in error) {
      errorCode = String(error.code);
    }
    if (error && typeof error === "object" && "statusCode" in error) {
      statusCode = Number(error.statusCode) || 500;
    }
    throw error;
  } finally{
    // Log the request
    const responseTime = Date.now() - startTime;
    // Get request details from context
    const request = globalThis.currentRequest;
    await logRequest({
      method: String(context.method || "unknown"),
      params: sanitizeParamsForLogging(params),
      response_time_ms: responseTime,
      status_code: statusCode,
      error_code: errorCode,
      ip_address: request?.headers?.get("x-forwarded-for") || undefined,
      user_agent: request?.headers?.get("user-agent") || undefined,
      request_id: analyticsContext.requestId,
      timestamp: new Date().toISOString()
    });
  }
}
/**
 * Sanitize parameters for logging (remove sensitive data)
 */ function sanitizeParamsForLogging(params) {
  const sanitized = {};
  for (const [key, value] of Object.entries(params)){
    const lowerKey = key.toLowerCase();
    // Skip sensitive parameters
    if (lowerKey.includes("password") || lowerKey.includes("secret") || lowerKey.includes("token") || lowerKey.includes("key") || lowerKey.includes("auth")) {
      sanitized[key] = "[REDACTED]";
      continue;
    }
    // Recursively sanitize nested objects
    if (value && typeof value === "object" && !Array.isArray(value)) {
      sanitized[key] = sanitizeParamsForLogging(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}
/**
 * Get analytics summary for a time period
 */ export async function getAnalyticsSummary(startDate, endDate, apiKeyId) {
  try {
    const client = getSupabaseClient();
    if (!client) {
      return null;
    }
    let query = client.from("api_requests").select("*").gte("created_at", startDate.toISOString()).lte("created_at", endDate.toISOString());
    if (apiKeyId) {
      query = query.eq("api_key_id", apiKeyId);
    }
    const { data, error } = await query;
    if (error || !data) {
      console.error("Failed to get analytics:", error);
      return null;
    }
    // Calculate metrics
    const totalRequests = data.length;
    const successfulRequests = data.filter((r)=>r.status_code >= 200 && r.status_code < 300).length;
    const successRate = totalRequests > 0 ? successfulRequests / totalRequests * 100 : 0;
    const totalResponseTime = data.reduce((sum, r)=>sum + (r.response_time_ms || 0), 0);
    const averageResponseTime = totalRequests > 0 ? totalResponseTime / totalRequests : 0;
    // Group by method
    const methodCounts = data.reduce((acc, r)=>{
      acc[r.method] = (acc[r.method] || 0) + 1;
      return acc;
    }, {});
    const topMethods = Object.entries(methodCounts).map(([method, count])=>({
        method,
        count
      })).sort((a, b)=>b.count - a.count).slice(0, 10);
    // Status code distribution
    const statusCodeDistribution = data.reduce((acc, r)=>{
      const code = r.status_code || 0;
      acc[code] = (acc[code] || 0) + 1;
      return acc;
    }, {});
    const errorRequests = data.filter((r)=>r.error_code).length;
    const errorRate = totalRequests > 0 ? errorRequests / totalRequests * 100 : 0;
    return {
      totalRequests,
      successRate,
      averageResponseTime,
      topMethods,
      errorRate,
      statusCodeDistribution
    };
  } catch (error) {
    console.error("Analytics summary error:", error);
    return null;
  }
}
/**
 * Structured logger for consistent log formatting
 */ export class Logger {
  context;
  constructor(context = {}){
    this.context = context;
  }
  log(level, message, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...this.context,
      ...data ? {
        data
      } : {}
    };
    console.log(JSON.stringify(logEntry));
  }
  info(message, data) {
    this.log("INFO", message, data);
  }
  warn(message, data) {
    this.log("WARN", message, data);
  }
  error(message, error) {
    const errorData = error instanceof Error ? {
      name: error.name,
      message: error.message,
      stack: error.stack
    } : error;
    this.log("ERROR", message, errorData);
  }
  debug(message, data) {
    if (Deno.env.get("DEBUG") === "true") {
      this.log("DEBUG", message, data);
    }
  }
  withContext(additionalContext) {
    return new Logger({
      ...this.context,
      ...additionalContext
    });
  }
}
