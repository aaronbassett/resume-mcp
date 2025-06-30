// Resume Composition Tools
// Tools for managing blocks within resumes and their ordering
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { createError } from "../../utils/errors.ts";
import { getPermissionService } from "../../services/permissions.ts";
import { withCacheInvalidation } from "../../middleware/cache.ts";
// Initialize Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL");
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const supabase = createClient(supabaseUrl, supabaseServiceKey);
/**
 * Check if user has write permissions for resume
 */ async function hasResumeWritePermission(apiKeyId, userId, resumeUserId) {
  const permissionService = getPermissionService();
  const hasAdmin = await permissionService.checkPermission(apiKeyId, "admin", "*");
  const hasWrite = await permissionService.checkPermission(apiKeyId, "resume", "write");
  const isOwner = userId === resumeUserId;
  return hasAdmin || hasWrite && isOwner;
}
// Resume composition handlers
const handlers = {
  /**
   * Add a block to a resume
   */ add_block_to_resume: async (params, context)=>{
    const { resumeId, blockId, position } = params;
    if (!resumeId || !blockId) {
      throw createError("INVALID_PARAMS", "Resume ID and Block ID are required");
    }
    try {
      // Start a transaction
      const timestamp = new Date().toISOString();
      // Verify resume exists and user has access
      const { data: resume, error: resumeError } = await supabase.from("resumes").select("id, user_id").eq("id", resumeId).single();
      if (resumeError || !resume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check permissions
      if (!await hasResumeWritePermission(context.apiKeyId, context.userId, resume.user_id)) {
        throw createError("FORBIDDEN", "No permission to modify this resume");
      }
      // Verify block exists and user has access
      const { data: block, error: blockError } = await supabase.from("blocks").select("id, user_id, type").eq("id", blockId).single();
      if (blockError || !block) {
        throw createError("NOT_FOUND", "Block not found");
      }
      // Check block access (owner or admin)
      const isBlockOwner = block.user_id === context.userId;
      const permissionService = getPermissionService();
      const hasAdmin = await permissionService.checkPermission(context.apiKeyId, "admin", "*");
      if (!isBlockOwner && !hasAdmin) {
        throw createError("FORBIDDEN", "No permission to use this block");
      }
      // Check if block already exists in resume
      const { data: existingAssociation } = await supabase.from("resume_blocks").select("block_id").eq("resume_id", resumeId).eq("block_id", blockId).single();
      if (existingAssociation) {
        throw createError("CONFLICT", "Block already exists in this resume");
      }
      // Get current blocks to determine position
      const { data: currentBlocks, error: blocksError } = await supabase.from("resume_blocks").select("block_id, position").eq("resume_id", resumeId).order("position", {
        ascending: true
      });
      if (blocksError) {
        throw blocksError;
      }
      const blockCount = currentBlocks?.length || 0;
      // Determine actual position
      let actualPosition = position;
      if (actualPosition === undefined || actualPosition < 0) {
        actualPosition = blockCount; // Add to end
      } else if (actualPosition > blockCount) {
        actualPosition = blockCount; // Cap at end
      }
      // Shift existing blocks if inserting in middle
      if (actualPosition < blockCount) {
        // Update positions of blocks that need to shift
        const blocksToShift = currentBlocks.filter((b)=>b.position >= actualPosition);
        for (const blockToShift of blocksToShift){
          await supabase.from("resume_blocks").update({
            position: blockToShift.position + 1
          }).eq("resume_id", resumeId).eq("block_id", blockToShift.block_id);
        }
      }
      // Add the new block association
      const { error: insertError } = await supabase.from("resume_blocks").insert({
        resume_id: resumeId,
        block_id: blockId,
        position: actualPosition
      });
      if (insertError) {
        throw insertError;
      }
      // Update resume timestamp
      await supabase.from("resumes").update({
        updated_at: timestamp
      }).eq("id", resumeId);
      // Get updated block list
      const { data: updatedBlocks } = await supabase.from("resume_blocks").select(`
          position,
          blocks!inner(
            id,
            type,
            data
          )
        `).eq("resume_id", resumeId).order("position", {
        ascending: true
      });
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("add_block_to_resume", {
          resume_id: resumeId,
          block_id: blockId,
          position: actualPosition,
          block_type: block.type
        });
      }
      return {
        type: "success",
        message: "Block added to resume successfully",
        data: {
          resumeId,
          blockId,
          position: actualPosition,
          blocks: updatedBlocks?.map((b)=>({
              id: b.blocks.id,
              position: b.position,
              type: b.blocks.type,
              preview: getBlockPreview(b.blocks.type, b.blocks.data)
            })) || []
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to add block to resume:", error);
      throw createError("DATABASE_ERROR", "Failed to add block to resume");
    }
  },
  /**
   * Remove a block from a resume
   */ remove_block_from_resume: async (params, context)=>{
    const { resumeId, blockId } = params;
    if (!resumeId || !blockId) {
      throw createError("INVALID_PARAMS", "Resume ID and Block ID are required");
    }
    try {
      // Verify resume exists and user has access
      const { data: resume, error: resumeError } = await supabase.from("resumes").select("id, user_id").eq("id", resumeId).single();
      if (resumeError || !resume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check permissions
      if (!await hasResumeWritePermission(context.apiKeyId, context.userId, resume.user_id)) {
        throw createError("FORBIDDEN", "No permission to modify this resume");
      }
      // Get the block's current position
      const { data: blockAssociation, error: fetchError } = await supabase.from("resume_blocks").select("position").eq("resume_id", resumeId).eq("block_id", blockId).single();
      if (fetchError || !blockAssociation) {
        throw createError("NOT_FOUND", "Block not found in this resume");
      }
      const removedPosition = blockAssociation.position;
      // Remove the block association
      const { error: deleteError } = await supabase.from("resume_blocks").delete().eq("resume_id", resumeId).eq("block_id", blockId);
      if (deleteError) {
        throw deleteError;
      }
      // Shift remaining blocks down
      const { data: remainingBlocks } = await supabase.from("resume_blocks").select("block_id, position").eq("resume_id", resumeId).gt("position", removedPosition);
      if (remainingBlocks && remainingBlocks.length > 0) {
        for (const block of remainingBlocks){
          await supabase.from("resume_blocks").update({
            position: block.position - 1
          }).eq("resume_id", resumeId).eq("block_id", block.block_id);
        }
      }
      // Update resume timestamp
      const timestamp = new Date().toISOString();
      await supabase.from("resumes").update({
        updated_at: timestamp
      }).eq("id", resumeId);
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("remove_block_from_resume", {
          resume_id: resumeId,
          block_id: blockId,
          removed_position: removedPosition
        });
      }
      return {
        type: "success",
        message: "Block removed from resume successfully",
        data: {
          resumeId,
          blockId,
          removedPosition
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to remove block from resume:", error);
      throw createError("DATABASE_ERROR", "Failed to remove block from resume");
    }
  },
  /**
   * Reorder blocks in a resume
   */ reorder_resume_blocks: async (params, context)=>{
    const { resumeId, blockId, newPosition } = params;
    if (!resumeId || !blockId || newPosition === undefined) {
      throw createError("INVALID_PARAMS", "Resume ID, Block ID, and new position are required");
    }
    if (newPosition < 0) {
      throw createError("INVALID_PARAMS", "Position must be non-negative");
    }
    try {
      // Verify resume exists and user has access
      const { data: resume, error: resumeError } = await supabase.from("resumes").select("id, user_id").eq("id", resumeId).single();
      if (resumeError || !resume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check permissions
      if (!await hasResumeWritePermission(context.apiKeyId, context.userId, resume.user_id)) {
        throw createError("FORBIDDEN", "No permission to modify this resume");
      }
      // Get all blocks in the resume
      const { data: allBlocks, error: blocksError } = await supabase.from("resume_blocks").select("block_id, position").eq("resume_id", resumeId).order("position", {
        ascending: true
      });
      if (blocksError) {
        throw blocksError;
      }
      if (!allBlocks || allBlocks.length === 0) {
        throw createError("NOT_FOUND", "No blocks found in resume");
      }
      // Find the block to move
      const blockToMove = allBlocks.find((b)=>b.block_id === blockId);
      if (!blockToMove) {
        throw createError("NOT_FOUND", "Block not found in this resume");
      }
      const currentPosition = blockToMove.position;
      const maxPosition = allBlocks.length - 1;
      const targetPosition = Math.min(newPosition, maxPosition);
      // If position hasn't changed, nothing to do
      if (currentPosition === targetPosition) {
        return {
          type: "success",
          message: "Block is already at the requested position",
          data: {
            resumeId,
            blockId,
            position: targetPosition
          }
        };
      }
      // Reorder blocks
      if (currentPosition < targetPosition) {
        // Moving down: shift blocks between current and target up
        for (const block of allBlocks){
          if (block.position > currentPosition && block.position <= targetPosition) {
            await supabase.from("resume_blocks").update({
              position: block.position - 1
            }).eq("resume_id", resumeId).eq("block_id", block.block_id);
          }
        }
      } else {
        // Moving up: shift blocks between target and current down
        for (const block of allBlocks){
          if (block.position >= targetPosition && block.position < currentPosition) {
            await supabase.from("resume_blocks").update({
              position: block.position + 1
            }).eq("resume_id", resumeId).eq("block_id", block.block_id);
          }
        }
      }
      // Update the moved block's position
      const { error: updateError } = await supabase.from("resume_blocks").update({
        position: targetPosition
      }).eq("resume_id", resumeId).eq("block_id", blockId);
      if (updateError) {
        throw updateError;
      }
      // Update resume timestamp
      const timestamp = new Date().toISOString();
      await supabase.from("resumes").update({
        updated_at: timestamp
      }).eq("id", resumeId);
      // Get updated block list
      const { data: updatedBlocks } = await supabase.from("resume_blocks").select(`
          position,
          blocks!inner(
            id,
            type,
            data
          )
        `).eq("resume_id", resumeId).order("position", {
        ascending: true
      });
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("reorder_resume_blocks", {
          resume_id: resumeId,
          block_id: blockId,
          old_position: currentPosition,
          new_position: targetPosition
        });
      }
      return {
        type: "success",
        message: "Block reordered successfully",
        data: {
          resumeId,
          blockId,
          oldPosition: currentPosition,
          newPosition: targetPosition,
          blocks: updatedBlocks?.map((b)=>({
              id: b.blocks.id,
              position: b.position,
              type: b.blocks.type,
              preview: getBlockPreview(b.blocks.type, b.blocks.data)
            })) || []
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to reorder blocks:", error);
      throw createError("DATABASE_ERROR", "Failed to reorder blocks");
    }
  },
  /**
   * Bulk reorder blocks (for drag-and-drop interfaces)
   */ bulk_reorder_blocks: async (params, context)=>{
    const { resumeId, blockOrder } = params;
    if (!resumeId || !blockOrder || !Array.isArray(blockOrder)) {
      throw createError("INVALID_PARAMS", "Resume ID and block order array are required");
    }
    try {
      // Verify resume exists and user has access
      const { data: resume, error: resumeError } = await supabase.from("resumes").select("id, user_id").eq("id", resumeId).single();
      if (resumeError || !resume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check permissions
      if (!await hasResumeWritePermission(context.apiKeyId, context.userId, resume.user_id)) {
        throw createError("FORBIDDEN", "No permission to modify this resume");
      }
      // Get current blocks
      const { data: currentBlocks, error: blocksError } = await supabase.from("resume_blocks").select("block_id").eq("resume_id", resumeId);
      if (blocksError) {
        throw blocksError;
      }
      const currentBlockIds = new Set(currentBlocks?.map((b)=>b.block_id) || []);
      const newBlockIds = new Set(blockOrder);
      // Validate that all blocks exist in the resume
      for (const blockId of blockOrder){
        if (!currentBlockIds.has(blockId)) {
          throw createError("INVALID_PARAMS", `Block ${blockId} not found in resume`);
        }
      }
      // Validate that all current blocks are in the new order
      if (currentBlockIds.size !== newBlockIds.size) {
        throw createError("INVALID_PARAMS", "Block order must contain all current blocks");
      }
      // Update positions based on new order
      const updates = blockOrder.map((blockId, index)=>({
          resume_id: resumeId,
          block_id: blockId,
          position: index
        }));
      // Perform bulk update
      for (const update of updates){
        await supabase.from("resume_blocks").update({
          position: update.position
        }).eq("resume_id", update.resume_id).eq("block_id", update.block_id);
      }
      // Update resume timestamp
      const timestamp = new Date().toISOString();
      await supabase.from("resumes").update({
        updated_at: timestamp
      }).eq("id", resumeId);
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("bulk_reorder_blocks", {
          resume_id: resumeId,
          block_count: blockOrder.length
        });
      }
      return {
        type: "success",
        message: "Blocks reordered successfully",
        data: {
          resumeId,
          blockOrder,
          count: blockOrder.length
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to bulk reorder blocks:", error);
      throw createError("DATABASE_ERROR", "Failed to bulk reorder blocks");
    }
  },
  /**
   * Clear all blocks from a resume
   */ clear_resume_blocks: async (params, context)=>{
    const { resumeId } = params;
    if (!resumeId) {
      throw createError("INVALID_PARAMS", "Resume ID is required");
    }
    try {
      // Verify resume exists and user has access
      const { data: resume, error: resumeError } = await supabase.from("resumes").select("id, user_id").eq("id", resumeId).single();
      if (resumeError || !resume) {
        throw createError("NOT_FOUND", "Resume not found");
      }
      // Check permissions
      if (!await hasResumeWritePermission(context.apiKeyId, context.userId, resume.user_id)) {
        throw createError("FORBIDDEN", "No permission to modify this resume");
      }
      // Count blocks before deletion
      const { count } = await supabase.from("resume_blocks").select("*", {
        count: "exact",
        head: true
      }).eq("resume_id", resumeId);
      // Delete all block associations
      const { error: deleteError } = await supabase.from("resume_blocks").delete().eq("resume_id", resumeId);
      if (deleteError) {
        throw deleteError;
      }
      // Update resume timestamp
      const timestamp = new Date().toISOString();
      await supabase.from("resumes").update({
        updated_at: timestamp
      }).eq("id", resumeId);
      // Log audit event
      if (context.monitor) {
        await context.monitor.logAudit("clear_resume_blocks", {
          resume_id: resumeId,
          blocks_removed: count || 0
        });
      }
      return {
        type: "success",
        message: "All blocks removed from resume",
        data: {
          resumeId,
          blocksRemoved: count || 0
        }
      };
    } catch (error) {
      if (error.code) throw error;
      console.error("Failed to clear resume blocks:", error);
      throw createError("DATABASE_ERROR", "Failed to clear resume blocks");
    }
  }
};
/**
 * Get a preview string for a block based on its type and data
 */ function getBlockPreview(type, data) {
  switch(type){
    case "profile":
      return data.name || "Profile";
    case "experience":
      return `${data.position} at ${data.company}`;
    case "education":
      return `${data.degree} from ${data.institution}`;
    case "skill":
      return data.name || "Skill";
    case "project":
      return data.name || "Project";
    case "certification":
      return data.name || "Certification";
    case "custom":
      return data.title || "Custom Block";
    default:
      return "Unknown Block";
  }
}
// Export handlers with cache invalidation applied
export const cachedHandlers = {
  // All composition operations invalidate cache
  add_block_to_resume: withCacheInvalidation("add_block_to_resume", handlers.add_block_to_resume),
  remove_block_from_resume: withCacheInvalidation("remove_block_from_resume", handlers.remove_block_from_resume),
  reorder_resume_blocks: withCacheInvalidation("reorder_resume_blocks", handlers.reorder_resume_blocks),
  bulk_reorder_blocks: withCacheInvalidation("bulk_reorder_blocks", handlers.bulk_reorder_blocks),
  clear_resume_blocks: withCacheInvalidation("clear_resume_blocks", handlers.clear_resume_blocks)
};
// Export the cached handlers as the default
export { cachedHandlers as handlers };
