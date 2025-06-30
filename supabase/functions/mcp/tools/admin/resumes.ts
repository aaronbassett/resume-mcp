// Resume Management Tools
// CRUD operations for resumes with validation and access control
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../../utils/errors.ts";
import { getPermissionService } from "../../services/permissions.ts";
import { withCacheInvalidation } from "../../middleware/cache.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Check if user has admin permissions
 */ async function hasAdminPermission(apiKeyId) {
  const permissionService = getPermissionService();
  return await permissionService.checkPermission(apiKeyId, "admin", "*");
}
/**
 * Check if user has write permissions for resume
 */ async function hasResumeWritePermission(apiKeyId) {
  const permissionService = getPermissionService();
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  const hasWrite = await permissionService.checkPermission(apiKeyId, "resume", "write");
  return hasAdmin || hasWrite;
}
// Resume management handlers
const handlers = {
  /**
   * Create a new resume
   */ create_resume: async (params, context)=>{
    const { title, isPublic = false, metadata = {} } = params;
    // Validate required fields
    if (!title || title.trim().length === 0) {
      throw createError("INVALID_PARAMS", "Title is required");
    }
    // Verify permissions
    if (!await hasResumeWritePermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to create resumes");
    }
    const timestamp = new Date().toISOString();
    try {
      // Create the resume
      const { data: newResume, error } = await supabase.from("resumes").insert({
        user_id: context.userId,
        title: title.trim(),
        is_public: isPublic,
        metadata,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (error || !newResume) {
        throw error || new Error("Failed to create resume");
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("create_resume", {
          resume_id: newResume.id,
          title: newResume.title
        });
      }
      return {
        type: "success",
        message: "Resume created successfully",
        data: {
          id: newResume.id,
          title: newResume.title,
          isPublic: newResume.is_public,
          metadata: newResume.metadata,
          createdAt: newResume.created_at,
          updatedAt: newResume.updated_at
        }
      };
    } catch (error) {
      console.error("Failed to create resume:", error);
      throw createError("DATABASE_ERROR", "Failed to create resume");
    }
  },
  /**
   * Get resume details
   */ get_resume: async (params, context)=>{
    const { resumeId } = params;
    if (!resumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    try {
      // Get resume details
      const { data: resume, error } = await supabase.from("resumes").select(`
          id,
          title,
          is_public,
          metadata,
          created_at,
          updated_at,
          resume_blocks (
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
          )
        `).eq("id", resumeId).single();
      if (error || !resume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check access permissions
      const isOwner = resume.user_id === context.userId;
      const hasAdmin = await hasAdminPermission(context.apiKeyId);
      const isPublic = resume.is_public;
      if (!isOwner && !hasAdmin && !isPublic) {
        throw createError("FORBIDDEN", "Access denied to this resume");
      }
      // Sort blocks by position
      const sortedBlocks = (resume.resume_blocks || []).sort((a, b)=>a.position - b.position).map((rb)=>({
          id: rb.blocks.id,
          position: rb.position,
          type: rb.blocks.type,
          data: rb.blocks.data,
          metadata: rb.blocks.metadata,
          visibility: rb.blocks.visibility,
          createdAt: rb.blocks.created_at,
          updatedAt: rb.blocks.updated_at
        }));
      return {
        type: "resume",
        data: {
          id: resume.id,
          title: resume.title,
          isPublic: resume.is_public,
          metadata: resume.metadata,
          blocks: sortedBlocks,
          blockCount: sortedBlocks.length,
          createdAt: resume.created_at,
          updatedAt: resume.updated_at
        }
      };
    } catch (error) {
      if (error.code) throw error; // Re-throw our errors
      console.error("Failed to get resume:", error);
      throw createError("DATABASE_ERROR", "Failed to fetch resume");
    }
  },
  /**
   * List all resumes for the current user
   */ list_resumes: async (params, context)=>{
    const { limit = 20, offset = 0, includePublic = false, sortBy = "updated_at", sortOrder = "desc" } = params;
    // Validate pagination
    if (limit < 1 || limit > 100) {
      throw createError("INVALID_PARAMS", "Limit must be between 1 and 100");
    }
    if (offset < 0) {
      throw createError("INVALID_PARAMS", "Offset must be non-negative");
    }
    try {
      // Build query
      let query = supabase.from("resumes").select("*", {
        count: "exact"
      });
      // Filter by user unless admin wants all public resumes
      if (includePublic && await hasAdminPermission(context.apiKeyId)) {
        query = query.or(`user_id.eq.${context.userId},is_public.eq.true`);
      } else {
        query = query.eq("user_id", context.userId);
      }
      // Apply sorting
      query = query.order(sortBy, {
        ascending: sortOrder === "asc"
      });
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      const { data: resumes, error, count } = await query;
      if (error) {
        throw error;
      }
      const totalCount = count || 0;
      // Get block counts for each resume
      const resumeIds = resumes?.map((r)=>r.id) || [];
      const { data: blockCounts } = await supabase.from("resume_blocks").select("resume_id").in("resume_id", resumeIds);
      const blockCountMap = new Map();
      blockCounts?.forEach((bc)=>{
        const currentCount = blockCountMap.get(bc.resume_id) || 0;
        blockCountMap.set(bc.resume_id, currentCount + 1);
      });
      const formattedResumes = resumes?.map((resume)=>({
          id: resume.id,
          title: resume.title,
          isPublic: resume.is_public,
          metadata: resume.metadata,
          blockCount: blockCountMap.get(resume.id) || 0,
          createdAt: resume.created_at,
          updatedAt: resume.updated_at
        })) || [];
      return {
        type: "resumes",
        data: formattedResumes,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: offset + formattedResumes.length < totalCount,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit)
        }
      };
    } catch (error) {
      console.error("Failed to list resumes:", error);
      throw createError("DATABASE_ERROR", "Failed to list resumes");
    }
  },
  /**
   * Update resume details
   */ update_resume: async (params, context)=>{
    const { resumeId, title, isPublic, metadata } = params;
    if (!resumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify permissions
    if (!await hasResumeWritePermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to update resumes");
    }
    try {
      // Verify resume exists and user has access
      const { data: existingResume, error: fetchError } = await supabase.from("resumes").select("id, user_id").eq("id", resumeId).single();
      if (fetchError || !existingResume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check ownership unless admin
      const isOwner = existingResume.user_id === context.userId;
      const isAdmin = await hasAdminPermission(context.apiKeyId);
      if (!isOwner && !isAdmin) {
        throw createError("FORBIDDEN", "Access denied to this resume");
      }
      // Build update object
      const updates = {
        updated_at: new Date().toISOString()
      };
      if (title !== undefined) {
        if (!title.trim()) {
          throw createError("INVALID_PARAMS", "Title cannot be empty");
        }
        updates.title = title.trim();
      }
      if (isPublic !== undefined) {
        updates.is_public = isPublic;
      }
      if (metadata !== undefined) {
        updates.metadata = metadata;
      }
      // Update resume
      const { data: updatedResume, error: updateError } = await supabase.from("resumes").update(updates).eq("id", resumeId).select().single();
      if (updateError || !updatedResume) {
        throw updateError || new Error("Failed to update resume");
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("update_resume", {
          resume_id: resumeId,
          updates: Object.keys(updates)
        });
      }
      return {
        type: "success",
        message: "Resume updated successfully",
        data: {
          id: updatedResume.id,
          title: updatedResume.title,
          isPublic: updatedResume.is_public,
          metadata: updatedResume.metadata,
          updatedAt: updatedResume.updated_at
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to update resume:", error);
      throw createError("DATABASE_ERROR", "Failed to update resume");
    }
  },
  /**
   * Delete a resume
   */ delete_resume: async (params, context)=>{
    const { resumeId } = params;
    if (!resumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify permissions
    if (!await hasResumeWritePermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to delete resumes");
    }
    try {
      // Verify resume exists and user has access
      const { data: existingResume, error: fetchError } = await supabase.from("resumes").select("id, user_id, title").eq("id", resumeId).single();
      if (fetchError || !existingResume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check ownership unless admin
      const isOwner = existingResume.user_id === context.userId;
      const isAdmin = await hasAdminPermission(context.apiKeyId);
      if (!isOwner && !isAdmin) {
        throw createError("FORBIDDEN", "Access denied to this resume");
      }
      // Delete resume (cascade will handle resume_blocks)
      const { error: deleteError } = await supabase.from("resumes").delete().eq("id", resumeId);
      if (deleteError) {
        throw deleteError;
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("delete_resume", {
          resume_id: resumeId,
          title: existingResume.title
        });
      }
      return {
        type: "success",
        message: "Resume deleted successfully",
        data: {
          id: resumeId
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to delete resume:", error);
      throw createError("DATABASE_ERROR", "Failed to delete resume");
    }
  },
  /**
   * Duplicate a resume
   */ duplicate_resume: async (params, context)=>{
    const { resumeId, newTitle } = params;
    if (!resumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    // Verify permissions
    if (!await hasResumeWritePermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to duplicate resumes");
    }
    try {
      // Get source resume with blocks
      const { data: sourceResume, error: fetchError } = await supabase.from("resumes").select(`
          title,
          is_public,
          metadata,
          user_id,
          resume_blocks (
            position,
            block_id
          )
        `).eq("id", resumeId).single();
      if (fetchError || !sourceResume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check access
      const isOwner = sourceResume.user_id === context.userId;
      const isAdmin = await hasAdminPermission(context.apiKeyId);
      const isPublic = sourceResume.is_public;
      if (!isOwner && !isAdmin && !isPublic) {
        throw createError("FORBIDDEN", "Access denied to this resume");
      }
      const timestamp = new Date().toISOString();
      // Create new resume
      const { data: newResume, error: createError } = await supabase.from("resumes").insert({
        user_id: context.userId,
        title: newTitle || `${sourceResume.title} (Copy)`,
        is_public: false,
        metadata: sourceResume.metadata,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (createError || !newResume) {
        throw createError || new Error("Failed to create duplicate resume");
      }
      // Copy block associations
      if (sourceResume.resume_blocks && sourceResume.resume_blocks.length > 0) {
        const blockAssociations = sourceResume.resume_blocks.map((rb)=>({
            resume_id: newResume.id,
            block_id: rb.block_id,
            position: rb.position
          }));
        const { error: blocksError } = await supabase.from("resume_blocks").insert(blockAssociations);
        if (blocksError) {
          // Rollback by deleting the new resume
          await supabase.from("resumes").delete().eq("id", newResume.id);
          throw blocksError;
        }
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("duplicate_resume", {
          source_resume_id: resumeId,
          new_resume_id: newResume.id,
          block_count: sourceResume.resume_blocks?.length || 0
        });
      }
      return {
        type: "success",
        message: "Resume duplicated successfully",
        data: {
          id: newResume.id,
          title: newResume.title,
          sourceResumeId: resumeId,
          blockCount: sourceResume.resume_blocks?.length || 0
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to duplicate resume:", error);
      throw createError("DATABASE_ERROR", "Failed to duplicate resume");
    }
  }
};
// Export handlers with cache invalidation applied
export const cachedHandlers = {
  // Read operations (no caching needed for admin tools)
  get_resume: handlers.get_resume,
  list_resumes: handlers.list_resumes,
  // Mutation operations with cache invalidation
  create_resume: withCacheInvalidation("create_resume", handlers.create_resume),
  update_resume: withCacheInvalidation("update_resume", handlers.update_resume),
  delete_resume: withCacheInvalidation("delete_resume", handlers.delete_resume),
  duplicate_resume: withCacheInvalidation("duplicate_resume", handlers.duplicate_resume)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
