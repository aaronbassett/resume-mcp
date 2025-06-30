import { supabase } from './supabase';
import { nanoid } from 'nanoid';
import type { Tag } from '../store/resume';
import type { ResumeSettings } from '../components/resume/ResumeSettingsDrawer';

export interface Resume {
  id: string;
  nanoid: string;
  user_id: string;
  slug: string;
  title: string;
  role: string;
  display_name: string;
  tags: Tag[];
  body_content?: string;
  created_at: string;
  updated_at: string;
  // Individual setting columns (no longer nested in settings object)
  publish_resume_page: boolean;
  presence_badge: 'none' | 'available' | 'busy' | 'away' | 'dnd';
  enable_resume_downloads: boolean;
  resume_page_template: 'standard' | 'modern' | 'classic' | 'minimal' | 'creative';
  allow_users_switch_template: boolean;
  visibility: 'public' | 'private' | 'unlisted' | 'password';
  enable_mischief_mode: boolean;
  include_custom_mischief: boolean;
  custom_mischief_instructions: string;
  attempt_avoid_detection: boolean;
  embed_llm_instructions: boolean;
  meta_title: string;
  meta_description: string;
  robots_directives: string[];
  custom_data: any;
}

export interface CreateResumeData {
  title: string;
  role: string;
  display_name: string;
  tags: Tag[];
  body_content?: string;
}

export interface UpdateResumeData {
  title?: string;
  role?: string;
  display_name?: string;
  tags?: Tag[];
  body_content?: string;
  // Individual setting properties (no longer nested)
  publish_resume_page?: boolean;
  presence_badge?: 'none' | 'available' | 'busy' | 'away' | 'dnd';
  enable_resume_downloads?: boolean;
  resume_page_template?: 'standard' | 'modern' | 'classic' | 'minimal' | 'creative';
  allow_users_switch_template?: boolean;
  visibility?: 'public' | 'private' | 'unlisted' | 'password';
  enable_mischief_mode?: boolean;
  include_custom_mischief?: boolean;
  custom_mischief_instructions?: string;
  attempt_avoid_detection?: boolean;
  embed_llm_instructions?: boolean;
  meta_title?: string;
  meta_description?: string;
  robots_directives?: string[];
  custom_data?: any;
}

// Generate URL-friendly slug from title
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Create a new resume
export const createResume = async (data: CreateResumeData): Promise<{ data: Resume | null; error: string | null }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { data: null, error: 'User not authenticated' };
    }

    const resumeNanoid = nanoid(10); // Generate 10-character nanoid
    const slug = generateSlug(data.title || 'untitled-resume');

    const resumeData = {
      nanoid: resumeNanoid,
      user_id: user.id,
      slug,
      title: data.title || 'Untitled Resume',
      role: data.role || '',
      display_name: data.display_name || '',
      tags: data.tags || [],
      // Default settings as individual columns
      publish_resume_page: true,
      presence_badge: 'none',
      enable_resume_downloads: true,
      resume_page_template: 'standard',
      allow_users_switch_template: false,
      visibility: 'public',
      enable_mischief_mode: false,
      include_custom_mischief: false,
      custom_mischief_instructions: '',
      attempt_avoid_detection: false,
      embed_llm_instructions: true,
      meta_title: '',
      meta_description: '',
      robots_directives: ['index', 'follow'],
      custom_data: {}
    };

    const { data: resume, error } = await supabase
      .from('resumes')
      .insert(resumeData)
      .select()
      .single();

    if (error) {
      console.error('Error creating resume:', error);
      return { data: null, error: error.message };
    }

    return { data: resume, error: null };
  } catch (error) {
    console.error('Error creating resume:', error);
    return { data: null, error: 'Failed to create resume' };
  }
};

