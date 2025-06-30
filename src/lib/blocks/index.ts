/**
 * Block System Exports
 * 
 * This module exports all block-related services and types for the resume builder
 */

export { blockService } from '../blockService';
export type { 
  BlockServiceError,
  ServiceResponse,
  CreateBlockParams,
  UpdateBlockParams,
  BlockFilters,
  PaginationParams
} from '../blockService';

// Re-export block types from config
export { BlockType } from '../../config/blockEditorConfig';
export { blockMetadata } from '../../config/blockEditorConfig';

// Re-export registry
export { blockRegistry } from '../../blocks/registry';