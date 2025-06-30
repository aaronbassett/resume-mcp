// AI-Powered Tools
// LLM-based tools for generating summaries and finding relevant experience
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../utils/errors.ts";
import { getLLMService } from "../services/llm.ts";
import { getPermissionService } from "../services/permissions.ts";
import { getAICacheService } from "../services/cache.ts";
import { getTokenTrackerService } from "../services/tokenTracker.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Check if user has permission to use AI tools
 */ async function canUseAITools(apiKeyId) {
  const permissionService = getPermissionService();
  const hasAI = await permissionService.checkPermission(apiKeyId, "ai", "*");
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  return hasAI || hasAdmin;
}
/**
 * Sanitize input to prevent prompt injection
 */ function sanitizeInput(input) {
  if (!input || typeof input !== "string") {
    return "";
  }
  // Remove potential prompt injection patterns
  const sanitized = input// Remove system role attempts
  .replace(/\[SYSTEM\]|\[\/SYSTEM\]/gi, "").replace(/system:/gi, "").replace(/assistant:/gi, "").replace(/human:/gi, "")// Remove instruction hijacking attempts
  .replace(/ignore.{1,20}instructions?/gi, "").replace(/forget.{1,20}(previous|above)/gi, "").replace(/new.{1,20}instructions?/gi, "")// Remove role playing attempts
  .replace(/you are (now |a )?/gi, "").replace(/act as (a |an )?/gi, "").replace(/roleplay/gi, "")// Remove code execution attempts
  .replace(/```[\s\S]*?```/g, "").replace(/<script[\s\S]*?<\/script>/gi, "")// Limit length to prevent token overflow
  .slice(0, 2000).trim();
  return sanitized;
}
/**
 * Content filter for AI responses
 */ function filterAIContent(content) {
  if (!content || typeof content !== "string") {
    return "";
  }
  // Basic content filtering - extend as needed
  const filtered = content// Remove any remaining injection attempts in output
  .replace(/\[SYSTEM\][\s\S]*?\[\/SYSTEM\]/gi, "").replace(/I cannot|I can't|I'm not able to/gi, "").trim();
  return filtered;
}
/**
 * Get resume data for AI processing
 */ async function getResumeDataForAI(resumeId, includePrivate = false) {
  // Build visibility filter
  const visibilityFilter = includePrivate ? {} : {
    neq: {
      visibility: "private"
    }
  };
  // Fetch all resume data in parallel
  const [{ data: profileData }, { data: experienceData }, { data: skillsData }, { data: projectsData }, { data: educationData }, { data: certificationData }] = await Promise.all([
    // Profile data
    supabase.from("resume_blocks").select("blocks!inner(data)").eq("resume_id", resumeId).eq("blocks.type", "profile").limit(1),
    // Experience data
    supabase.from("resume_blocks").select("blocks!inner(data)").eq("resume_id", resumeId).eq("blocks.type", "experience").order("position"),
    // Skills data
    supabase.from("resume_blocks").select("blocks!inner(data)").eq("resume_id", resumeId).eq("blocks.type", "skill").order("position"),
    // Projects data
    supabase.from("resume_blocks").select("blocks!inner(data)").eq("resume_id", resumeId).eq("blocks.type", "project").order("position"),
    // Education data
    supabase.from("resume_blocks").select("blocks!inner(data)").eq("resume_id", resumeId).eq("blocks.type", "education").order("position"),
    // Certification data
    supabase.from("resume_blocks").select("blocks!inner(data)").eq("resume_id", resumeId).eq("blocks.type", "certification").order("position")
  ]);
  return {
    profile: profileData?.[0]?.blocks?.data || {},
    experiences: experienceData?.map((item)=>item.blocks.data) || [],
    skills: skillsData?.map((item)=>item.blocks.data) || [],
    projects: projectsData?.map((item)=>item.blocks.data) || [],
    education: educationData?.map((item)=>item.blocks.data) || [],
    certifications: certificationData?.map((item)=>item.blocks.data) || []
  };
}
/**
 * Create summary prompt based on focus and style
 */ function createSummaryPrompt(resumeData, focus, length, style) {
  const lengthInstructions = {
    brief: "in 1-2 sentences (50-75 words)",
    medium: "in 2-3 sentences (75-150 words)",
    detailed: "in 3-4 sentences (150-250 words)"
  };
  const styleInstructions = {
    formal: "Use formal, professional language suitable for corporate environments.",
    conversational: "Use approachable, conversational tone while maintaining professionalism.",
    technical: "Emphasize technical terminology and specific technologies.",
    creative: "Use engaging, dynamic language that highlights creativity and innovation."
  };
  const focusInstructions = {
    general: "highlighting overall professional experience and key achievements",
    technical: "focusing specifically on technical skills, programming languages, and technology expertise",
    leadership: "emphasizing leadership experience, team management, and strategic initiatives",
    achievements: "showcasing quantifiable accomplishments, results, and impact",
    skills: "concentrating on core competencies and skill areas",
    education: "highlighting educational background, certifications, and continuous learning"
  };
  // Serialize resume data safely
  const dataString = JSON.stringify(resumeData, null, 2);
  return `You are a professional resume writer. Create a compelling professional summary ${lengthInstructions[length]} ${focusInstructions[focus]}.

${styleInstructions[style]}

Resume data:
${dataString}

Instructions:
1. Write ONLY the summary text, no additional commentary
2. Focus on the most relevant and impressive aspects
3. Use active voice and strong action words
4. Avoid generic phrases and buzzwords
5. Make it specific to this person's experience
6. Do not include personal information like addresses or phone numbers

Professional Summary:`;
}
/**
 * Token count estimation (rough approximation)
 */ function getTokenEstimate(text) {
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}
/**
 * Get token limits based on length setting
 */ function getTokenLimits(length) {
  const limits = {
    brief: 100,
    medium: 200,
    detailed: 350
  };
  return limits[length];
}
// AI tool handlers
export const handlers = {
  /**
   * Generate AI-powered professional summary
   */ generate_summary: async (params, context)=>{
    const { resumeId, focus = "general", length = "medium", style = "formal", model } = params;
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has access to this resume
    if (context.resumeId && context.resumeId !== targetResumeId) {
      throw createError("FORBIDDEN", "Access denied to this resume");
    }
    // Check AI tool permissions
    if (!await canUseAITools(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to use AI tools");
    }
    try {
      // Get services
      const llmService = getLLMService();
      const cacheService = getAICacheService();
      const tokenTracker = getTokenTrackerService();
      // Use default model if not specified
      const selectedModel = model || llmService.getDefaultModel();
      // Check budget limits before proceeding
      const budgetCheck = await tokenTracker.checkBudgetLimits(targetResumeId, context.userId);
      if (!budgetCheck.withinLimits) {
        throw createError("QUOTA_EXCEEDED", `Budget limits exceeded: ${budgetCheck.warnings.join(", ")}`);
      }
      // Generate cache key
      const cacheKey = cacheService.generateKey("generate_summary", targetResumeId, {
        focus,
        length,
        style,
        model: selectedModel
      });
      // Check cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return {
          type: "ai_summary",
          data: {
            ...cached,
            cached: true
          }
        };
      }
      // Get resume data
      const includePrivate = await canAccessPrivateData(context.apiKeyId, targetResumeId);
      const resumeData = await getResumeDataForAI(targetResumeId, includePrivate);
      // Create prompt
      const prompt = createSummaryPrompt(resumeData, focus, length, style);
      // Sanitize prompt
      const sanitizedPrompt = sanitizeInput(prompt);
      // Prepare LLM request
      const messages = [
        {
          role: "system",
          content: "You are a professional resume writer. Generate only the requested summary content without additional commentary or formatting."
        },
        {
          role: "user",
          content: sanitizedPrompt
        }
      ];
      // Track request start time
      const requestStart = Date.now();
      // Generate summary
      const response = await llmService.generateCompletion({
        model: selectedModel,
        messages,
        maxTokens: getTokenLimits(length),
        temperature: 0.7
      });
      const requestDuration = Date.now() - requestStart;
      // Filter AI response
      const filteredSummary = filterAIContent(response.content);
      if (!filteredSummary.trim()) {
        throw createError("AI_ERROR", "Generated summary was filtered out");
      }
      // Track token usage
      if (response.usage) {
        await tokenTracker.trackUsage({
          resumeId: targetResumeId,
          userId: context.userId,
          tool: "generate_summary",
          model: response.model,
          provider: response.provider,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
          requestDuration,
          cached: false,
          metadata: {
            focus,
            length,
            style
          }
        });
        // Also log to monitor if available
        if (context.monitor) {
          await context.monitor.logEvent("ai_tokens_used", {
            resume_id: targetResumeId,
            tool: "generate_summary",
            tokens: response.usage.totalTokens,
            model: response.model,
            provider: response.provider
          });
        }
      }
      const result = {
        summary: filteredSummary,
        metadata: {
          focus,
          length,
          style,
          model: response.model,
          provider: response.provider,
          tokenUsage: response.usage,
          generatedAt: new Date().toISOString(),
          cached: false
        }
      };
      // Cache the result (24 hour TTL)
      await cacheService.set(cacheKey, result, {
        ttl: 24 * 60 * 60 * 1000,
        tags: [
          `resume:${targetResumeId}`,
          "summary"
        ],
        metadata: {
          tool: "generate_summary",
          model: response.model,
          resumeId: targetResumeId
        }
      });
      return {
        type: "ai_summary",
        data: result
      };
    } catch (error) {
      console.error("AI summary generation failed:", error);
      throw createError("AI_ERROR", "Failed to generate summary");
    }
  },
  /**
   * Find relevant experience based on job description or keywords
   */ find_relevant_experience: async (params, context)=>{
    const { resumeId, jobDescription, keywords, maxResults = 5, model } = params;
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    if (!jobDescription && (!keywords || keywords.length === 0)) {
      throw createError("INVALID_PARAMS", "Either job description or keywords must be provided");
    }
    // Verify API key has access to this resume
    if (context.resumeId && context.resumeId !== targetResumeId) {
      throw createError("FORBIDDEN", "Access denied to this resume");
    }
    // Check AI tool permissions
    if (!await canUseAITools(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to use AI tools");
    }
    try {
      // Get services
      const llmService = getLLMService();
      const cacheService = getAICacheService();
      const tokenTracker = getTokenTrackerService();
      // Use default model if not specified
      const selectedModel = model || llmService.getDefaultModel();
      // Check budget limits before proceeding
      const budgetCheck = await tokenTracker.checkBudgetLimits(targetResumeId, context.userId);
      if (!budgetCheck.withinLimits) {
        throw createError("QUOTA_EXCEEDED", `Budget limits exceeded: ${budgetCheck.warnings.join(", ")}`);
      }
      // Generate cache key
      const cacheKey = cacheService.generateKey("find_relevant_experience", targetResumeId, {
        jobDescription: jobDescription ? sanitizeInput(jobDescription) : "",
        keywords: keywords ? keywords.map((k)=>sanitizeInput(k)).filter(Boolean).sort() : [],
        maxResults,
        model: selectedModel
      });
      // Check cache first
      const cached = await cacheService.get(cacheKey);
      if (cached) {
        return {
          type: "relevant_experience",
          data: {
            ...cached,
            cached: true
          }
        };
      }
      // Get resume data
      const includePrivate = await canAccessPrivateData(context.apiKeyId, targetResumeId);
      const resumeData = await getResumeDataForAI(targetResumeId, includePrivate);
      // Sanitize inputs
      const sanitizedJobDescription = jobDescription ? sanitizeInput(jobDescription) : "";
      const sanitizedKeywords = keywords ? keywords.map((k)=>sanitizeInput(k)).filter(Boolean) : [];
      // Create analysis prompt
      const searchCriteria = sanitizedJobDescription || sanitizedKeywords.join(", ");
      const prompt = `You are a resume analyst. Analyze the following experiences and rank them by relevance to the search criteria.

Search criteria: ${searchCriteria}

Experiences:
${JSON.stringify(resumeData.experiences, null, 2)}

Instructions:
1. Return ONLY a JSON array of experience objects ranked by relevance (most relevant first)
2. Include ALL original experience data for each relevant experience
3. Add a "relevanceScore" field (0-100) and "relevanceReason" field explaining why it's relevant
4. Limit to ${maxResults} most relevant experiences
5. Only include experiences with relevance score >= 30

Format:
[
  {
    ...originalExperienceData,
    "relevanceScore": 85,
    "relevanceReason": "Direct experience with required technologies and similar role responsibilities"
  }
]`;
      const messages = [
        {
          role: "system",
          content: "You are a resume analysis expert. Return only valid JSON array with ranked experiences."
        },
        {
          role: "user",
          content: prompt
        }
      ];
      // Track request start time
      const requestStart = Date.now();
      // Generate analysis
      const response = await llmService.generateCompletion({
        model: selectedModel,
        messages,
        maxTokens: 1500,
        temperature: 0.3
      });
      const requestDuration = Date.now() - requestStart;
      // Parse JSON response
      let relevantExperiences;
      try {
        const cleanedResponse = response.content.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        relevantExperiences = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error("Failed to parse AI response:", response.content);
        throw createError("AI_ERROR", "Failed to parse AI analysis response");
      }
      if (!Array.isArray(relevantExperiences)) {
        throw createError("AI_ERROR", "AI response was not a valid array");
      }
      // Track token usage
      if (response.usage) {
        await tokenTracker.trackUsage({
          resumeId: targetResumeId,
          userId: context.userId,
          tool: "find_relevant_experience",
          model: response.model,
          provider: response.provider,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          totalTokens: response.usage.totalTokens,
          requestDuration,
          cached: false,
          metadata: {
            hasJobDescription: !!jobDescription,
            keywordCount: sanitizedKeywords.length,
            maxResults
          }
        });
        // Also log to monitor if available
        if (context.monitor) {
          await context.monitor.logEvent("ai_tokens_used", {
            resume_id: targetResumeId,
            tool: "find_relevant_experience",
            tokens: response.usage.totalTokens,
            model: response.model,
            provider: response.provider
          });
        }
      }
      const result = {
        experiences: relevantExperiences.slice(0, maxResults),
        searchCriteria: {
          jobDescription: sanitizedJobDescription,
          keywords: sanitizedKeywords
        },
        metadata: {
          totalFound: relevantExperiences.length,
          model: response.model,
          provider: response.provider,
          tokenUsage: response.usage,
          analyzedAt: new Date().toISOString(),
          cached: false
        }
      };
      // Cache the result (1 hour TTL for experience matching)
      await cacheService.set(cacheKey, result, {
        ttl: 60 * 60 * 1000,
        tags: [
          `resume:${targetResumeId}`,
          "experience-matching"
        ],
        metadata: {
          tool: "find_relevant_experience",
          model: response.model,
          resumeId: targetResumeId
        }
      });
      return {
        type: "relevant_experience",
        data: result
      };
    } catch (error) {
      console.error("AI experience matching failed:", error);
      throw createError("AI_ERROR", "Failed to find relevant experience");
    }
  }
};
/**
 * Helper function to check private data access
 */ async function canAccessPrivateData(apiKeyId, resumeId) {
  const permissionService = getPermissionService();
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  const hasWrite = await permissionService.checkPermission(apiKeyId, "resume", "write");
  const hasPrivateRead = await permissionService.checkPermission(apiKeyId, "resume", "read:private");
  return hasAdmin || hasWrite || hasPrivateRead;
}
