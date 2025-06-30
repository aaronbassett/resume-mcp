// Education Tools - Database Implementation
// Database-backed implementations for education-related MCP methods
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
// Education tool handlers
const handlers = {
  /**
   * List education entries with advanced filtering and pagination
   */ list_education: async (params, context)=>{
    const { resumeId, limit = 20, offset = 0, institution, degree, field, graduationYear, sortBy = "graduationDate", sortOrder = "desc", search } = params;
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
    // Build query with count
    let countQuery = supabase.from("resume_blocks").select("block_id", {
      count: "exact"
    }).eq("resume_id", targetResumeId).eq("blocks.type", "education");
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
      `).eq("resume_id", targetResumeId).eq("blocks.type", "education");
    // Filter by visibility if not including private
    if (!includePrivate) {
      query = query.neq("blocks.visibility", "private");
      countQuery = countQuery.neq("blocks.visibility", "private");
    }
    // Apply filters
    if (institution) {
      query = query.ilike("blocks.data->institution", `%${institution}%`);
      countQuery = countQuery.ilike("blocks.data->institution", `%${institution}%`);
    }
    if (degree) {
      query = query.ilike("blocks.data->degree", `%${degree}%`);
      countQuery = countQuery.ilike("blocks.data->degree", `%${degree}%`);
    }
    if (field) {
      query = query.ilike("blocks.data->field", `%${field}%`);
      countQuery = countQuery.ilike("blocks.data->field", `%${field}%`);
    }
    if (graduationYear) {
      // Extract year from graduation date
      query = query.eq("blocks.data->graduationYear", graduationYear);
      countQuery = countQuery.eq("blocks.data->graduationYear", graduationYear);
    }
    // Apply search across multiple fields
    if (search) {
      const searchTerm = `%${search}%`;
      query = query.or(`blocks.data->institution.ilike.${searchTerm},blocks.data->degree.ilike.${searchTerm},blocks.data->field.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm}`);
      countQuery = countQuery.or(`blocks.data->institution.ilike.${searchTerm},blocks.data->degree.ilike.${searchTerm},blocks.data->field.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm}`);
    }
    // Apply sorting
    const ascending = sortOrder === "asc";
    switch(sortBy){
      case "graduationDate":
        query = query.order("blocks.data->graduationDate", {
          ascending
        });
        break;
      case "institution":
        query = query.order("blocks.data->institution", {
          ascending
        });
        break;
      case "degree":
        query = query.order("blocks.data->degree", {
          ascending
        });
        break;
      case "gpa":
        query = query.order("blocks.data->gpa", {
          ascending
        });
        break;
      case "created_at":
        query = query.order("blocks.created_at", {
          ascending
        });
        break;
      default:
        query = query.order("blocks.data->graduationDate", {
          ascending: false
        });
    }
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    // Execute queries
    const [{ data: educationData, error: dataError }, { count, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);
    if (dataError) {
      console.error("Error fetching education data:", dataError);
      throw createError("DATABASE_ERROR", "Failed to fetch education");
    }
    if (countError) {
      console.error("Error counting education:", countError);
      throw createError("DATABASE_ERROR", "Failed to count education");
    }
    const education = educationData || [];
    const totalCount = count || 0;
    // Format education
    const formattedEducation = education.map((item)=>({
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
      type: "education",
      data: formattedEducation,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + education.length < totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit)
      },
      filters: {
        institution,
        degree,
        field,
        graduationYear,
        search,
        sortBy,
        sortOrder
      },
      count: education.length,
      totalCount
    };
  },
  /**
   * Get highest degree achieved
   */ get_highest_degree: async (params, context)=>{
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
    // Get all education entries and find highest degree
    let query = supabase.from("resume_blocks").select(`
        blocks!inner(
          id,
          data,
          visibility
        )
      `).eq("resume_id", targetResumeId).eq("blocks.type", "education");
    // Filter by visibility if not including private
    if (!includePrivate) {
      query = query.neq("blocks.visibility", "private");
    }
    const { data, error } = await query;
    if (error) {
      console.error("Error fetching education data:", error);
      throw createError("DATABASE_ERROR", "Failed to fetch education");
    }
    if (!data || data.length === 0) {
      return {
        type: "education",
        message: "No education entries found",
        data: null
      };
    }
    // Define degree hierarchy (highest to lowest)
    const degreeHierarchy = [
      "phd",
      "doctorate",
      "doctoral",
      "md",
      "jd",
      "edd",
      "masters",
      "master",
      "mba",
      "ms",
      "ma",
      "msc",
      "bachelors",
      "bachelor",
      "bs",
      "ba",
      "bsc",
      "be",
      "associates",
      "associate",
      "aa",
      "as",
      "certificate",
      "diploma",
      "certification"
    ];
    // Find the highest degree
    let highestDegree = null;
    let highestRank = degreeHierarchy.length;
    for (const entry of data){
      const degree = entry.blocks.data?.degree?.toLowerCase() || "";
      const rank = degreeHierarchy.findIndex((d)=>degree.includes(d));
      if (rank !== -1 && rank < highestRank) {
        highestRank = rank;
        highestDegree = entry.blocks.data;
      }
    }
    return {
      type: "education",
      data: highestDegree,
      metadata: {
        totalEducationEntries: data.length,
        degreeLevel: highestDegree ? degreeHierarchy[highestRank] : null
      }
    };
  },
  /**
   * Create a new education entry
   */ create_education: async (params, context)=>{
    const { resumeId, institution, degree, field, graduationDate, gpa, honors, activities, coursework, description, visibility = "public" } = params;
    // Validate required fields
    if (!institution || !degree || !field) {
      throw createError("INVALID_PARAMS", "Institution, degree, and field are required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "education", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to create education entries");
    }
    const timestamp = new Date().toISOString();
    try {
      // Extract graduation year from date
      const graduationYear = graduationDate ? new Date(graduationDate).getFullYear() : null;
      // Create education data
      const educationData = {
        institution,
        degree,
        field,
        graduationDate,
        graduationYear,
        gpa,
        honors: honors || [],
        activities: activities || [],
        coursework: coursework || [],
        description
      };
      // Create new education block
      const { data: newBlock, error: createBlockError } = await supabase.from("blocks").insert({
        type: "education",
        data: educationData,
        visibility,
        user_id: context.userId,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (createBlockError || !newBlock) {
        throw createBlockError || new Error("Failed to create education block");
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
        message: "Education entry created successfully",
        data: {
          id: newBlock.id,
          ...educationData
        }
      };
    } catch (error) {
      console.error("Failed to create education entry:", error);
      throw createError("DATABASE_ERROR", "Failed to create education entry");
    }
  }
};
// Export handlers with caching applied
export const cachedHandlers = {
  // Read operations with caching
  list_education: withCache("list_education", handlers.list_education),
  get_highest_degree: withCache("get_highest_degree", handlers.get_highest_degree),
  // Mutation operations with cache invalidation
  create_education: withCacheInvalidation("create_education", handlers.create_education)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
