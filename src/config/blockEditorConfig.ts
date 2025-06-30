import type { BlockConfig } from '@aaronbassett/block-party';

/**
 * Block types available in the resume editor
 * Based on the PRD specification
 */
export enum BlockType {
  AVATAR = 'avatar',
  CONTACT = 'contact',
  ADDRESS = 'address',
  SOCIAL_NETWORKS = 'social_networks',
  EXPERIENCE = 'experience',
  VOLUNTEER = 'volunteer',
  EDUCATION = 'education',
  AWARD = 'award',
  CERTIFICATE = 'certificate',
  PUBLICATION = 'publication',
  SKILL = 'skill',
  NATURAL_LANGUAGE = 'natural_language',
  INTEREST = 'interest',
  REFERENCE = 'reference',
  PROJECT = 'project',
}

/**
 * Block metadata for UI display
 */
export interface BlockMetadata {
  type: BlockType;
  displayName: string;
  description: string;
  icon?: string;
  category: 'personal' | 'professional' | 'achievements' | 'skills' | 'other';
  maxBlocks?: number;
}

/**
 * Block editor configuration
 */
export interface BlockEditorConfig {
  /**
   * Maximum number of blocks allowed per resume
   */
  maxBlocksPerResume: number;
  
  /**
   * Enable autosave functionality
   */
  enableAutosave: boolean;
  
  /**
   * Autosave delay in milliseconds
   */
  autosaveDelay: number;
  
  /**
   * Enable drag and drop reordering
   */
  enableDragAndDrop: boolean;
  
  /**
   * Enable keyboard navigation
   */
  enableKeyboardNavigation: boolean;
  
  /**
   * Show block type icons
   */
  showBlockIcons: boolean;
  
  /**
   * Enable slash commands for block creation
   */
  enableSlashCommands: boolean;
}

/**
 * Default editor configuration
 */
export const defaultEditorConfig: BlockEditorConfig = {
  maxBlocksPerResume: 50,
  enableAutosave: true,
  autosaveDelay: 2000, // 2 seconds
  enableDragAndDrop: true,
  enableKeyboardNavigation: true,
  showBlockIcons: true,
  enableSlashCommands: true,
};

/**
 * Block type metadata definitions
 */
export const blockMetadata: Record<BlockType, BlockMetadata> = {
  [BlockType.AVATAR]: {
    type: BlockType.AVATAR,
    displayName: 'Avatar',
    description: 'Profile image or avatar',
    category: 'personal',
    maxBlocks: 1,
  },
  [BlockType.CONTACT]: {
    type: BlockType.CONTACT,
    displayName: 'Contact',
    description: 'Email, phone, and website',
    category: 'personal',
    maxBlocks: 1,
  },
  [BlockType.ADDRESS]: {
    type: BlockType.ADDRESS,
    displayName: 'Address',
    description: 'Location or remote work status',
    category: 'personal',
    maxBlocks: 1,
  },
  [BlockType.SOCIAL_NETWORKS]: {
    type: BlockType.SOCIAL_NETWORKS,
    displayName: 'Social Networks',
    description: 'Social media profiles',
    category: 'personal',
  },
  [BlockType.EXPERIENCE]: {
    type: BlockType.EXPERIENCE,
    displayName: 'Experience',
    description: 'Work experience and employment history',
    category: 'professional',
  },
  [BlockType.VOLUNTEER]: {
    type: BlockType.VOLUNTEER,
    displayName: 'Volunteer',
    description: 'Volunteer work and community service',
    category: 'professional',
  },
  [BlockType.EDUCATION]: {
    type: BlockType.EDUCATION,
    displayName: 'Education',
    description: 'Academic background and degrees',
    category: 'professional',
  },
  [BlockType.AWARD]: {
    type: BlockType.AWARD,
    displayName: 'Award',
    description: 'Professional recognition and honors',
    category: 'achievements',
  },
  [BlockType.CERTIFICATE]: {
    type: BlockType.CERTIFICATE,
    displayName: 'Certificate',
    description: 'Professional certifications',
    category: 'achievements',
  },
  [BlockType.PUBLICATION]: {
    type: BlockType.PUBLICATION,
    displayName: 'Publication',
    description: 'Published works and articles',
    category: 'achievements',
  },
  [BlockType.SKILL]: {
    type: BlockType.SKILL,
    displayName: 'Skill',
    description: 'Technical and professional skills',
    category: 'skills',
  },
  [BlockType.NATURAL_LANGUAGE]: {
    type: BlockType.NATURAL_LANGUAGE,
    displayName: 'Language',
    description: 'Language fluencies',
    category: 'skills',
  },
  [BlockType.INTEREST]: {
    type: BlockType.INTEREST,
    displayName: 'Interest',
    description: 'Personal interests and hobbies',
    category: 'other',
  },
  [BlockType.REFERENCE]: {
    type: BlockType.REFERENCE,
    displayName: 'Reference',
    description: 'Professional references',
    category: 'other',
  },
  [BlockType.PROJECT]: {
    type: BlockType.PROJECT,
    displayName: 'Project',
    description: 'Portfolio projects and case studies',
    category: 'professional',
  },
};

/**
 * Get blocks grouped by category
 */
export function getBlocksByCategory() {
  const categories = {
    personal: [] as BlockMetadata[],
    professional: [] as BlockMetadata[],
    achievements: [] as BlockMetadata[],
    skills: [] as BlockMetadata[],
    other: [] as BlockMetadata[],
  };

  Object.values(blockMetadata).forEach((block) => {
    categories[block.category].push(block);
  });

  return categories;
}

/**
 * Check if a block type can be added based on max limits
 */
export function canAddBlockType(type: BlockType, currentBlocks: Array<{ type: string }>): boolean {
  const metadata = blockMetadata[type];
  if (!metadata.maxBlocks) return true;

  const count = currentBlocks.filter(b => b.type === type).length;
  return count < metadata.maxBlocks;
}

/**
 * Get editor configuration with overrides
 */
export function getEditorConfig(overrides?: Partial<BlockEditorConfig>): BlockEditorConfig {
  return {
    ...defaultEditorConfig,
    ...overrides,
  };
}