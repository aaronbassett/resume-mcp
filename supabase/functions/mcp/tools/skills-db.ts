// Skills Tools - Database Implementation
// Database-backed implementations for skills-related MCP methods
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../utils/errors.ts";
import { getPermissionService } from "../services/permissions.ts";
import { withCache, withCacheInvalidation } from "../middleware/cache.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Check if user has permission to access private data
 */ async function canAccessPrivateData(apiKeyId, resumeId) {
  const permissionService = getPermissionService();
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  const hasWrite = await permissionService.checkPermission(apiKeyId, "resume", "write");
  const hasPrivateRead = await permissionService.checkPermission(apiKeyId, "resume", "read:private");
  return hasAdmin || hasWrite || hasPrivateRead;
}
// Skills tool handlers
const handlers = {
  /**
   * List all skills with category grouping and advanced filtering
   */ list_all_skills: async (params, context)=>{
    const { resumeId, limit = 50, offset = 0, category, level, search, sortBy = "name", sortOrder = "asc", groupByCategory = true, includeYears = true } = params;
    // Validate pagination params
    if (limit < 1 || limit > 200) {
      throw createError("INVALID_PARAMS", "Limit must be between 1 and 200");
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
    // Build query with count
    let countQuery = supabase.from("resume_blocks").select("block_id", {
      count: "exact"
    }).eq("resume_id", targetResumeId).eq("blocks.type", "skill");
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
      `).eq("resume_id", targetResumeId).eq("blocks.type", "skill");
    // Filter by visibility if not including private
    if (!includePrivate) {
      query = query.neq("blocks.visibility", "private");
      countQuery = countQuery.neq("blocks.visibility", "private");
    }
    // Apply filters
    if (category) {
      query = query.ilike("blocks.data->category", `%${category}%`);
      countQuery = countQuery.ilike("blocks.data->category", `%${category}%`);
    }
    if (level) {
      query = query.eq("blocks.data->level", level);
      countQuery = countQuery.eq("blocks.data->level", level);
    }
    // Apply search across multiple fields
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`blocks.data->name.ilike.${searchTerm},blocks.data->category.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm}`);
      countQuery = countQuery.or(`blocks.data->name.ilike.${searchTerm},blocks.data->category.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm}`);
    }
    // Apply sorting
    const ascending = sortOrder === "asc";
    switch(sortBy){
      case "name":
        query = query.order("blocks.data->name", {
          ascending
        });
        break;
      case "level":
        // Custom order for skill levels
        query = query.order("blocks.data->level", {
          ascending
        });
        break;
      case "years":
        query = query.order("blocks.data->years", {
          ascending
        });
        break;
      case "category":
        query = query.order("blocks.data->category", {
          ascending
        });
        break;
      case "created_at":
        query = query.order("blocks.created_at", {
          ascending
        });
        break;
      default:
        query = query.order("blocks.data->category", {
          ascending: true
        }).order("blocks.data->name", {
          ascending: true
        });
    }
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    // Execute queries
    const [{ data: skillsData, error: dataError }, { count, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);
    if (dataError) {
      console.error("Error fetching skills data:", dataError);
      throw createError("DATABASE_ERROR", "Failed to fetch skills");
    }
    if (countError) {
      console.error("Error counting skills:", countError);
      throw createError("DATABASE_ERROR", "Failed to count skills");
    }
    const skills = skillsData || [];
    const totalCount = count || 0;
    // Format skills
    let formattedSkills = skills.map((item)=>{
      const skillData = {
        ...item.blocks.data
      };
      // Remove years if not requested
      if (!includeYears) {
        delete skillData.years;
      }
      return {
        id: item.blocks.id,
        position: item.position,
        ...skillData,
        metadata: {
          visibility: item.blocks.visibility,
          created_at: item.blocks.created_at,
          updated_at: item.blocks.updated_at
        }
      };
    });
    // Group by category if requested
    let result = {
      type: "skills",
      count: skills.length,
      totalCount,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + skills.length < totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit)
      },
      filters: {
        category,
        level,
        search,
        sortBy,
        sortOrder,
        groupByCategory,
        includeYears
      }
    };
    if (groupByCategory) {
      // Group skills by category
      const groupedSkills = {};
      formattedSkills.forEach((skill)=>{
        const cat = skill.category || "Uncategorized";
        if (!groupedSkills[cat]) {
          groupedSkills[cat] = [];
        }
        groupedSkills[cat].push(skill);
      });
      result.categories = groupedSkills;
      result.categoryCount = Object.keys(groupedSkills).length;
    } else {
      result.data = formattedSkills;
    }
    return result;
  },
  /**
   * Get skills filtered by category
   */ get_skills_by_category: async (params, context)=>{
    const { category, resumeId, limit = 50, offset = 0, sortBy = "name", sortOrder = "asc" } = params;
    if (!category) {
      throw createError("INVALID_PARAMS", "Category is required");
    }
    // Use the main list function with category filter
    return await handlers.list_all_skills({
      resumeId,
      category,
      limit,
      offset,
      sortBy,
      sortOrder,
      groupByCategory: false
    }, context);
  },
  /**
   * Search for specific skills
   */ search_skills: async (params, context)=>{
    const { query: searchQuery, resumeId, limit = 50, offset = 0, groupByCategory = true } = params;
    if (!searchQuery) {
      throw createError("INVALID_PARAMS", "Search query is required");
    }
    // Use the main list function with search filter
    const result = await handlers.list_all_skills({
      resumeId,
      search: searchQuery,
      limit,
      offset,
      groupByCategory
    }, context);
    return {
      ...result,
      searchQuery
    };
  },
  /**
   * Create a new skill entry
   */ create_skill: async (params, context)=>{
    const { resumeId, name, category, level, years, description, keywords, visibility = "public" } = params;
    // Validate required fields
    if (!name || !category) {
      throw createError("INVALID_PARAMS", "Name and category are required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "skill", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to create skills");
    }
    const timestamp = new Date().toISOString();
    try {
      // Create skill data
      const skillData = {
        name,
        category,
        level,
        years,
        description,
        keywords: keywords || []
      };
      // Create new skill block
      const { data: newBlock, error: createBlockError } = await supabase.from("blocks").insert({
        type: "skill",
        data: skillData,
        visibility,
        user_id: context.userId,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (createBlockError || !newBlock) {
        throw createBlockError || new Error("Failed to create skill block");
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
      return {
        type: "success",
        message: "Skill created successfully",
        data: {
          id: newBlock.id,
          ...skillData
        }
      };
    } catch (error) {
      console.error("Failed to create skill:", error);
      throw createError("DATABASE_ERROR", "Failed to create skill");
    }
  },
  /**
   * Update skill entry
   */ update_skill: async (params, context)=>{
    const { skillId, resumeId, name, category, level, years, description, keywords } = params;
    if (!skillId) {
      throw createError("INVALID_PARAMS", "Skill ID is required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "skill", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to update skills");
    }
    // Verify skill belongs to resume
    const { data: existingBlock, error: fetchError } = await supabase.from("resume_blocks").select("blocks!inner(id, data)").eq("resume_id", targetResumeId).eq("blocks.id", skillId).eq("blocks.type", "skill").single();
    if (fetchError || !existingBlock) {
      throw createError("NOT_FOUND", "Skill not found");
    }
    // Update skill data
    const currentData = existingBlock.blocks.data || {};
    const updatedData = {
      ...currentData,
      ...name !== undefined && {
        name
      },
      ...category !== undefined && {
        category
      },
      ...level !== undefined && {
        level
      },
      ...years !== undefined && {
        years
      },
      ...description !== undefined && {
        description
      },
      ...keywords !== undefined && {
        keywords
      }
    };
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase.from("blocks").update({
      data: updatedData,
      updated_at: timestamp
    }).eq("id", skillId);
    if (updateError) {
      throw createError("DATABASE_ERROR", "Failed to update skill");
    }
    return {
      type: "success",
      message: "Skill updated successfully",
      data: {
        id: skillId,
        ...updatedData
      }
    };
  },
  /**
   * Delete skill entry
   */ delete_skill: async (params, context)=>{
    const { skillId, resumeId } = params;
    if (!skillId) {
      throw createError("INVALID_PARAMS", "Skill ID is required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "skill", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to delete skills");
    }
    // Verify skill belongs to resume
    const { data: existingBlock, error: fetchError } = await supabase.from("resume_blocks").select("block_id").eq("resume_id", targetResumeId).eq("block_id", skillId).single();
    if (fetchError || !existingBlock) {
      throw createError("NOT_FOUND", "Skill not found");
    }
    // Delete the link first
    const { error: unlinkError } = await supabase.from("resume_blocks").delete().eq("resume_id", targetResumeId).eq("block_id", skillId);
    if (unlinkError) {
      throw createError("DATABASE_ERROR", "Failed to unlink skill");
    }
    // Delete the block
    const { error: deleteError } = await supabase.from("blocks").delete().eq("id", skillId);
    if (deleteError) {
      throw createError("DATABASE_ERROR", "Failed to delete skill");
    }
    return {
      type: "success",
      message: "Skill deleted successfully"
    };
  }
};
// Export handlers with caching applied
export const cachedHandlers = {
  // Read operations with caching
  list_all_skills: withCache("list_all_skills", handlers.list_all_skills),
  get_skills_by_category: withCache("get_skills_by_category", handlers.get_skills_by_category),
  search_skills: withCache("search_skills", handlers.search_skills),
  // Mutation operations with cache invalidation
  create_skill: withCacheInvalidation("create_skill", handlers.create_skill),
  update_skill: withCacheInvalidation("update_skill", handlers.update_skill),
  delete_skill: withCacheInvalidation("delete_skill", handlers.delete_skill)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
