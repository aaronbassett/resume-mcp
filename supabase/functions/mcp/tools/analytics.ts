// Analytics Tools
// MCP methods for retrieving analytics data
import { getAnalyticsSummary } from "../utils/analytics.ts";
import { createError } from "../utils/errors.ts";
import { registerTools } from "./registry.ts";
// Analytics tool handlers
const analyticsHandlers = {
  /**
   * Get analytics summary for API usage
   */ get_analytics_summary: async (params, context)=>{
    // Validate parameters
    const { startDate, endDate, apiKeyId } = params;
    // Default to last 7 days if not specified
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 7 * 24 * 60 * 60 * 1000);
    // Validate date range
    if (start > end) {
      throw createError("VALIDATION_ERROR", "Start date must be before end date");
    }
    if (end > new Date()) {
      throw createError("VALIDATION_ERROR", "End date cannot be in the future");
    }
    // Get analytics summary
    const summary = await getAnalyticsSummary(start, end, apiKeyId);
    if (!summary) {
      throw createError("INTERNAL_ERROR", "Failed to retrieve analytics");
    }
    return {
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      },
      metrics: summary
    };
  },
  /**
   * Get current rate limit status
   */ get_rate_limit_status: async (params, context)=>{
    // This will be implemented when we add rate limiting in Task 5
    return {
      limit: 1000,
      remaining: 950,
      reset: new Date(Date.now() + 3600000).toISOString(),
      window: "1h"
    };
  }
};
// Register analytics tools
export function register() {
  registerTools(analyticsHandlers);
}
// Export for direct use
export const handlers = analyticsHandlers;
