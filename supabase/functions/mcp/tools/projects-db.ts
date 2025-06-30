// Project Tools - Database Implementation
// Database-backed implementations for project-related MCP methods
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../utils/errors.ts";
import { ResumeFormatters } from "../utils/formatter.ts";
import { getPermissionService } from "../services/permissions.ts";
import { withCache } from "../middleware/cache.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
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
// Project tool handlers
const handlers = {
  /**
   * List all projects with advanced filtering and pagination
   */ list_projects: async (params, context)=>{
    const { resumeId, limit = 10, offset = 0, technology, featured, status, startDate, endDate, sortBy = "startDate", sortOrder = "desc", search, includeArchived = false } = params;
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
    }).eq("resume_id", targetResumeId).eq("blocks.type", "project");
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
      `).eq("resume_id", targetResumeId).eq("blocks.type", "project");
    // Filter by visibility if not including private
    if (!includePrivate) {
      query = query.neq("blocks.visibility", "private");
      countQuery = countQuery.neq("blocks.visibility", "private");
    }
    // Apply filters
    if (technology) {
      // Use PostgreSQL array contains check
      query = query.contains("blocks.data->technologies", `["${technology}"]`);
      countQuery = countQuery.contains("blocks.data->technologies", `["${technology}"]`);
    }
    if (featured !== undefined) {
      query = query.eq("blocks.data->featured", featured);
      countQuery = countQuery.eq("blocks.data->featured", featured);
    }
    if (status) {
      if (status === "archived" && !includeArchived) {
        // If looking for archived but not including them, return empty
        return {
          type: "projects",
          data: [],
          pagination: {
            limit,
            offset,
            total: 0,
            hasMore: false,
            currentPage: 1,
            totalPages: 0
          },
          filters: {
            technology,
            featured,
            status,
            startDate,
            endDate,
            search,
            sortBy,
            sortOrder,
            includeArchived
          },
          count: 0,
          totalCount: 0
        };
      }
      query = query.eq("blocks.data->status", status);
      countQuery = countQuery.eq("blocks.data->status", status);
    }
    // Exclude archived unless explicitly included
    if (!includeArchived) {
      query = query.neq("blocks.data->archived", true);
      countQuery = countQuery.neq("blocks.data->archived", true);
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
      query = query.or(`blocks.data->name.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm},blocks.data->technologies.cs.{${search}}`);
      countQuery = countQuery.or(`blocks.data->name.ilike.${searchTerm},blocks.data->description.ilike.${searchTerm},blocks.data->technologies.cs.{${search}}`);
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
      case "name":
        query = query.order("blocks.data->name", {
          ascending
        });
        break;
      case "featured":
        query = query.order("blocks.data->featured", {
          ascending: !ascending
        }); // Featured first when desc
        break;
      case "created_at":
        query = query.order("blocks.created_at", {
          ascending
        });
        break;
      default:
        // Default: featured first, then by start date (newest first)
        query = query.order("blocks.data->featured", {
          ascending: false
        }).order("blocks.data->startDate", {
          ascending: false
        });
    }
    // Apply pagination
    query = query.range(offset, offset + limit - 1);
    // Execute queries
    const [{ data: projectsData, error: dataError }, { count, error: countError }] = await Promise.all([
      query,
      countQuery
    ]);
    if (dataError) {
      console.error("Error fetching projects data:", dataError);
      throw createError("DATABASE_ERROR", "Failed to fetch projects");
    }
    if (countError) {
      console.error("Error counting projects:", countError);
      throw createError("DATABASE_ERROR", "Failed to count projects");
    }
    const projects = projectsData || [];
    const totalCount = count || 0;
    // Format projects
    const formattedProjects = projects.map((item)=>({
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
      type: "projects",
      data: formattedProjects,
      pagination: {
        limit,
        offset,
        total: totalCount,
        hasMore: offset + projects.length < totalCount,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(totalCount / limit)
      },
      filters: {
        technology,
        featured,
        status,
        startDate,
        endDate,
        search,
        sortBy,
        sortOrder,
        includeArchived
      },
      count: projects.length,
      totalCount
    };
  },
  /**
   * Get projects by technology
   */ get_projects_by_technology: async (params, context)=>{
    const { technology, resumeId, limit = 10 } = params;
    if (!technology) {
      throw createError("INVALID_PARAMS", "Technology is required");
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
    // Get filtered project blocks
    const projects = await getProjectBlocks(targetResumeId, includePrivate, {
      technology,
      limit
    });
    if (projects.length === 0) {
      return {
        type: "projects",
        count: 0,
        items: [],
        message: `No projects found using technology: ${technology}`
      };
    }
    // Format projects
    const formattedProjects = projects.map((proj)=>proj.data);
    return ResumeFormatters.projects(formattedProjects);
  },
  /**
   * Get featured projects
   */ get_featured_projects: async (params, context)=>{
    const { resumeId, limit = 5 } = params;
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
    // Get featured project blocks
    const projects = await getProjectBlocks(targetResumeId, includePrivate, {
      featured: true,
      limit
    });
    // Format projects
    const formattedProjects = projects.map((proj)=>proj.data);
    return ResumeFormatters.projects(formattedProjects);
  },
  /**
   * Get project details by ID
   */ get_project_details: async (params, context)=>{
    const { projectId, resumeId } = params;
    if (!projectId) {
      throw createError("INVALID_PARAMS", "Project ID is required");
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
    // Get specific project block
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
      `).eq("resume_id", targetResumeId).eq("blocks.id", projectId).eq("blocks.type", "project").single();
    // Filter by visibility if not including private
    if (!includePrivate) {
      query = query.neq("blocks.visibility", "private");
    }
    const { data, error } = await query;
    if (error || !data) {
      throw createError("NOT_FOUND", "Project not found");
    }
    const project = data.blocks.data;
    return {
      type: "project",
      data: project,
      metadata: {
        id: data.blocks.id,
        visibility: data.blocks.visibility,
        created_at: data.blocks.created_at,
        updated_at: data.blocks.updated_at
      }
    };
  },
  /**
   * Create a new project
   */ create_project: async (params, context)=>{
    const { resumeId, name, description, technologies, startDate, endDate, ongoing, featured, url, githubUrl, achievements, role, teamSize, visibility = "public" } = params;
    // Validate required fields
    if (!name || !description || !technologies || technologies.length === 0) {
      throw createError("INVALID_PARAMS", "Name, description, and technologies are required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "project", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to create project");
    }
    // Start transaction
    const timestamp = new Date().toISOString();
    try {
      // Create project data
      const projectData = {
        name,
        description,
        technologies,
        startDate,
        endDate: ongoing ? null : endDate,
        ongoing: ongoing || false,
        featured: featured || false,
        url,
        githubUrl,
        achievements: achievements || [],
        role,
        teamSize
      };
      // Create new project block
      const { data: newBlock, error: createBlockError } = await supabase.from("blocks").insert({
        type: "project",
        data: projectData,
        visibility,
        user_id: context.userId,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (createBlockError || !newBlock) {
        throw createBlockError || new Error("Failed to create project block");
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
        await context.monitor.logAudit("create_project", {
          resume_id: targetResumeId,
          block_id: newBlock.id,
          name,
          featured
        });
      }
      return {
        type: "success",
        message: "Project created successfully",
        data: {
          id: newBlock.id,
          ...projectData
        }
      };
    } catch (error) {
      console.error("Failed to create project:", error);
      throw createError("DATABASE_ERROR", "Failed to create project");
    }
  },
  /**
   * Update project
   */ update_project: async (params, context)=>{
    const { projectId, resumeId, name, description, technologies, startDate, endDate, ongoing, featured, url, githubUrl, achievements, role, teamSize } = params;
    if (!projectId) {
      throw createError("INVALID_PARAMS", "Project ID is required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "project", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to update project");
    }
    // Verify project belongs to resume
    const { data: existingBlock, error: fetchError } = await supabase.from("resume_blocks").select("blocks!inner(id, data)").eq("resume_id", targetResumeId).eq("blocks.id", projectId).eq("blocks.type", "project").single();
    if (fetchError || !existingBlock) {
      throw createError("NOT_FOUND", "Project not found");
    }
    // Update project data
    const currentData = existingBlock.blocks.data || {};
    const updatedData = {
      ...currentData,
      ...name !== undefined && {
        name
      },
      ...description !== undefined && {
        description
      },
      ...technologies !== undefined && {
        technologies
      },
      ...startDate !== undefined && {
        startDate
      },
      ...endDate !== undefined && {
        endDate
      },
      ...ongoing !== undefined && {
        ongoing
      },
      ...featured !== undefined && {
        featured
      },
      ...url !== undefined && {
        url
      },
      ...githubUrl !== undefined && {
        githubUrl
      },
      ...achievements !== undefined && {
        achievements
      },
      ...role !== undefined && {
        role
      },
      ...teamSize !== undefined && {
        teamSize
      }
    };
    // If ongoing is true, remove endDate
    if (updatedData.ongoing) {
      delete updatedData.endDate;
    }
    const timestamp = new Date().toISOString();
    const { error: updateError } = await supabase.from("blocks").update({
      data: updatedData,
      updated_at: timestamp
    }).eq("id", projectId);
    if (updateError) {
      throw createError("DATABASE_ERROR", "Failed to update project");
    }
    // Log audit event
    if (context.monitor) {
      await context.monitor.logAudit("update_project", {
        resume_id: targetResumeId,
        block_id: projectId,
        changes: Object.keys(params).filter((k)=>k !== "projectId" && k !== "resumeId")
      });
    }
    return {
      type: "success",
      message: "Project updated successfully",
      data: {
        id: projectId,
        ...updatedData
      }
    };
  },
  /**
   * Delete project
   */ delete_project: async (params, context)=>{
    const { projectId, resumeId } = params;
    if (!projectId) {
      throw createError("INVALID_PARAMS", "Project ID is required");
    }
    // Use resume ID from context if not provided
    const targetResumeId = resumeId || context.resumeId;
    if (!targetResumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify API key has write access
    const permissionService = getPermissionService();
    const hasWrite = await permissionService.checkPermission(context.apiKeyId, "project", "write");
    if (!hasWrite) {
      throw createError("FORBIDDEN", "No permission to delete project");
    }
    // Verify project belongs to resume
    const { data: existingBlock, error: fetchError } = await supabase.from("resume_blocks").select("block_id").eq("resume_id", targetResumeId).eq("block_id", projectId).single();
    if (fetchError || !existingBlock) {
      throw createError("NOT_FOUND", "Project not found");
    }
    // Delete the link first
    const { error: unlinkError } = await supabase.from("resume_blocks").delete().eq("resume_id", targetResumeId).eq("block_id", projectId);
    if (unlinkError) {
      throw createError("DATABASE_ERROR", "Failed to unlink project");
    }
    // Delete the block
    const { error: deleteError } = await supabase.from("blocks").delete().eq("id", projectId);
    if (deleteError) {
      throw createError("DATABASE_ERROR", "Failed to delete project");
    }
    // Log audit event
    if (context.monitor) {
      await context.monitor.logAudit("delete_project", {
        resume_id: targetResumeId,
        block_id: projectId
      });
    }
    return {
      type: "success",
      message: "Project deleted successfully"
    };
  }
};
// Export handlers with caching applied
export const cachedHandlers = {
  // Read operations with caching
  list_projects: withCache("list_projects", handlers.list_projects),
  get_projects_by_technology: withCache("get_projects_by_technology", handlers.get_projects_by_technology),
  get_featured_projects: withCache("get_featured_projects", handlers.get_featured_projects),
  get_project_details: withCache("get_project_details", handlers.get_project_details)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
