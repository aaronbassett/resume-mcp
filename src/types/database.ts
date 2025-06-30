/**
 * Database types for the Resume Block System
 * These types match the Supabase database schema
 */

// Enums
export type BlockCategory = 'personal' | 'professional' | 'qualifications' | 'additional';
export type BlockVisibility = 'public' | 'private';
export type LanguageFluency = 'elementary' | 'conversational' | 'professional' | 'native';
export type SkillProficiency = 'beginner' | 'intermediate' | 'advanced' | 'expert';

// Database Tables
export interface BlockType {
  id: string;
  name: string;
  display_name: string;
  category: BlockCategory;
  schema: Record<string, any>; // JSON Schema
  icon?: string;
  description?: string;
  supports_multiple: boolean;
  created_at: string;
  updated_at: string;
}

export interface Block {
  id: string;
  type: string;
  type_id?: string;
  name?: string;
  data: Record<string, any>; // Block-specific data
  metadata?: Record<string, any>;
  visibility: BlockVisibility;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface ResumeBlock {
  id: string;
  resume_id: string;
  block_id: string;
  position: number;
  created_at: string;
  // Joined data
  block?: Block;
  resume?: Resume;
}

export interface BlockVersion {
  id: string;
  block_id: string;
  version_number: number;
  data: Record<string, any>;
  metadata?: Record<string, any>;
  changed_by?: string;
  change_description?: string;
  created_at: string;
  // Joined data
  user?: { email: string };
}

export interface BlockTemplate {
  id: string;
  type_id: string;
  name: string;
  description?: string;
  content: Record<string, any>;
  tags: string[];
  is_public: boolean;
  is_featured: boolean;
  user_id?: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
  // Joined data
  block_type?: BlockType;
}

export interface Resume {
  id: string;
  nanoid: string;
  user_id: string;
  slug: string;
  title: string;
  role?: string;
  display_name?: string;
  tags: string[];
  is_public: boolean;
  publish_resume_page: boolean;
  presence_badge: boolean;
  theme?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  blocks?: ResumeBlock[];
}

export interface User {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// API Response Types
export interface BlockWithResumes extends Block {
  resume_blocks?: Array<{
    resume_id: string;
    position: number;
    resume: {
      id: string;
      title: string;
      is_public: boolean;
    };
  }>;
  resume_count?: number;
}

export interface BlockVersionHistory {
  version_number: number;
  changed_by?: string;
  change_description?: string;
  created_at: string;
  user_email?: string;
}

// Database Function Parameters
export interface CreateBlockFromTemplateParams {
  template_id: string;
  name?: string;
}

export interface RestoreBlockVersionParams {
  block_id: string;
  version_number: number;
}

export interface GetBlockVersionHistoryParams {
  block_id: string;
  limit?: number;
  offset?: number;
}

// Query Filter Types
export interface BlockFilters {
  type?: string;
  visibility?: BlockVisibility;
  resume_id?: string;
  search?: string;
}

export interface TemplateFilters {
  type_id?: string;
  is_public?: boolean;
  is_featured?: boolean;
  tags?: string[];
  user_id?: string;
}

// Pagination Types
export interface PaginationParams {
  limit?: number;
  offset?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface PaginationResponse {
  limit: number;
  offset: number;
  total: number;
  has_more: boolean;
  current_page: number;
  total_pages: number;
}