/**
 * Block data types for all 15 block types in the resume editor
 * Includes TypeScript interfaces and Zod validation schemas
 */

import { z } from 'zod';
import { BlockType } from '../config/blockEditorConfig';

// Re-export BlockType for convenience
export { BlockType };

// ==========================================
// Base Block Structure
// ==========================================

/**
 * Base structure for all blocks
 */
export interface BaseBlock {
  id: string;
  type: BlockType;
  name?: string;
  metadata?: Record<string, any>;
  visibility?: 'public' | 'private';
  user_id: string;
  created_at: string;
  updated_at: string;
}

// ==========================================
// Personal Information Block Types
// ==========================================

export interface AvatarBlockData {
  imageUrl?: string;
  altText?: string;
}

export const avatarBlockSchema = z.object({
  imageUrl: z.string().url('Invalid image URL').optional(),
  altText: z.string().optional(),
});

export interface ContactBlockData {
  email?: string;
  phone?: string;
  website?: string;
}

export const contactBlockSchema = z.object({
  email: z.string().email('Invalid email address').optional(),
  phone: z.string().optional(),
  website: z.string().url('Invalid website URL').optional(),
}).refine(data => data.email || data.phone || data.website, {
  message: 'At least one contact method is required',
});

export interface AddressBlockData {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isRemote?: boolean;
}

export const addressBlockSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  isRemote: z.boolean().optional(),
});

export interface SocialNetwork {
  platform: string;
  url: string;
  username?: string;
}

export interface SocialNetworksBlockData {
  networks: SocialNetwork[];
}

export const socialNetworkSchema = z.object({
  platform: z.string().min(1, 'Platform is required'),
  url: z.string().url('Invalid URL'),
  username: z.string().optional(),
});

export const socialNetworksBlockSchema = z.object({
  networks: z.array(socialNetworkSchema).min(1, 'At least one social network is required'),
});

// ==========================================
// Professional Experience Block Types
// ==========================================

export interface ExperienceBlockData {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

export const experienceBlockSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export interface VolunteerBlockData {
  organization: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

export const volunteerBlockSchema = z.object({
  organization: z.string().min(1, 'Organization is required'),
  position: z.string().min(1, 'Position is required'),
  location: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export interface EducationBlockData {
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  graduationDate: string;
  gpa?: string;
  honors?: string[];
  coursework?: string[];
}

export const educationBlockSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  field: z.string().optional(),
  location: z.string().optional(),
  graduationDate: z.string().min(1, 'Graduation date is required'),
  gpa: z.string().optional(),
  honors: z.array(z.string()).optional(),
  coursework: z.array(z.string()).optional(),
});

export interface AwardBlockData {
  title: string;
  awarder: string;
  date: string;
  description?: string;
}

export const awardBlockSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  awarder: z.string().min(1, 'Awarder is required'),
  date: z.string().min(1, 'Date is required'),
  description: z.string().optional(),
});

export interface CertificateBlockData {
  name: string;
  authority: string;
  licenseNumber?: string;
  issuedAt: string;
  expiresAt?: string;
  url?: string;
}

export const certificateBlockSchema = z.object({
  name: z.string().min(1, 'Certificate name is required'),
  authority: z.string().min(1, 'Authority is required'),
  licenseNumber: z.string().optional(),
  issuedAt: z.string().min(1, 'Issue date is required'),
  expiresAt: z.string().optional(),
  url: z.string().url('Invalid certificate URL').optional(),
});

export interface PublicationBlockData {
  title: string;
  publisher: string;
  publicationDate: string;
  url?: string;
  authors?: string[];
  description?: string;
}

export const publicationBlockSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  publicationDate: z.string().min(1, 'Publication date is required'),
  url: z.string().url('Invalid publication URL').optional(),
  authors: z.array(z.string()).optional(),
  description: z.string().optional(),
});

