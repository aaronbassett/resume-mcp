import { BlockType } from '../config/blockEditorConfig';
import { blockRegistry } from './registry';
import type { Block } from '@aaronbassett/block-party';

/**
 * Create a new block instance with default data
 */
export function createNewBlock(type: BlockType): Omit<Block, 'id' | 'order'> {
  const config = blockRegistry.get(type);
  if (!config) {
    throw new Error(`Block type "${type}" is not registered`);
  }

  return {
    type,
    data: config.createDefault(),
    state: 'empty',
    isEditing: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

/**
 * Validate block data
 */
export function validateBlock(type: BlockType, data: any): boolean {
  const config = blockRegistry.get(type);
  if (!config) {
    throw new Error(`Block type "${type}" is not registered`);
  }

  if (!config.validate) {
    return true; // No validation function means always valid
  }

  return config.validate(data);
}

/**
 * Get display name for a block type
 */
export function getBlockDisplayName(type: BlockType): string {
  const config = blockRegistry.get(type);
  return config?.displayName || type;
}

/**
 * Check if a block type supports multiple instances
 */
export function supportsMultipleInstances(type: BlockType): boolean {
  const config = blockRegistry.get(type);
  return !config?.maxBlocks || config.maxBlocks > 1;
}

/**
 * Get preview text for a block
 */
export function getBlockPreview(block: Block): string {
  const { type, data } = block;

  switch (type) {
    case BlockType.CONTACT:
      return data.email || data.phone || 'Contact information';
    
    case BlockType.EXPERIENCE:
      return data.position && data.company 
        ? `${data.position} at ${data.company}`
        : 'Work experience';
    
    case BlockType.EDUCATION:
      return data.degree && data.institution
        ? `${data.degree} from ${data.institution}`
        : 'Education';
    
    case BlockType.SKILL:
      return data.name || 'Skill';
    
    case BlockType.PROJECT:
      return data.name || 'Project';
    
    // Add more preview generators as blocks are implemented
    default:
      return getBlockDisplayName(type as BlockType);
  }
}