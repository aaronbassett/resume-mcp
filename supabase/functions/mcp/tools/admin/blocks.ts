// Block Management Tools
// CRUD operations for resume content blocks with type-specific validation
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../../utils/errors.ts";
import { getPermissionService } from "../../services/permissions.ts";
import { withCacheInvalidation } from "../../middleware/cache.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
// Block types supported
export const BLOCK_TYPES = [
  "profile",
  "experience",
  "education",
  "skill",
  "project",
  "certification",
  "custom"
];
// Type-specific validation schemas
const BLOCK_SCHEMAS = {
  profile: (data)=>{
    if (!data.name) return "Name is required for profile blocks";
    if (!data.email) return "Email is required for profile blocks";
    return null;
  },
  experience: (data)=>{
    if (!data.company) return "Company is required for experience blocks";
    if (!data.position) return "Position is required for experience blocks";
    if (!data.startDate) return "Start date is required for experience blocks";
    return null;
  },
  education: (data)=>{
    if (!data.institution) return "Institution is required for education blocks";
    if (!data.degree) return "Degree is required for education blocks";
    if (!data.graduationDate) return "Graduation date is required for education blocks";
    return null;
  },
  skill: (data)=>{
    if (!data.name) return "Name is required for skill blocks";
    if (!data.category) return "Category is required for skill blocks";
    return null;
  },
  project: (data)=>{
    if (!data.name) return "Name is required for project blocks";
    if (!data.description) return "Description is required for project blocks";
    return null;
  },
  certification: (data)=>{
    if (!data.name) return "Name is required for certification blocks";
    if (!data.authority) return "Authority is required for certification blocks";
    if (!data.issuedAt) return "Issue date is required for certification blocks";
    return null;
  },
  custom: (data)=>{
    if (!data.title) return "Title is required for custom blocks";
    if (!data.content) return "Content is required for custom blocks";
    return null;
  }
};
/**
 * Validate block data based on type
 */ function validateBlockData(type, data) {
  const validator = BLOCK_SCHEMAS[type];
  if (!validator) {
    throw createError("INVALID_PARAMS", `Invalid block type: ${type}`);
  }
  const error = validator(data);
  if (error) {
    throw createError("INVALID_PARAMS", error);
  }
}
/**
 * Check if user has write permissions for blocks
 */ async function hasBlockWritePermission(apiKeyId) {
  const permissionService = getPermissionService();
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  const hasWrite = await permissionService.checkPermission(apiKeyId, "block", "write");
  return hasAdmin || hasWrite;
}
// Block management handlers
const handlers = {
  /**
   * Create a new block
   */ create_block: async (params, context)=>{
    const { type, data, metadata = {}, visibility = "public" } = params;
    // Validate block type
    if (!BLOCK_TYPES.includes(type)) {
      throw createError("INVALID_PARAMS", `Invalid block type: ${type}`);
    }
    // Validate block data
    validateBlockData(type, data);
    // Verify permissions
    if (!await hasBlockWritePermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to create blocks");
    }
    const timestamp = new Date().toISOString();
    try {
      // Create the block
      const { data: newBlock, error } = await supabase.from("blocks").insert({
        type,
        data,
        metadata,
        visibility,
        user_id: context.userId,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (error || !newBlock) {
        throw error || new Error("Failed to create block");
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("create_block", {
          block_id: newBlock.id,
          type: newBlock.type
        });
      }
      return {
        type: "success",
        message: `${type} block created successfully`,
        data: {
          id: newBlock.id,
          type: newBlock.type,
          data: newBlock.data,
          metadata: newBlock.metadata,
          visibility: newBlock.visibility,
          createdAt: newBlock.created_at,
          updatedAt: newBlock.updated_at
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to create block:", error);
      throw createError("DATABASE_ERROR", "Failed to create block");
    }
  },
  /**
   * Get block details
   */ get_block: async (params, context)=>{
    const { blockId } = params;
    if (!blockId) {
      throw createError("INVALID_PARAMS", "Block ID is required");
    }
    try {
      // Get block details with resume associations
      const { data: block, error } = await supabase.from("blocks").select(`
          id,
          type,
          data,
          metadata,
          visibility,
          user_id,
          created_at,
          updated_at,
          resume_blocks (
            resume_id,
            position,
            resumes!inner(
              id,
              title,
              is_public
            )
          )
        `).eq("id", blockId).single();
      if (error || !block) {
        throw createError("NOT_FOUND", "Block not found");
      }
      // Check access permissions
      const isOwner = block.user_id === context.userId;
      const permissionService = getPermissionService();
      const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
      // Check if block is in a public resume
      const isInPublicResume = block.resume_blocks?.some((rb)=>rb.resumes.is_public) || false;
      if (!isOwner && !hasAdmin && !isInPublicResume && block.visibility === "private") {
        throw createError("FORBIDDEN", "Access denied to this block");
      }
      // Format resume associations
      const resumes = block.resume_blocks?.map((rb)=>({
          id: rb.resume_id,
          title: rb.resumes.title,
          position: rb.position,
          isPublic: rb.resumes.is_public
        })) || [];
      return {
        type: "block",
        data: {
          id: block.id,
          type: block.type,
          data: block.data,
          metadata: block.metadata,
          visibility: block.visibility,
          resumes,
          resumeCount: resumes.length,
          createdAt: block.created_at,
          updatedAt: block.updated_at
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to get block:", error);
      throw createError("DATABASE_ERROR", "Failed to fetch block");
    }
  },
  /**
   * List blocks with filtering
   */ list_blocks: async (params, context)=>{
    const { type, visibility, resumeId, limit = 20, offset = 0, sortBy = "updated_at", sortOrder = "desc", search } = params;
    // Validate pagination
    if (limit < 1 || limit > 100) {
      throw createError("INVALID_PARAMS", "Limit must be between 1 and 100");
    }
    if (offset < 0) {
      throw createError("INVALID_PARAMS", "Offset must be non-negative");
    }
    try {
      // Build base query
      let query = supabase.from("blocks").select("*", {
        count: "exact"
      }).eq("user_id", context.userId);
      // Apply filters
      if (type) {
        query = query.eq("type", type);
      }
      if (visibility) {
        query = query.eq("visibility", visibility);
      }
      if (resumeId) {
        // Filter blocks that belong to specific resume
        const { data: blockIds } = await supabase.from("resume_blocks").select("block_id").eq("resume_id", resumeId);
        const ids = blockIds?.map((b)=>b.block_id) || [];
        query = query.in("id", ids);
      }
      // Apply search across data fields
      if (search) {
        // Search in JSONB data field
        query = query.or(`data->name.ilike.%${search}%,data->title.ilike.%${search}%,data->company.ilike.%${search}%,data->institution.ilike.%${search}%`);
      }
      // Apply sorting
      query = query.order(sortBy, {
        ascending: sortOrder === "asc"
      });
      // Apply pagination
      query = query.range(offset, offset + limit - 1);
      const { data: blocks, error, count } = await query;
      if (error) {
        throw error;
      }
      const totalCount = count || 0;
      // Get resume associations for each block
      const blockIds = blocks?.map((b)=>b.id) || [];
      const { data: resumeAssociations } = await supabase.from("resume_blocks").select("block_id, resume_id").in("block_id", blockIds);
      const resumeCountMap = new Map();
      resumeAssociations?.forEach((ra)=>{
        const currentCount = resumeCountMap.get(ra.block_id) || 0;
        resumeCountMap.set(ra.block_id, currentCount + 1);
      });
      const formattedBlocks = blocks?.map((block)=>({
          id: block.id,
          type: block.type,
          data: block.data,
          metadata: block.metadata,
          visibility: block.visibility,
          resumeCount: resumeCountMap.get(block.id) || 0,
          createdAt: block.created_at,
          updatedAt: block.updated_at
        })) || [];
      return {
        type: "blocks",
        data: formattedBlocks,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: offset + formattedBlocks.length < totalCount,
          currentPage: Math.floor(offset / limit) + 1,
          totalPages: Math.ceil(totalCount / limit)
        },
        filters: {
          type,
          visibility,
          resumeId,
          search
        }
      };
    } catch (error) {
      console.error("Failed to list blocks:", error);
      throw createError("DATABASE_ERROR", "Failed to list blocks");
    }
  },
  /**
   * Update block content
   */ update_block: async (params, context)=>{
    const { blockId, data, metadata, visibility } = params;
    if (!blockId) {
      throw createError("INVALID_PARAMS", "Block ID is required");
    }
    // Verify permissions
    if (!await hasBlockWritePermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to update blocks");
    }
    try {
      // Get existing block
      const { data: existingBlock, error: fetchError } = await supabase.from("blocks").select("*").eq("id", blockId).single();
      if (fetchError || !existingBlock) {
        throw createError("NOT_FOUND", "Block not found");
      }
      // Check ownership
      if (existingBlock.user_id !== context.userId) {
        const permissionService = getPermissionService();
        const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
        if (!hasAdmin) {
          throw createError("FORBIDDEN", "Access denied to this block");
        }
      }
      // Validate new data if provided
      if (data) {
        validateBlockData(existingBlock.type, {
          ...existingBlock.data,
          ...data
        });
      }
      // Build update object
      const updates = {
        updated_at: new Date().toISOString()
      };
      if (data !== undefined) {
        updates.data = {
          ...existingBlock.data,
          ...data
        };
      }
      if (metadata !== undefined) {
        updates.metadata = metadata;
      }
      if (visibility !== undefined) {
        updates.visibility = visibility;
      }
      // Update block
      const { data: updatedBlock, error: updateError } = await supabase.from("blocks").update(updates).eq("id", blockId).select().single();
      if (updateError || !updatedBlock) {
        throw updateError || new Error("Failed to update block");
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("update_block", {
          block_id: blockId,
          type: updatedBlock.type,
          updates: Object.keys(updates)
        });
      }
      return {
        type: "success",
        message: "Block updated successfully",
        data: {
          id: updatedBlock.id,
          type: updatedBlock.type,
          data: updatedBlock.data,
          metadata: updatedBlock.metadata,
          visibility: updatedBlock.visibility,
          updatedAt: updatedBlock.updated_at
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to update block:", error);
      throw createError("DATABASE_ERROR", "Failed to update block");
    }
  },
  /**
   * Delete a block
   */ delete_block: async (params, context)=>{
    const { blockId } = params;
    if (!blockId) {
      throw createError("INVALID_PARAMS", "Block ID is required");
    }
    // Verify permissions
    if (!await hasBlockWritePermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to delete blocks");
    }
    try {
      // Get existing block
      const { data: existingBlock, error: fetchError } = await supabase.from("blocks").select("*").eq("id", blockId).single();
      if (fetchError || !existingBlock) {
        throw createError("NOT_FOUND", "Block not found");
      }
      // Check ownership
      if (existingBlock.user_id !== context.userId) {
        const permissionService = getPermissionService();
        const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
        if (!hasAdmin) {
          throw createError("FORBIDDEN", "Access denied to this block");
        }
      }
      // Check if block is in use
      const { data: resumeAssociations } = await supabase.from("resume_blocks").select("resume_id").eq("block_id", blockId);
      if (resumeAssociations && resumeAssociations.length > 0) {
        throw createError("CONFLICT", `Block is used in ${resumeAssociations.length} resume(s). Remove it from all resumes before deleting.`);
      }
      // Delete block
      const { error: deleteError } = await supabase.from("blocks").delete().eq("id", blockId);
      if (deleteError) {
        throw deleteError;
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("delete_block", {
          block_id: blockId,
          type: existingBlock.type
        });
      }
      return {
        type: "success",
        message: "Block deleted successfully",
        data: {
          id: blockId
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to delete block:", error);
      throw createError("DATABASE_ERROR", "Failed to delete block");
    }
  },
  /**
   * Duplicate a block
   */ duplicate_block: async (params, context)=>{
    const { blockId, modifyData = {} } = params;
    if (!blockId) {
      throw createError("INVALID_PARAMS", "Block ID is required");
    }
    // Verify permissions
    if (!await hasBlockWritePermission(context.apiKeyId)) {
      throw createError("FORBIDDEN", "No permission to duplicate blocks");
    }
    try {
      // Get source block
      const { data: sourceBlock, error: fetchError } = await supabase.from("blocks").select("*").eq("id", blockId).single();
      if (fetchError || !sourceBlock) {
        throw createError("NOT_FOUND", "Block not found");
      }
      // Check access
      const isOwner = sourceBlock.user_id === context.userId;
      const isPublic = sourceBlock.visibility === "public";
      const permissionService = getPermissionService();
      const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
      if (!isOwner && !isPublic && !hasAdmin) {
        throw createError("FORBIDDEN", "Access denied to this block");
      }
      // Merge data modifications
      const newData = {
        ...sourceBlock.data,
        ...modifyData
      };
      // Validate the new data
      validateBlockData(sourceBlock.type, newData);
      const timestamp = new Date().toISOString();
      // Create duplicate block
      const { data: newBlock, error: createError } = await supabase.from("blocks").insert({
        type: sourceBlock.type,
        data: newData,
        metadata: sourceBlock.metadata,
        visibility: sourceBlock.visibility,
        user_id: context.userId,
        created_at: timestamp,
        updated_at: timestamp
      }).select().single();
      if (createError || !newBlock) {
        throw createError || new Error("Failed to create duplicate block");
      }
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("duplicate_block", {
          source_block_id: blockId,
          new_block_id: newBlock.id,
          type: newBlock.type
        });
      }
      return {
        type: "success",
        message: "Block duplicated successfully",
        data: {
          id: newBlock.id,
          type: newBlock.type,
          sourceBlockId: blockId,
          data: newBlock.data,
          metadata: newBlock.metadata,
          visibility: newBlock.visibility
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to duplicate block:", error);
      throw createError("DATABASE_ERROR", "Failed to duplicate block");
    }
  }
};
// Export handlers with cache invalidation applied
export const cachedHandlers = {
  // Read operations (no caching needed for admin tools)
  get_block: handlers.get_block,
  list_blocks: handlers.list_blocks,
  // Mutation operations with cache invalidation
  create_block: withCacheInvalidation("create_block", handlers.create_block),
  update_block: withCacheInvalidation("update_block", handlers.update_block),
  delete_block: withCacheInvalidation("delete_block", handlers.delete_block),
  duplicate_block: withCacheInvalidation("duplicate_block", handlers.duplicate_block)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