export interface SkillBlockData {
  name: string;
  category: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export const skillBlockSchema = z.object({
  name: z.string().min(1, 'Skill name is required'),
  category: z.string().min(1, 'Category is required'),
  proficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

export interface NaturalLanguageBlockData {
  language: string;
  fluency: 'elementary' | 'conversational' | 'professional' | 'native';
}

export const naturalLanguageBlockSchema = z.object({
  language: z.string().min(1, 'Language is required'),
  fluency: z.enum(['elementary', 'conversational', 'professional', 'native']),
});

export interface InterestBlockData {
  interests: string[];
}

export const interestBlockSchema = z.object({
  interests: z.array(z.string().min(1)).min(1, 'At least one interest is required'),
});

export interface ReferenceBlockData {
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export const referenceBlockSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  title: z.string().min(1, 'Title is required'),
  company: z.string().min(1, 'Company is required'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  relationship: z.string().optional(),
});

export interface ProjectBlockData {
  name: string;
  description: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string[];
  highlights?: string[];
}

export const projectBlockSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().min(1, 'Description is required'),
  url: z.string().url('Invalid project URL').optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  technologies: z.array(z.string()).optional(),
  highlights: z.array(z.string()).optional(),
});

/**
 * Union type of all block data types
 */
export type BlockData = 
  | AvatarBlockData
  | ContactBlockData
  | AddressBlockData
  | SocialNetworksBlockData
  | ExperienceBlockData
  | VolunteerBlockData
  | EducationBlockData
  | AwardBlockData
  | CertificateBlockData
  | PublicationBlockData
  | SkillBlockData
  | NaturalLanguageBlockData
  | InterestBlockData
  | ReferenceBlockData
  | ProjectBlockData;

/**
 * Extended block interface for resume blocks
 */
export interface ResumeBlock {
  id: string;
  type: string;
  data: BlockData;
  name?: string;
  isShared?: boolean;
  resumeCount?: number;
}

// ==========================================
// Block Interfaces with Types
// ==========================================

export interface AvatarBlock extends BaseBlock {
  type: BlockType.AVATAR;
  data: AvatarBlockData;
}

export interface ContactBlock extends BaseBlock {
  type: BlockType.CONTACT;
  data: ContactBlockData;
}

export interface AddressBlock extends BaseBlock {
  type: BlockType.ADDRESS;
  data: AddressBlockData;
}

export interface SocialNetworksBlock extends BaseBlock {
  type: BlockType.SOCIAL_NETWORKS;
  data: SocialNetworksBlockData;
}

// ==========================================
// Type Guards
// ==========================================

export function isAvatarBlock(block: BaseBlock): block is AvatarBlock {
  return block.type === BlockType.AVATAR;
}

export function isContactBlock(block: BaseBlock): block is ContactBlock {
  return block.type === BlockType.CONTACT;
}

export function isAddressBlock(block: BaseBlock): block is AddressBlock {
  return block.type === BlockType.ADDRESS;
}

export function isSocialNetworksBlock(block: BaseBlock): block is SocialNetworksBlock {
  return block.type === BlockType.SOCIAL_NETWORKS;
}

// ==========================================
// Default Values
// ==========================================

export const defaultBlockData: Record<BlockType, any> = {
  [BlockType.AVATAR]: {
    imageUrl: '',
    altText: '',
  } as AvatarBlockData,
  [BlockType.CONTACT]: {
    email: '',
    phone: '',
    website: '',
  } as ContactBlockData,
  [BlockType.ADDRESS]: {
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isRemote: false,
  } as AddressBlockData,
  [BlockType.SOCIAL_NETWORKS]: {
    networks: [],
  } as SocialNetworksBlockData,
  [BlockType.EXPERIENCE]: {
    company: '',
    position: '',
    startDate: '',
    current: false,
    highlights: [],
  } as ExperienceBlockData,
  [BlockType.VOLUNTEER]: {
    organization: '',
    position: '',
    startDate: '',
    current: false,
    highlights: [],
  } as VolunteerBlockData,
  [BlockType.EDUCATION]: {
    institution: '',
    degree: '',
    graduationDate: '',
    honors: [],
    coursework: [],
  } as EducationBlockData,
  [BlockType.AWARD]: {
    title: '',
    awarder: '',
    date: '',
  } as AwardBlockData,
  [BlockType.CERTIFICATE]: {
    name: '',
    authority: '',
    issuedAt: '',
  } as CertificateBlockData,
  [BlockType.PUBLICATION]: {
    title: '',
    publisher: '',
    publicationDate: '',
    authors: [],
  } as PublicationBlockData,
  [BlockType.SKILL]: {
    name: '',
    category: '',
  } as SkillBlockData,
  [BlockType.NATURAL_LANGUAGE]: {
    language: '',
    fluency: 'elementary' as const,
  } as NaturalLanguageBlockData,
  [BlockType.INTEREST]: {
    interests: [],
  } as InterestBlockData,
  [BlockType.REFERENCE]: {
    name: '',
    title: '',
    company: '',
  } as ReferenceBlockData,
  [BlockType.PROJECT]: {
    name: '',
    description: '',
    technologies: [],
    highlights: [],
  } as ProjectBlockData,
};

// ==========================================
// Complete Schema Mapping
// ==========================================

export const blockSchemas = {
  [BlockType.AVATAR]: avatarBlockSchema,
  [BlockType.CONTACT]: contactBlockSchema,
  [BlockType.ADDRESS]: addressBlockSchema,
  [BlockType.SOCIAL_NETWORKS]: socialNetworksBlockSchema,
  [BlockType.EXPERIENCE]: experienceBlockSchema,
  [BlockType.VOLUNTEER]: volunteerBlockSchema,
  [BlockType.EDUCATION]: educationBlockSchema,
  [BlockType.AWARD]: awardBlockSchema,
  [BlockType.CERTIFICATE]: certificateBlockSchema,
  [BlockType.PUBLICATION]: publicationBlockSchema,
  [BlockType.SKILL]: skillBlockSchema,
  [BlockType.NATURAL_LANGUAGE]: naturalLanguageBlockSchema,
  [BlockType.INTEREST]: interestBlockSchema,
  [BlockType.REFERENCE]: referenceBlockSchema,
  [BlockType.PROJECT]: projectBlockSchema,
} as const;

// Helper function to validate block data
export function validateBlockData(type: BlockType, data: any): { success: boolean; error?: string } {
  const schema = blockSchemas[type as keyof typeof blockSchemas];
  if (!schema) {
    return { success: false, error: `No validation schema found for block type: ${type}` };
  }

  try {
    schema.parse(data);
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Validation failed' 
    };
  }
}