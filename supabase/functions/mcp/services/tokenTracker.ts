// Token Usage Tracking Service
// Monitors and optimizes AI token consumption across the platform
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../utils/errors.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// Token pricing (per 1K tokens)
const TOKEN_PRICING = {
  "openai": {
    "gpt-4": {
      input: 0.03,
      output: 0.06
    },
    "gpt-3.5-turbo": {
      input: 0.001,
      output: 0.002
    }
  },
  "anthropic": {
    "claude-3-sonnet": {
      input: 0.003,
      output: 0.015
    },
    "claude-3-haiku": {
      input: 0.00025,
      output: 0.00125
    }
  },
  "gemini": {
    "gemini-pro": {
      input: 0.0005,
      output: 0.0015
    }
  }
};
// Default budget configuration
const DEFAULT_BUDGET = {
  dailyLimit: 10.00,
  monthlyLimit: 200.00,
  perResumeLimit: 5.00,
  alertThresholds: {
    daily: 80,
    monthly: 85,
    perResume: 90 // Alert at 90% of per-resume limit
  }
};
/**
 * Calculate estimated cost for token usage
 */ function calculateCost(provider, model, promptTokens, completionTokens) {
  const pricing = TOKEN_PRICING[provider];
  if (!pricing || !pricing[model]) {
    console.warn(`No pricing data for ${provider}/${model}, using default rate`);
    return (promptTokens + completionTokens) * 0.002 / 1000; // Default rate
  }
  const modelPricing = pricing[model];
  const inputCost = promptTokens / 1000 * modelPricing.input;
  const outputCost = completionTokens / 1000 * modelPricing.output;
  return inputCost + outputCost;
}
/**
 * Token Usage Tracker Service
 */ export class TokenTrackerService {
  budgetConfig;
  constructor(budgetConfig = DEFAULT_BUDGET){
    this.budgetConfig = budgetConfig;
  }
  /**
   * Track token usage for an AI operation
   */ async trackUsage(usage) {
    const estimatedCost = calculateCost(usage.provider, usage.model, usage.promptTokens, usage.completionTokens);
    const entry = {
      ...usage,
      estimatedCost,
      timestamp: new Date()
    };
    try {
      const { error } = await supabase.from("ai_token_usage").insert({
        resume_id: entry.resumeId,
        user_id: entry.userId,
        tool: entry.tool,
        model: entry.model,
        provider: entry.provider,
        prompt_tokens: entry.promptTokens,
        completion_tokens: entry.completionTokens,
        total_tokens: entry.totalTokens,
        estimated_cost: entry.estimatedCost,
        request_duration_ms: entry.requestDuration,
        cached: entry.cached,
        timestamp: entry.timestamp.toISOString(),
        metadata: entry.metadata || {}
      });
      if (error) {
        console.error("Failed to track token usage:", error);
      }
    } catch (error) {
      console.error("Token tracking error:", error);
    }
  }
  /**
   * Get usage statistics for a time period
   */ async getUsageStats(resumeId, userId, startDate, endDate) {
    try {
      let query = supabase.from("ai_token_usage").select("*");
      if (resumeId) {
        query = query.eq("resume_id", resumeId);
      }
      if (userId) {
        query = query.eq("user_id", userId);
      }
      if (startDate) {
        query = query.gte("timestamp", startDate.toISOString());
      }
      if (endDate) {
        query = query.lte("timestamp", endDate.toISOString());
      }
      const { data, error } = await query;
      if (error) {
        throw error;
      }
      const entries = data || [];
      // Calculate basic stats
      const totalTokens = entries.reduce((sum, entry)=>sum + entry.total_tokens, 0);
      const totalCost = entries.reduce((sum, entry)=>sum + entry.estimated_cost, 0);
      const totalRequests = entries.length;
      const cachedRequests = entries.filter((entry)=>entry.cached).length;
      const cacheHitRate = totalRequests > 0 ? cachedRequests / totalRequests : 0;
      const averageTokensPerRequest = totalRequests > 0 ? totalTokens / totalRequests : 0;
      const averageCostPerRequest = totalRequests > 0 ? totalCost / totalRequests : 0;
      const averageRequestDuration = totalRequests > 0 ? entries.reduce((sum, entry)=>sum + entry.request_duration_ms, 0) / totalRequests : 0;
      // Cost breakdown by provider/model
      const costBreakdown = new Map();
      entries.forEach((entry)=>{
        const key = `${entry.provider}/${entry.model}`;
        const existing = costBreakdown.get(key) || {
          tokens: 0,
          cost: 0
        };
        costBreakdown.set(key, {
          tokens: existing.tokens + entry.total_tokens,
          cost: existing.cost + entry.estimated_cost
        });
      });
      const costBreakdownArray = Array.from(costBreakdown.entries()).map(([key, data])=>{
        const [provider, model] = key.split('/');
        return {
          provider,
          model,
          tokens: data.tokens,
          cost: data.cost,
          percentage: totalCost > 0 ? data.cost / totalCost * 100 : 0
        };
      }).sort((a, b)=>b.cost - a.cost);
      // Tool usage breakdown
      const toolUsage = new Map();
      entries.forEach((entry)=>{
        const existing = toolUsage.get(entry.tool) || {
          requests: 0,
          tokens: 0,
          cost: 0
        };
        toolUsage.set(entry.tool, {
          requests: existing.requests + 1,
          tokens: existing.tokens + entry.total_tokens,
          cost: existing.cost + entry.estimated_cost
        });
      });
      const toolUsageArray = Array.from(toolUsage.entries()).map(([tool, data])=>({
          tool,
          requests: data.requests,
          tokens: data.tokens,
          cost: data.cost,
          averageTokens: data.requests > 0 ? data.tokens / data.requests : 0
        })).sort((a, b)=>b.cost - a.cost);
      // Time series data (daily aggregation)
      const timeSeriesMap = new Map();
      entries.forEach((entry)=>{
        const date = new Date(entry.timestamp).toISOString().split('T')[0];
        const existing = timeSeriesMap.get(date) || {
          tokens: 0,
          cost: 0,
          requests: 0
        };
        timeSeriesMap.set(date, {
          tokens: existing.tokens + entry.total_tokens,
          cost: existing.cost + entry.estimated_cost,
          requests: existing.requests + 1
        });
      });
      const timeSeriesData = Array.from(timeSeriesMap.entries()).map(([date, data])=>({
          date,
          ...data
        })).sort((a, b)=>a.date.localeCompare(b.date));
      return {
        totalTokens,
        totalCost,
        totalRequests,
        cacheHitRate,
        averageTokensPerRequest,
        averageCostPerRequest,
        averageRequestDuration,
        costBreakdown: costBreakdownArray,
        toolUsage: toolUsageArray,
        timeSeriesData
      };
    } catch (error) {
      console.error("Failed to get usage stats:", error);
      throw createError("DATABASE_ERROR", "Failed to retrieve usage statistics");
    }
  }
  /**
   * Check if usage is within budget limits
   */ async checkBudgetLimits(resumeId, userId) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    try {
      // Get daily usage for user
      const { data: dailyData } = await supabase.from("ai_token_usage").select("estimated_cost").eq("user_id", userId).gte("timestamp", today.toISOString());
      const dailyUsage = (dailyData || []).reduce((sum, entry)=>sum + entry.estimated_cost, 0);
      // Get monthly usage for user
      const { data: monthlyData } = await supabase.from("ai_token_usage").select("estimated_cost").eq("user_id", userId).gte("timestamp", monthStart.toISOString());
      const monthlyUsage = (monthlyData || []).reduce((sum, entry)=>sum + entry.estimated_cost, 0);
      // Get daily usage for specific resume
      const { data: resumeData } = await supabase.from("ai_token_usage").select("estimated_cost").eq("resume_id", resumeId).gte("timestamp", today.toISOString());
      const resumeUsage = (resumeData || []).reduce((sum, entry)=>sum + entry.estimated_cost, 0);
      // Check limits and generate warnings
      const warnings = [];
      let withinLimits = true;
      // Daily limit check
      if (dailyUsage >= this.budgetConfig.dailyLimit) {
        withinLimits = false;
        warnings.push(`Daily budget limit exceeded: $${dailyUsage.toFixed(2)} / $${this.budgetConfig.dailyLimit.toFixed(2)}`);
      } else if (dailyUsage >= this.budgetConfig.dailyLimit * (this.budgetConfig.alertThresholds.daily / 100)) {
        warnings.push(`Daily budget warning: $${dailyUsage.toFixed(2)} / $${this.budgetConfig.dailyLimit.toFixed(2)} (${Math.round(dailyUsage / this.budgetConfig.dailyLimit * 100)}%)`);
      }
      // Monthly limit check
      if (monthlyUsage >= this.budgetConfig.monthlyLimit) {
        withinLimits = false;
        warnings.push(`Monthly budget limit exceeded: $${monthlyUsage.toFixed(2)} / $${this.budgetConfig.monthlyLimit.toFixed(2)}`);
      } else if (monthlyUsage >= this.budgetConfig.monthlyLimit * (this.budgetConfig.alertThresholds.monthly / 100)) {
        warnings.push(`Monthly budget warning: $${monthlyUsage.toFixed(2)} / $${this.budgetConfig.monthlyLimit.toFixed(2)} (${Math.round(monthlyUsage / this.budgetConfig.monthlyLimit * 100)}%)`);
      }
      // Per-resume limit check
      if (resumeUsage >= this.budgetConfig.perResumeLimit) {
        withinLimits = false;
        warnings.push(`Resume daily budget limit exceeded: $${resumeUsage.toFixed(2)} / $${this.budgetConfig.perResumeLimit.toFixed(2)}`);
      } else if (resumeUsage >= this.budgetConfig.perResumeLimit * (this.budgetConfig.alertThresholds.perResume / 100)) {
        warnings.push(`Resume daily budget warning: $${resumeUsage.toFixed(2)} / $${this.budgetConfig.perResumeLimit.toFixed(2)} (${Math.round(resumeUsage / this.budgetConfig.perResumeLimit * 100)}%)`);
      }
      return {
        withinLimits,
        warnings,
        dailyUsage,
        monthlyUsage,
        resumeUsage
      };
    } catch (error) {
      console.error("Budget check error:", error);
      throw createError("DATABASE_ERROR", "Failed to check budget limits");
    }
  }
  /**
   * Get prompt optimization suggestions
   */ async getOptimizationSuggestions(userId) {
    try {
      const stats = await this.getUsageStats(undefined, userId, new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
      const suggestions = [];
      let potentialSavings = 0;
      // Cache hit rate analysis
      if (stats.cacheHitRate < 0.3) {
        suggestions.push("Consider using more consistent parameters to improve cache hit rate");
        potentialSavings += stats.totalCost * 0.2; // Estimate 20% savings
      }
      // Token efficiency analysis
      if (stats.averageTokensPerRequest > 2000) {
        suggestions.push("Reduce prompt length and use more specific instructions to lower token usage");
        potentialSavings += stats.totalCost * 0.15; // Estimate 15% savings
      }
      // Model optimization
      const expensiveUsage = stats.costBreakdown.filter((item)=>item.model.includes('gpt-4') || item.model.includes('claude-3-sonnet'));
      if (expensiveUsage.length > 0) {
        const expensiveCost = expensiveUsage.reduce((sum, item)=>sum + item.cost, 0);
        if (expensiveCost / stats.totalCost > 0.8) {
          suggestions.push("Consider using less expensive models for simpler tasks");
          potentialSavings += expensiveCost * 0.3; // Estimate 30% savings
        }
      }
      // Tool usage patterns
      const inefficientTools = stats.toolUsage.filter((tool)=>tool.averageTokens > 1500 && tool.requests > 10);
      if (inefficientTools.length > 0) {
        suggestions.push("Optimize prompts for frequently used tools with high token usage");
        potentialSavings += inefficientTools.reduce((sum, tool)=>sum + tool.cost, 0) * 0.2;
      }
      // Calculate efficiency score (0-100)
      let efficiencyScore = 100;
      efficiencyScore -= Math.max(0, 30 - stats.cacheHitRate * 100); // Cache hit rate weight
      efficiencyScore -= Math.max(0, (stats.averageTokensPerRequest - 1000) / 50); // Token efficiency
      efficiencyScore -= Math.max(0, (stats.averageCostPerRequest - 0.05) * 200); // Cost efficiency
      efficiencyScore = Math.max(0, Math.min(100, efficiencyScore));
      return {
        suggestions,
        potentialSavings,
        efficiencyScore
      };
    } catch (error) {
      console.error("Optimization analysis error:", error);
      throw createError("DATABASE_ERROR", "Failed to analyze optimization opportunities");
    }
  }
  /**
   * Update budget configuration
   */ updateBudgetConfig(config) {
    this.budgetConfig = {
      ...this.budgetConfig,
      ...config
    };
  }
  /**
   * Get current budget configuration
   */ getBudgetConfig() {
    return {
      ...this.budgetConfig
    };
  }
}
// Singleton instance
let tokenTrackerInstance = null;
export function getTokenTrackerService() {
  if (!tokenTrackerInstance) {
    tokenTrackerInstance = new TokenTrackerService();
  }
  return tokenTrackerInstance;
}
