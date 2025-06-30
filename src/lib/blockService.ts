/**
 * Block Service Layer
 * 
 * This service provides a comprehensive API for managing resume blocks in the application.
 * It handles all block-related operations including CRUD operations, block-resume associations,
 * filtering, pagination, and duplication.
 * 
 * @module blockService
 * @example
 * import { blockService } from './lib/blockService';
 * 
 * // Create a new block
 * const { data, error } = await blockService.createBlock({
 *   userId: 'user123',
 *   type: BlockType.CONTACT,
 *   data: { email: 'user@example.com', phone: '+1234567890' }
 * });
 * 
 * // Get blocks for a resume
 * const { data: blocks } = await blockService.getBlocksForResume('resume123');
 */

import { supabase } from './supabase';
import type { 
  Block, 
  BlockType, 
  BlockTemplate,
  BlockWithResumes,
  BlockData 
} from '../types/database';
import { BlockType as BlockTypeEnum } from '../config/blockEditorConfig';

// Error types for better error handling
export class BlockServiceError extends Error {
  constructor(
    message: string,
    public code: 'NOT_FOUND' | 'UNAUTHORIZED' | 'VALIDATION' | 'DATABASE' | 'CONFLICT',
    public details?: any
  ) {
    super(message);
    this.name = 'BlockServiceError';
  }
}

// Service response types
export interface ServiceResponse<T> {
  data?: T;
  error?: BlockServiceError;
}

export interface CreateBlockParams {
  userId: string;
  type: BlockTypeEnum;
  typeId?: string;
  data: BlockData;
  name?: string;
  metadata?: Record<string, any>;
  visibility?: 'public' | 'private';
}

export interface UpdateBlockParams {
  data?: BlockData;
  name?: string;
  metadata?: Record<string, any>;
  visibility?: 'public' | 'private';
}

