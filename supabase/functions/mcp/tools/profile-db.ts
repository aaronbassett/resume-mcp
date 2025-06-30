// Profile Tools - Database Implementation
// Database-backed implementations for profile-related MCP methods
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../utils/errors.ts";
import { ResumeFormatters } from "../utils/formatter.ts";
import { getPermissionService } from "../services/permissions.ts";
import { withCache, withCacheInvalidation } from "../middleware/cache.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Get block data by type from resume
 */ async function getBlockByType(resumeId, blockType, includePrivate = false) {
  let query = supabase.from("resume_blocks").select(`
      position,
      blocks!inner(
        id,
        type,
        data
      )
    `).eq("resume_id", resumeId).eq("blocks.type", blockType).order("position", {
    ascending: true
  }).limit(1);
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching block:", error);
    console.error("Query details:", {
      resumeId,
      blockType,
      includePrivate
    });
    throw createError("DATABASE_ERROR", `Failed to fetch data: ${error.message}`);
  }
  if (!data || data.length === 0) {
    return null;
  }
  return data[0].blocks;
}
/**
 * Check if user has permission to access private data
 */ async function canAccessPrivateData(apiKeyId, resumeId) {
  const permissionService = getPermissionService();
  // Check for admin or write permissions
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  const hasWrite = await permissionService.checkPermission(apiKeyId, "resume", "write");
  const hasPrivateRead = await permissionService.checkPermission(apiKeyId, "resume", "read:private");
  return hasAdmin || hasWrite || hasPrivateRead;
}
// Profile tool handlers
const handlers = {
  /**
   * Get basic profile information
   */ get_profile_basics: async (params, context)=>{
    const { resumeId } = params;
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has access to this resume
    if (context.resumeId && context.resumeId !== targetResumeId) {
      throw createError("FORBIDDEN", "Access denied to this resume");
    }
    // Check if user can access private data
    const includePrivate = await canAccessPrivateData(context.apiKeyId, targetResumeId);
    // Get the profile block
    const basicsBlock = await getBlockByType(targetResumeId, "profile", includePrivate);
    if (!basicsBlock) {
      // Return empty profile if no basics block exists
      return ResumeFormatters.profile({
        name: "",
        title: "",
        summary: "",
        location: {}
      });
    }
    const data = basicsBlock.data || {};
    return ResumeFormatters.profile({
      name: data.name || "",
      title: data.title || "",
      summary: data.summary || "",
      location: data.location || {}
    });
  },
  /**
   * Get contact information
   */ get_contact_info: async (params, context)=>{
    const { resumeId, includeAvailability } = params;
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has access to this resume
    if (context.resumeId && context.resumeId !== targetResumeId) {
      throw createError("FORBIDDEN", "Access denied to this resume");
    }
    // Check permissions for contact information
    const permissionService = getPermissionService();
    const hasContactRead = await permissionService.checkPermission(context.apiKeyId, "contact", "read");
    if (!hasContactRead) {
      const hasGeneralRead = await permissionService.checkPermission(context.apiKeyId, "resume", "read");
      if (!hasGeneralRead) {
        throw createError("FORBIDDEN", "No permission to access contact information");
      }
    }
    // Check if user can access private data
    const includePrivate = await canAccessPrivateData(context.apiKeyId, targetResumeId);
    // Get the contact block
    const contactBlock = await getBlockByType(targetResumeId, "contact", includePrivate);
    if (!contactBlock) {
      // Return empty contact info if no contact block exists
      return {
        type: "contact",
        data: {}
      };
    }
    const data = contactBlock.data || {};
    // Filter out sensitive fields based on visibility settings
    const filteredData = {};
    const publicFields = [
      "website",
      "linkedin",
      "github"
    ]; // Default public fields
    // Always include fields marked as public
    for (const field of publicFields){
      if (data[field]) {
        filteredData[field] = data[field];
      }
    }
    // Include all fields if user has private access
    if (includePrivate) {
      Object.assign(filteredData, data);
    }
    const response = {
      type: "contact",
      data: filteredData
    };
    if (includeAvailability && (includePrivate || publicFields.includes("availability"))) {
      response.data = {
        ...filteredData,
        availability: data.availability,
        preferredContact: data.preferredContact
      };
    }
    return response;
  },
  /**
   * Get profile summary/bio
   */ get_summary: async (params, context)=>{
    const { resumeId, format } = params;
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has access to this resume
    if (context.resumeId && context.resumeId !== targetResumeId) {
      throw createError("FORBIDDEN", "Access denied to this resume");
    }
    // Check if user can access private data
    const includePrivate = await canAccessPrivateData(context.apiKeyId, targetResumeId);
    // Get the summary block
    const summaryBlock = await getBlockByType(targetResumeId, "summary", includePrivate);
    if (!summaryBlock) {
      // Try to get summary from basics block
      const basicsBlock = await getBlockByType(targetResumeId, "basics", includePrivate);
      if (!basicsBlock || !basicsBlock.data?.summary) {
        return {
          type: "summary",
          format: format || "full",
          data: {
            summary: "",
            headline: "",
            languages: []
          }
        };
      }
      // Use summary from basics block
      return {
        type: "summary",
        format: format || "full",
        data: {
          summary: basicsBlock.data.summary,
          headline: basicsBlock.data.headline || "",
          languages: basicsBlock.data.languages || []
        }
      };
    }
    const data = summaryBlock.data || {};
    let summary = data.summary || "";
    // Get format-specific summary if available
    if (format && data[`summary_${format}`]) {
      summary = data[`summary_${format}`];
    } else if (format) {
      // Auto-generate formatted summary if not available
      switch(format){
        case "short":
          summary = summary.split(".")[0] + "."; // First sentence
          break;
        case "elevator":
          // Take first 2-3 sentences or 150 chars
          const sentences = summary.split(".");
          summary = sentences.slice(0, 2).join(".") + ".";
          if (summary.length > 150) {
            summary = summary.substring(0, 147) + "...";
          }
          break;
        case "full":
        default:
          break;
      }
    }
    return {
      type: "summary",
      format: format || "full",
      data: {
        summary,
        headline: data.headline || "",
        languages: data.languages || []
      }
    };
  },
  /**
   * Update profile information
   */ update_profile: async (params, context)=>{
    const { resumeId, name, title, summary, location } = params;
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "resume", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to update profile");
    }
    // Start transaction
    const timestamp = new Date().toISOString();
    try {
      // Get or create basics block
      let basicsBlock = await getBlockByType(targetResumeId, "basics", true);
      if (!basicsBlock) {
        // Create new basics block
        const { data: newBlock, error: createError } = await supabase.from("blocks").insert({
          type: "basics",
          data: {},
          visibility: "public",
          user_id: context.userId
        }).select().single();
        if (createError || !newBlock) {
          throw createError || new Error("Failed to create basics block");
        }
        // Link to resume
        const { error: linkError } = await supabase.from("resume_blocks").insert({
          resume_id: targetResumeId,
          block_id: newBlock.id,
          position: 0
        });
        if (linkError) {
          throw linkError;
        }
        basicsBlock = newBlock;
      }
      // Update block data
      const currentData = basicsBlock.data || {};
      const updatedData = {
        ...currentData,
        ...name !== undefined && {
          name
        },
        ...title !== undefined && {
          title
        },
        ...summary !== undefined && {
          summary
        },
        ...location !== undefined && {
          location
        },
        updated_at: timestamp
      };
      const { error: updateError } = await supabase.from("blocks").update({
        data: updatedData,
        updated_at: timestamp
      }).eq("id", basicsBlock.id);
      if (updateError) {
        throw updateError;
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("update_profile", {
          resume_id: targetResumeId,
          block_id: basicsBlock.id,
          changes: {
            name: name !== undefined,
            title: title !== undefined,
            summary: summary !== undefined,
            location: location !== undefined
          }
        });
      }
      return {
        type: "success",
        message: "Profile updated successfully",
        data: {
          name: updatedData.name,
          title: updatedData.title,
          summary: updatedData.summary,
          location: updatedData.location
        }
      };
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw createError("DATABASE_ERROR", "Failed to update profile");
    }
  },
  /**
   * Update contact information
   */ update_contact: async (params, context)=>{
    const { resumeId, publicFields, ...contactData } = params;
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "resume", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to update contact information");
    }
    // Start transaction
    const timestamp = new Date().toISOString();
    try {
      // Get or create contact block
      let contactBlock = await getBlockByType(targetResumeId, "contact", true);
      if (!contactBlock) {
        // Create new contact block
        const { data: newBlock, error: createError } = await supabase.from("blocks").insert({
          type: "contact",
          data: {},
          visibility: "public",
          user_id: context.userId,
          metadata: {
            publicFields: publicFields || [
              "website",
              "linkedin",
              "github"
            ]
          }
        }).select().single();
        if (createError || !newBlock) {
          throw createError || new Error("Failed to create contact block");
        }
        // Link to resume
        const { error: linkError } = await supabase.from("resume_blocks").insert({
          resume_id: targetResumeId,
          block_id: newBlock.id,
          position: 1
        });
        if (linkError) {
          throw linkError;
        }
        contactBlock = newBlock;
      }
      // Update block data
      const currentData = contactBlock.data || {};
      const updatedData = {
        ...currentData,
        ...contactData,
        updated_at: timestamp
      };
      // Update metadata if publicFields provided
      const updatedMetadata = {
        ...contactBlock.metadata,
        ...publicFields && {
          publicFields
        }
      };
      const { error: updateError } = await supabase.from("blocks").update({
        data: updatedData,
        metadata: updatedMetadata,
        updated_at: timestamp
      }).eq("id", contactBlock.id);
      if (updateError) {
        throw updateError;
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("update_contact", {
          resume_id: targetResumeId,
          block_id: contactBlock.id,
          fields_updated: Object.keys(contactData)
        });
      }
      return {
        type: "success",
        message: "Contact information updated successfully",
        data: updatedData
      };
    } catch (error) {
      console.error("Failed to update contact:", error);
      throw createError("DATABASE_ERROR", "Failed to update contact information");
    }
  }
};
// Export handlers with caching applied
export const cachedHandlers = {
  // Read operations with caching
  get_profile_basics: withCache("get_profile_basics", handlers.get_profile_basics),
  get_contact_info: withCache("get_contact_info", handlers.get_contact_info),
  get_summary: withCache("get_summary", handlers.get_summary),
  // Mutation operations with cache invalidation
  update_profile: withCacheInvalidation("update_profile", handlers.update_profile),
  update_contact: withCacheInvalidation("update_contact", handlers.update_contact)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