// Update an existing resume
export const updateResume = async (
  resumeId: string, 
  data: UpdateResumeData
): Promise<{ data: Resume | null; error: string | null }> => {
  try {
    const updateData: any = {};
    
    // Copy all properties directly (no more nested settings)
    if (data.title !== undefined) updateData.title = data.title;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.display_name !== undefined) updateData.display_name = data.display_name;
    if (data.tags !== undefined) updateData.tags = data.tags;
    
    // Setting properties as individual columns
    if (data.publish_resume_page !== undefined) updateData.publish_resume_page = data.publish_resume_page;
    if (data.presence_badge !== undefined) updateData.presence_badge = data.presence_badge;
    if (data.enable_resume_downloads !== undefined) updateData.enable_resume_downloads = data.enable_resume_downloads;
    if (data.resume_page_template !== undefined) updateData.resume_page_template = data.resume_page_template;
    if (data.allow_users_switch_template !== undefined) updateData.allow_users_switch_template = data.allow_users_switch_template;
    if (data.visibility !== undefined) updateData.visibility = data.visibility;
    if (data.enable_mischief_mode !== undefined) updateData.enable_mischief_mode = data.enable_mischief_mode;
    if (data.include_custom_mischief !== undefined) updateData.include_custom_mischief = data.include_custom_mischief;
    if (data.custom_mischief_instructions !== undefined) updateData.custom_mischief_instructions = data.custom_mischief_instructions;
    if (data.attempt_avoid_detection !== undefined) updateData.attempt_avoid_detection = data.attempt_avoid_detection;
    if (data.embed_llm_instructions !== undefined) updateData.embed_llm_instructions = data.embed_llm_instructions;
    if (data.meta_title !== undefined) updateData.meta_title = data.meta_title;
    if (data.meta_description !== undefined) updateData.meta_description = data.meta_description;
    if (data.robots_directives !== undefined) updateData.robots_directives = data.robots_directives;
    if (data.custom_data !== undefined) updateData.custom_data = data.custom_data;
    
    // Update slug if title changed
    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    const { data: resume, error } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', resumeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating resume:', error);
      return { data: null, error: error.message };
    }

    return { data: resume, error: null };
  } catch (error) {
    console.error('Error updating resume:', error);
    return { data: null, error: 'Failed to update resume' };
  }
};

// Get resume by ID
export const getResume = async (resumeId: string): Promise<{ data: Resume | null; error: string | null }> => {
  try {
    const { data: resume, error } = await supabase
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();

    if (error) {
      console.error('Error fetching resume:', error);
      return { data: null, error: error.message };
    }

    return { data: resume, error: null };
  } catch (error) {
    console.error('Error fetching resume:', error);
    return { data: null, error: 'Failed to fetch resume' };
  }
};

// Get all resumes for current user
export const getUserResumes = async (): Promise<{ data: Resume[] | null; error: string | null }> => {
  try {
    const { data: resumes, error } = await supabase
      .from('resumes')
      .select('*')
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching resumes:', error);
      return { data: null, error: error.message };
    }

    return { data: resumes || [], error: null };
  } catch (error) {
    console.error('Error fetching resumes:', error);
    return { data: null, error: 'Failed to fetch resumes' };
  }
};

// Delete a resume
export const deleteResume = async (resumeId: string): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase
      .from('resumes')
      .delete()
      .eq('id', resumeId);

    if (error) {
      console.error('Error deleting resume:', error);
      return { error: error.message };
    }

    return { error: null };
  } catch (error) {
    console.error('Error deleting resume:', error);
    return { error: 'Failed to delete resume' };
  }
};

// Update resume settings (now updates individual columns)
export const updateResumeSettings = async (
  resumeId: string,
  settings: ResumeSettings
): Promise<{ data: Resume | null; error: string | null }> => {
  // Convert ResumeSettings to UpdateResumeData format
  const updateData: UpdateResumeData = {
    publish_resume_page: settings.publishResumePage,
    presence_badge: settings.presenceBadge,
    enable_resume_downloads: settings.enableResumeDownloads,
    resume_page_template: settings.resumePageTemplate,
    allow_users_switch_template: settings.allowUsersSwitchTemplate,
    visibility: settings.visibility,
    enable_mischief_mode: settings.enableMischiefMode,
    include_custom_mischief: settings.includeCustomMischief,
    custom_mischief_instructions: settings.customMischiefInstructions,
    attempt_avoid_detection: settings.attemptAvoidDetection,
    embed_llm_instructions: settings.embedLLMInstructions,
    meta_title: settings.metaTitle,
    meta_description: settings.metaDescription,
    robots_directives: settings.robotsDirectives
  };

  // Update slug if urlSlug is provided
  if (settings.urlSlug && settings.urlSlug.trim() !== '') {
    updateData.title = undefined; // Don't auto-generate slug from title
    // We'll need to manually set the slug
    const { data: resume, error } = await supabase
      .from('resumes')
      .update({ ...updateData, slug: settings.urlSlug.trim() })
      .eq('id', resumeId)
      .select()
      .single();

    if (error) {
      console.error('Error updating resume settings:', error);
      return { data: null, error: error.message };
    }

    return { data: resume, error: null };
  }

  return updateResume(resumeId, updateData);
};