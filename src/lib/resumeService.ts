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
  created_at: string;
  updated_at: string;
  // Resume Page Settings
  publish_resume_page: boolean;
  presence_badge: 'none' | 'count-only' | 'show-profile';
  enable_resume_downloads: boolean;
  resume_page_template: 'standard' | 'traditional' | 'neo-brutalist' | 'namaste' | 'zine' | 'enterprise';
  allow_users_switch_template: boolean;
  visibility: 'public' | 'authenticated' | 'unlisted';
  // Mischief & LLMs
  enable_mischief_mode: boolean;
  include_custom_mischief: boolean;
  custom_mischief_instructions: string;
  attempt_avoid_detection: boolean;
  embed_llm_instructions: boolean;
  // Metadata
  meta_title: string;
  meta_description: string;
  robots_directives: string[];
}

export interface CreateResumeData {
  title: string;
  role: string;
  display_name: string;
  tags: Tag[];
}

export interface UpdateResumeData {
  title?: string;
  role?: string;
  display_name?: string;
  tags?: Tag[];
  // Resume settings
  settings?: Partial<ResumeSettings>;
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
      tags: data.tags || []
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
    const updateData: any = { ...data };
    
    // Update slug if title changed
    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    // Handle settings update if provided
    if (data.settings) {
      const { settings, ...otherData } = updateData;
      
      // Map settings object to database column names
      if (settings.publishResumePage !== undefined) updateData.publish_resume_page = settings.publishResumePage;
      if (settings.presenceBadge !== undefined) updateData.presence_badge = settings.presenceBadge;
      if (settings.enableResumeDownloads !== undefined) updateData.enable_resume_downloads = settings.enableResumeDownloads;
      if (settings.resumePageTemplate !== undefined) updateData.resume_page_template = settings.resumePageTemplate;
      if (settings.allowUsersSwitchTemplate !== undefined) updateData.allow_users_switch_template = settings.allowUsersSwitchTemplate;
      if (settings.visibility !== undefined) updateData.visibility = settings.visibility;
      
      if (settings.enableMischiefMode !== undefined) updateData.enable_mischief_mode = settings.enableMischiefMode;
      if (settings.includeCustomMischief !== undefined) updateData.include_custom_mischief = settings.includeCustomMischief;
      if (settings.customMischiefInstructions !== undefined) updateData.custom_mischief_instructions = settings.customMischiefInstructions;
      if (settings.attemptAvoidDetection !== undefined) updateData.attempt_avoid_detection = settings.attemptAvoidDetection;
      if (settings.embedLLMInstructions !== undefined) updateData.embed_llm_instructions = settings.embedLLMInstructions;
      
      if (settings.metaTitle !== undefined) updateData.meta_title = settings.metaTitle;
      if (settings.metaDescription !== undefined) updateData.meta_description = settings.metaDescription;
      if (settings.robotsDirectives !== undefined) updateData.robots_directives = settings.robotsDirectives;
      
      // If urlSlug is provided, update the slug
      if (settings.urlSlug !== undefined && settings.urlSlug.trim() !== '') {
        updateData.slug = settings.urlSlug.trim();
      }
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

// Update resume settings
export const updateResumeSettings = async (
  resumeId: string,
  settings: ResumeSettings
): Promise<{ data: Resume | null; error: string | null }> => {
  return updateResume(resumeId, { settings });
};