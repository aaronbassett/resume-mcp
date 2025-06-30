// Experience Tools - Database Implementation
// Database-backed implementations for experience-related MCP methods
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
 * Get experience blocks from resume
 */ async function getExperienceBlocks(resumeId, includePrivate = false, filters) {
  let query = supabase.from("resume_blocks").select(`
      position,
      blocks!inner(
        id,
        type,
        data,
        metadata,
        visibility,
        created_at,
        updated_at
      )
    `).eq("resume_id", resumeId).eq("blocks.type", "experience").order("position", {
    ascending: true
  });
  // Filter by visibility if not including private
  if (!includePrivate) {
    query = query.neq("blocks.visibility", "private");
  }
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching experience blocks:", error);
    throw createError("DATABASE_ERROR", "Failed to fetch experiences");
  }
  if (!data || data.length === 0) {
    return [];
  }
  // Extract blocks and apply additional filters
  let experiences = data.map((item)=>({
      ...item.blocks,
      position: item.position
    }));
  // Apply filters
  if (filters?.company) {
    experiences = experiences.filter((exp)=>exp.data?.company?.toLowerCase().includes(filters.company.toLowerCase()));
  }
  if (filters?.startDate) {
    experiences = experiences.filter((exp)=>exp.data?.startDate && new Date(exp.data.startDate) >= new Date(filters.startDate));
  }
  if (filters?.endDate) {
    experiences = experiences.filter((exp)=>exp.data?.endDate && new Date(exp.data.endDate) <= new Date(filters.endDate));
  }
  // Sort by start date (most recent first)
  experiences.sort((a, b)=>{
    const aDate = a.data?.startDate ? new Date(a.data.startDate) : new Date(0);
    const bDate = b.data?.startDate ? new Date(b.data.startDate) : new Date(0);
    return bDate.getTime() - aDate.getTime();
  });
  // Apply pagination
  if (filters?.offset !== undefined) {
    experiences = experiences.slice(filters.offset);
  }
  if (filters?.limit !== undefined) {
    experiences = experiences.slice(0, filters.limit);
  }
  return experiences;
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
// Experience tool handlers
const handlers = {
  /**
   * List all experience entries with advanced filtering and pagination
   */ list_all_experiences: async (params, context)=>{
    const { resumeId, limit = 10, offset = 0, company, position, startDate, endDate, sortBy = "startDate", sortOrder = "desc", current, search } = params;
    // Validate pagination params
    if (limit < 1 || limit > 100) {
      throw createError("INVALID_PARAMS", "Limit must be between 1 and 100");
    }
    if (offset < 0) {
      throw createError("INVALID_PARAMS", "Offset must be non-negative");
    }
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
    // Build initial query with count
    let countQuery = supabase.from("resume_blocks").select("block_id", {
      count: "exact"
    }).eq("resume_id", targetResumeId).eq("blocks.type", "experience");
    let query = supabase.from("resume_blocks").select(`
        position,
        blocks!inner(
          id,
          type,
          data,
          metadata,
          visibility,
          created_at,
          updated_at
        )
      `).eq("resume_id", targetResumeId).eq("blocks.type", "experience");
    // Filter by visibility if not including private
    if (!includePrivate) {
      query = query.neq("blocks.visibility", "private");
      countQuery = countQuery.neq("blocks.visibility", "private");
    }
    // Apply filters
    if (company) {
      query = query.ilike("blocks.data->company", `%${company}%`);
      countQuery = countQuery.ilike("blocks.data->company", `%${company}%`);
    }
    if (position) {
      query = query.ilike("blocks.data->title", `%${position}%`);
      countQuery = countQuery.ilike("blocks.data->title", `%${position}%`);
    }
    if (current !== undefined) {
      if (current) {
        query = query.eq("blocks.data->current", true);
        countQuery = countQuery.eq("blocks.data->current", true);
      } else {
        query = query.neq("blocks.data->current", true);
        countQuery = countQuery.neq("blocks.data->current", true);
      }
    }
    if (startDate) {
      query = query.gte("blocks.data->startDate", startDate);
      countQuery = countQuery.gte("blocks.data->startDate", startDate);
    }
    if (endDate) {
      query = query.lte("blocks.data->endDate", endDate);
      countQuery = countQuery.lte("blocks.data->endDate", endDate);
    }
    // Apply search across multiple fields
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`blocks.data->company.ilike.${searchTerm},blocks.data->title.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm}`);
      countQuery = countQuery.or(`blocks.data->company.ilike.${searchTerm},blocks.data->title.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm}`);
    }
    // Apply sorting
    const ascending = sortOrder === "asc";
    switch(sortBy){
      case "startDate":
        query = query.order("blocks.data->startDate", {
          ascending
        });
        break;
      case "endDate":
        query = query.order("blocks.data->endDate", {
          ascending
        });
        break;
      case "company":
        query = query.order("blocks.data->company", {
          ascending
        });
        break;
      case "position":
        query = query.order("blocks.data->title", {
          ascending
        });
        break;
      case "created_at":
        query = query.order("blocks.created_at", {
          ascending
        });
        break;
      default:
        query = query.order("blocks.data->startDate", {
          ascending: false
        });
    }
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    // Execute queries
    const [{ data: experienceData, error: dataError }, { count, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);
    if (dataError) {
      console.error("Error fetching experience data:", dataError);
      throw createError("DATABASE_ERROR", "Failed to fetch experiences");
    }
    if (countError) {
      console.error("Error counting experiences:", countError);
      throw createError("DATABASE_ERROR", "Failed to count experiences");
    }
    const experiences = experienceData || [];
    const totalCount = count || 0;
    // Format experiences
    const formattedExperiences = experiences.map((item)=>({
        id: item.blocks.id,
        position: item.position,
        ...item.blocks.data,
        metadata: {
          visibility: item.blocks.visibility,
          created_at: item.blocks.created_at,
          updated_at: item.blocks.updated_at
        }
      }));
    return {
      type: "experiences",
      data: formattedExperiences,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + experiences.length < totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit)
      },
      filters: {
        company,
        position,
        startDate,
        endDate,
        current,
        search,
        sortBy,
        sortOrder
      },
      count: experiences.length,
      totalCount
    };
  },
  /**
   * Get experience for a specific company
   */ get_experience_by_company: async (params, context)=>{
    const { company, resumeId } = params;
    if (!company) {
      throw createError("INVALID_PARAMS", "Company name is required");
    }
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
    // Get filtered experience blocks
    const experiences = await getExperienceBlocks(targetResumeId, includePrivate, {
      company
    });
    if (experiences.length === 0) {
      return {
        type: "experiences",
        count: 0,
        items: [],
        message: `No experience found for company: ${company}`
      };
    }
    // Format experiences
    const formattedExperiences = experiences.map((exp)=>exp.data);
    return ResumeFormatters.experiences(formattedExperiences);
  },
  /**
   * Get experience details by ID
   */ get_experience_details: async (params, context)=>{
    const { experienceId, resumeId } = params;
    if (!experienceId) {
      throw createError("INVALID_PARAMS", "Experience ID is required");
    }
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
    // Get specific experience block
    let query = supabase.from("resume_blocks").select(`
        position,
        blocks!inner(
          id,
          type,
          data,
          metadata,
          visibility,
          created_at,
          updated_at
        )
      `).eq("resume_id", targetResumeId).eq("blocks.id", experienceId).eq("blocks.type", "experience").single();
    // Filter by visibility if not including private
    if (!includePrivate) {
      query = query.neq("blocks.visibility", "private");
    }
    const { data, error } = await query;
    if (error || !data) {
      throw createError("NOT_FOUND", "Experience not found");
    }
    const experience = data.blocks.data;
    return {
      type: "experience",
      data: experience,
      metadata: {
        id: data.blocks.id,
        visibility: data.blocks.visibility,
        created_at: data.blocks.created_at,
        updated_at: data.blocks.updated_at
      }
    };
  },
  /**
   * Create a new experience entry
   */ create_experience: async (params, context)=>{
    const { resumeId, company, title, startDate, endDate, current, description, achievements, technologies, visibility = "public" } = params;
    // Validate required fields
    if (!company || !title || !startDate) {
      throw createError("INVALID_PARAMS", "Company, title, and start date are required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "experience", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to create experience");
    }
    // Start transaction
    const timestamp = new Date().toISOString();
    try {
      // Create experience data
      const experienceData = {
        company,
        title,
        startDate,
        endDate: current ? null : endDate,
        current: current || false,
        description,
        achievements: achievements || [],
        technologies: technologies || []
      };
      // Create new experience block
      const { data: newBlock, error: createBlockError } = await supabase.from("blocks").insert({
        type: "experience",
        data: experienceData,
        visibility,
        user_id: context.userId,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (createBlockError || !newBlock) {
        throw createBlockError || new Error("Failed to create experience block");
      }
      // Get current max position
      const { data: maxPosData } = await supabase.from("resume_blocks").select("position").eq("resume_id", targetResumeId).order("position", {
        ascending: false
      }).limit(1);
      const nextPosition = maxPosData && maxPosData.length > 0 ? maxPosData[0].position + 1 : 0;
      // Link to resume
      const { error: linkError } = await supabase.from("resume_blocks").insert({
        resume_id: targetResumeId,
        block_id: newBlock.id,
        position: nextPosition
      });
      if (linkError) {
        throw linkError;
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("create_experience", {
          resume_id: targetResumeId,
          block_id: newBlock.id,
          company,
          title
        });
      }
      return {
        type: "success",
        message: "Experience created successfully",
        data: {
          id: newBlock.id,
          ...experienceData
        }
      };
    } catch (error) {
      console.error("Failed to create experience:", error);
      throw createError("DATABASE_ERROR", "Failed to create experience");
    }
  },
  /**
   * Update experience entry
   */ update_experience: async (params, context)=>{
    const { experienceId, resumeId, company, title, startDate, endDate, current, description, achievements, technologies } = params;
    if (!experienceId) {
      throw createError("INVALID_PARAMS", "Experience ID is required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "experience", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to update experience");
    }
    // Verify experience belongs to resume
    const { data: existingBlock, error: fetchError } = await supabase.from("resume_blocks").select("blocks!inner(id, data)").eq("resume_id", targetResumeId).eq("blocks.id", experienceId).eq("blocks.type", "experience").single();
    if (fetchError || !existingBlock) {
      throw createError("NOT_FOUND", "Experience not found");
    }
    // Update experience data
    const currentData = existingBlock.blocks.data || {};
    const updatedData = {
      ...currentData,
      ...company !== undefined && {
        company
      },
      ...title !== undefined && {
        title
      },
      ...startDate !== undefined && {
        startDate
      },
      ...endDate !== undefined && {
        endDate
      },
      ...current !== undefined && {
        current
      },
      ...description !== undefined && {
        description
      },
      ...achievements !== undefined && {
        achievements
      },
      ...technologies !== undefined && {
        technologies
      }
    };
    // If current is true, remove endDate
    if (updatedData.current) {
      delete updatedData.endDate;
    }
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase.from("blocks").update({
      data: updatedData,
      updated_at: timestamp
    }).eq("id", experienceId);
    if (updateError) {
      throw createError("DATABASE_ERROR", "Failed to update experience");
    }
    // Log audit event
    if (context.monitor) {
      await context.monitor.logAudit("update_experience", {
        resume_id: targetResumeId,
        block_id: experienceId,
        changes: Object.keys(params).filter((k)=>k !== "experienceId" && k !== "resumeId")
      });
    }
    return {
      type: "success",
      message: "Experience updated successfully",
      data: {
        id: experienceId,
        ...updatedData
      }
    };
  },
  /**
   * Delete experience entry
   */ delete_experience: async (params, context)=>{
    const { experienceId, resumeId } = params;
    if (!experienceId) {
      throw createError("INVALID_PARAMS", "Experience ID is required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "experience", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to delete experience");
    }
    // Verify experience belongs to resume
    const { data: existingBlock, error: fetchError } = await supabase.from("resume_blocks").select("block_id").eq("resume_id", targetResumeId).eq("block_id", experienceId).single();
    if (fetchError || !existingBlock) {
      throw createError("NOT_FOUND", "Experience not found");
    }
    // Delete the link first
    const { error: unlinkError } = await supabase.from("resume_blocks").delete().eq("resume_id", targetResumeId).eq("block_id", experienceId);
    if (unlinkError) {
      throw createError("DATABASE_ERROR", "Failed to unlink experience");
    }
    // Delete the block
    const { error: deleteError } = await supabase.from("blocks").delete().eq("id", experienceId);
    if (deleteError) {
      throw createError("DATABASE_ERROR", "Failed to delete experience");
    }
    // Log audit event
    if (context.monitor) {
      await context.monitor.logAudit("delete_experience", {
        resume_id: targetResumeId,
        block_id: experienceId
      });
    }
    return {
      type: "success",
      message: "Experience deleted successfully"
    };
  }
};
// Export handlers with caching applied
export const cachedHandlers = {
  // Read operations with caching
  list_all_experiences: withCache("list_all_experiences", handlers.list_all_experiences),
  get_experience_by_company: withCache("get_experience_by_company", handlers.get_experience_by_company),
  get_experience_details: withCache("get_experience_details", handlers.get_experience_details),
  // Mutation operations with cache invalidation
  create_experience: withCacheInvalidation("create_experience", handlers.create_experience),
  update_experience: withCacheInvalidation("update_experience", handlers.update_experience),
  delete_experience: withCacheInvalidation("delete_experience", handlers.delete_experience)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