export interface BlockFilters {
  types?: BlockTypeEnum[];
  visibility?: 'public' | 'private';
  search?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  updatedAfter?: Date;
  updatedBefore?: Date;
  orderBy?: 'created_at' | 'updated_at' | 'name' | 'type';
  orderDirection?: 'asc' | 'desc';
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

/**
 * BlockService provides all block-related operations
 * @class
 */
class BlockService {
  /**
   * Create a new block
   * @param {CreateBlockParams} params - The parameters for creating a block
   * @param {string} params.userId - The ID of the user creating the block
   * @param {BlockTypeEnum} params.type - The type of block to create
   * @param {BlockData} params.data - The block content data
   * @param {string} [params.name] - Optional name for the block
   * @returns {Promise<ServiceResponse<Block>>} The created block or error
   */
  async createBlock(params: CreateBlockParams): Promise<ServiceResponse<Block>> {
    try {
      const { userId, type, typeId, data, name, metadata = {}, visibility = 'private' } = params;

      // Validate block type
      if (!Object.values(BlockTypeEnum).includes(type)) {
        return {
          error: new BlockServiceError(
            `Invalid block type: ${type}`,
            'VALIDATION',
            { validTypes: Object.values(BlockTypeEnum) }
          )
        };
      }

      // Get block type ID if not provided
      let finalTypeId = typeId;
      if (!finalTypeId) {
        const { data: blockType } = await supabase
          .from('block_types')
          .select('id')
          .eq('name', type)
          .single();
        
        if (!blockType) {
          return {
            error: new BlockServiceError(
              `Block type not found: ${type}`,
              'NOT_FOUND'
            )
          };
        }
        finalTypeId = blockType.id;
      }

      // Create the block
      const { data: block, error } = await supabase
        .from('blocks')
        .insert({
          type,
          type_id: finalTypeId,
          data,
          name,
          metadata,
          visibility,
          user_id: userId
        })
        .select()
        .single();

      if (error) {
        return {
          error: new BlockServiceError(
            'Failed to create block',
            'DATABASE',
            error
          )
        };
      }

      return { data: block };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error creating block',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Get a block by ID
   */
  async getBlock(blockId: string): Promise<ServiceResponse<BlockWithResumes>> {
    try {
      const { data: block, error } = await supabase
        .from('blocks')
        .select(`
          *,
          block_type:block_types(
            id,
            name,
            display_name,
            category,
            icon,
            supports_multiple
          ),
          resume_blocks(
            resume_id,
            position,
            resume:resumes(
              id,
              title,
              is_public
            )
          )
        `)
        .eq('id', blockId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            error: new BlockServiceError(
              'Block not found',
              'NOT_FOUND'
            )
          };
        }
        return {
          error: new BlockServiceError(
            'Failed to get block',
            'DATABASE',
            error
          )
        };
      }

      // Format response
      const formattedBlock: BlockWithResumes = {
        ...block,
        resume_count: block.resume_blocks?.length || 0
      };

      return { data: formattedBlock };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error getting block',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Update a block
   */
  async updateBlock(
    blockId: string, 
    params: UpdateBlockParams
  ): Promise<ServiceResponse<Block>> {
    try {
      const { data, name, metadata, visibility } = params;

      // Build update object
      const updates: any = {};
      if (data !== undefined) updates.data = data;
      if (name !== undefined) updates.name = name;
      if (metadata !== undefined) updates.metadata = metadata;
      if (visibility !== undefined) updates.visibility = visibility;

      if (Object.keys(updates).length === 0) {
        return {
          error: new BlockServiceError(
            'No fields to update',
            'VALIDATION'
          )
        };
      }

      // Update the block
      const { data: block, error } = await supabase
        .from('blocks')
        .update(updates)
        .eq('id', blockId)
        .select()
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            error: new BlockServiceError(
              'Block not found',
              'NOT_FOUND'
            )
          };
        }
        return {
          error: new BlockServiceError(
            'Failed to update block',
            'DATABASE',
            error
          )
        };
      }

      return { data: block };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error updating block',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Delete a block
   */
  async deleteBlock(blockId: string): Promise<ServiceResponse<void>> {
    try {
      // Check if block is being used in any resumes
      const { data: resumeBlocks } = await supabase
        .from('resume_blocks')
        .select('resume_id')
        .eq('block_id', blockId)
        .limit(1);

      if (resumeBlocks && resumeBlocks.length > 0) {
        return {
          error: new BlockServiceError(
            'Cannot delete block that is being used in resumes',
            'CONFLICT',
            { resumeCount: resumeBlocks.length }
          )
        };
      }

      // Delete the block
      const { error } = await supabase
        .from('blocks')
        .delete()
        .eq('id', blockId);

      if (error) {
        if (error.code === 'PGRST116') {
          return {
            error: new BlockServiceError(
              'Block not found',
              'NOT_FOUND'
            )
          };
        }
        return {
          error: new BlockServiceError(
            'Failed to delete block',
            'DATABASE',
            error
          )
        };
      }

      return { data: undefined };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error deleting block',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Get all blocks for a user with filtering and pagination
   */
  async getBlocksByUser(
    userId: string,
    filters?: BlockFilters,
    pagination?: PaginationParams
  ): Promise<ServiceResponse<{ blocks: Block[]; total: number }>> {
    try {
      // Build query
      let query = supabase
        .from('blocks')
        .select('*, block_type:block_types!blocks_type_id_fkey(*)', { count: 'exact' })
        .eq('user_id', userId);

      // Apply filters
      if (filters) {
        if (filters.types && filters.types.length > 0) {
          query = query.in('type', filters.types);
        }
        if (filters.visibility) {
          query = query.eq('visibility', filters.visibility);
        }
        if (filters.search) {
          // Search in name and data fields
          query = query.or(`name.ilike.%${filters.search}%,data::text.ilike.%${filters.search}%`);
        }
        if (filters.createdAfter) {
          query = query.gte('created_at', filters.createdAfter.toISOString());
        }
        if (filters.createdBefore) {
          query = query.lte('created_at', filters.createdBefore.toISOString());
        }
        if (filters.updatedAfter) {
          query = query.gte('updated_at', filters.updatedAfter.toISOString());
        }
        if (filters.updatedBefore) {
          query = query.lte('updated_at', filters.updatedBefore.toISOString());
        }
      }

      // Apply sorting
      const orderBy = filters?.orderBy || 'created_at';
      const orderDirection = filters?.orderDirection || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Apply pagination
      if (pagination) {
        const { page = 1, limit = 20 } = pagination;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);
      }

      const { data: blocks, error, count } = await query;

      if (error) {
        return {
          error: new BlockServiceError(
            'Failed to get user blocks',
            'DATABASE',
            error
          )
        };
      }

      return {
        data: {
          blocks: blocks || [],
          total: count || 0
        }
      };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error getting user blocks',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Get all blocks for a specific resume
   */
  async getBlocksForResume(
    resumeId: string,
    options?: { includeDetails?: boolean }
  ): Promise<ServiceResponse<Block[]>> {
    try {
      const selectQuery = options?.includeDetails
        ? `
          block:blocks(
            *,
            block_type:block_types!blocks_type_id_fkey(*)
          ),
          position
        `
        : `
          block:blocks(*),
          position
        `;

      const { data: resumeBlocks, error } = await supabase
        .from('resume_blocks')
        .select(selectQuery)
        .eq('resume_id', resumeId)
        .order('position', { ascending: true });

      if (error) {
        return {
          error: new BlockServiceError(
            'Failed to get resume blocks',
            'DATABASE',
            error
          )
        };
      }

      // Extract blocks from the junction table results
      const blocks = resumeBlocks?.map(rb => rb.block).filter(Boolean) || [];

      return { data: blocks };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error getting resume blocks',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Add a block to a resume at a specific position
   */
  async addBlockToResume(
    resumeId: string,
    blockId: string,
    position?: number
  ): Promise<ServiceResponse<void>> {
    try {
      // Check if block already exists in resume
      const { data: existing } = await supabase
        .from('resume_blocks')
        .select('id')
        .eq('resume_id', resumeId)
        .eq('block_id', blockId)
        .single();

      if (existing) {
        return {
          error: new BlockServiceError(
            'Block already exists in this resume',
            'CONFLICT'
          )
        };
      }

      // Get the current max position if not specified
      let insertPosition = position;
      if (insertPosition === undefined) {
        const { data: maxPosData } = await supabase
          .from('resume_blocks')
          .select('position')
          .eq('resume_id', resumeId)
          .order('position', { ascending: false })
          .limit(1)
          .single();

        insertPosition = maxPosData ? maxPosData.position + 1 : 0;
      } else {
        // Shift existing blocks if inserting at a specific position
        await supabase.rpc('shift_block_positions', {
          p_resume_id: resumeId,
          p_start_position: insertPosition,
          p_shift_amount: 1
        });
      }

      // Insert the new resume-block relationship
      const { error } = await supabase
        .from('resume_blocks')
        .insert({
          resume_id: resumeId,
          block_id: blockId,
          position: insertPosition
        });

      if (error) {
        return {
          error: new BlockServiceError(
            'Failed to add block to resume',
            'DATABASE',
            error
          )
        };
      }

      return { data: undefined };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error adding block to resume',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Remove a block from a resume
   */
  async removeBlockFromResume(
    resumeId: string,
    blockId: string
  ): Promise<ServiceResponse<void>> {
    try {
      // Get the position of the block being removed
      const { data: blockToRemove } = await supabase
        .from('resume_blocks')
        .select('position')
        .eq('resume_id', resumeId)
        .eq('block_id', blockId)
        .single();

      if (!blockToRemove) {
        return {
          error: new BlockServiceError(
            'Block not found in this resume',
            'NOT_FOUND'
          )
        };
      }

      // Remove the block
      const { error: deleteError } = await supabase
        .from('resume_blocks')
        .delete()
        .eq('resume_id', resumeId)
        .eq('block_id', blockId);

      if (deleteError) {
        return {
          error: new BlockServiceError(
            'Failed to remove block from resume',
            'DATABASE',
            deleteError
          )
        };
      }

      // Shift positions of blocks after the removed one
      await supabase.rpc('shift_block_positions', {
        p_resume_id: resumeId,
        p_start_position: blockToRemove.position + 1,
        p_shift_amount: -1
      });

      return { data: undefined };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error removing block from resume',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Update the position of a block within a resume
   */
  async updateBlockPosition(
    resumeId: string,
    blockId: string,
    newPosition: number
  ): Promise<ServiceResponse<void>> {
    try {
      // Get current position
      const { data: currentBlock } = await supabase
        .from('resume_blocks')
        .select('position')
        .eq('resume_id', resumeId)
        .eq('block_id', blockId)
        .single();

      if (!currentBlock) {
        return {
          error: new BlockServiceError(
            'Block not found in this resume',
            'NOT_FOUND'
          )
        };
      }

      const currentPosition = currentBlock.position;
      
      if (currentPosition === newPosition) {
        return { data: undefined }; // No change needed
      }

      // Use a transaction-like approach with RPC function
      const { error } = await supabase.rpc('reorder_block_position', {
        p_resume_id: resumeId,
        p_block_id: blockId,
        p_old_position: currentPosition,
        p_new_position: newPosition
      });

      if (error) {
        return {
          error: new BlockServiceError(
            'Failed to update block position',
            'DATABASE',
            error
          )
        };
      }

      return { data: undefined };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error updating block position',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Get usage information for a block
   */
  async getBlockUsage(
    blockId: string
  ): Promise<ServiceResponse<{ count: number; resumes: Array<{ id: string; title: string; slug: string }> }>> {
    try {
      const { data: resumeBlocks, error, count } = await supabase
        .from('resume_blocks')
        .select(`
          resume:resumes(
            id,
            title,
            slug
          )
        `, { count: 'exact' })
        .eq('block_id', blockId);

      if (error) {
        return {
          error: new BlockServiceError(
            'Failed to get block usage',
            'DATABASE',
            error
          )
        };
      }

      const resumes = resumeBlocks?.map(rb => rb.resume).filter(Boolean) || [];

      return {
        data: {
          count: count || 0,
          resumes
        }
      };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error getting block usage',
          'DATABASE',
          error
        )
      };
    }
  }

  /**
   * Duplicate an existing block
   */
  async duplicateBlock(
    blockId: string,
    userId: string,
    newName?: string
  ): Promise<ServiceResponse<Block>> {
    try {
      // Get the original block
      const { data: originalBlock, error: fetchError } = await supabase
        .from('blocks')
        .select('*')
        .eq('id', blockId)
        .single();

      if (fetchError || !originalBlock) {
        return {
          error: new BlockServiceError(
            'Original block not found',
            'NOT_FOUND'
          )
        };
      }

      // Check if user owns the block or if it's public
      if (originalBlock.user_id !== userId && originalBlock.visibility !== 'public') {
        return {
          error: new BlockServiceError(
            'Cannot duplicate this block',
            'UNAUTHORIZED'
          )
        };
      }

      // Create the duplicate
      const duplicateName = newName || `${originalBlock.name || 'Block'} (Copy)`;
      const { data: newBlock, error: createError } = await supabase
        .from('blocks')
        .insert({
          type: originalBlock.type,
          type_id: originalBlock.type_id,
          data: originalBlock.data,
          name: duplicateName,
          metadata: {
            ...originalBlock.metadata,
            duplicated_from: blockId,
            duplicated_at: new Date().toISOString()
          },
          visibility: 'private', // Always make duplicates private
          user_id: userId
        })
        .select()
        .single();

      if (createError || !newBlock) {
        return {
          error: new BlockServiceError(
            'Failed to duplicate block',
            'DATABASE',
            createError
          )
        };
      }

      return { data: newBlock };
    } catch (error) {
      return {
        error: new BlockServiceError(
          'Unexpected error duplicating block',
          'DATABASE',
          error
        )
      };
    }
  }
}

// Export singleton instance
export const blockService = new BlockService();