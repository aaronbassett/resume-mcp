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
  // Settings stored as a JSON object
  settings: {
    publishResumePage: boolean;
    presenceBadge: 'none' | 'count-only' | 'show-profile';
    enableResumeDownloads: boolean;
    resumePageTemplate: 'standard' | 'traditional' | 'neo-brutalist' | 'namaste' | 'zine' | 'enterprise';
    allowUsersSwitchTemplate: boolean;
    visibility: 'public' | 'authenticated' | 'unlisted';
    enableMischiefMode: boolean;
    includeCustomMischief: boolean;
    customMischiefInstructions: string;
    attemptAvoidDetection: boolean;
    embedLLMInstructions: boolean;
    urlSlug?: string;
    metaTitle: string;
    metaDescription: string;
    robotsDirectives: string[];
  };
  // Legacy columns - will be migrated to settings
  publish_resume_page?: boolean;
  presence_badge?: 'none' | 'count-only' | 'show-profile';
  enable_resume_downloads?: boolean;
  resume_page_template?: 'standard' | 'traditional' | 'neo-brutalist' | 'namaste' | 'zine' | 'enterprise';
  allow_users_switch_template?: boolean;
  visibility?: 'public' | 'authenticated' | 'unlisted';
  enable_mischief_mode?: boolean;
  include_custom_mischief?: boolean;
  custom_mischief_instructions?: string;
  attempt_avoid_detection?: boolean;
  embed_llm_instructions?: boolean;
  meta_title?: string;
  meta_description?: string;
  robots_directives?: string[];
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
      tags: data.tags || [],
      settings: {
        publishResumePage: true,
        presenceBadge: 'none',
        enableResumeDownloads: true,
        resumePageTemplate: 'standard',
        allowUsersSwitchTemplate: false,
        visibility: 'public',
        enableMischiefMode: false,
        includeCustomMischief: false,
        customMischiefInstructions: '',
        attemptAvoidDetection: false,
        embedLLMInstructions: true,
        urlSlug: slug,
        metaTitle: '',
        metaDescription: '',
        robotsDirectives: ['index', 'follow']
      }
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
    
    // Copy non-settings properties
    if (data.title !== undefined) updateData.title = data.title;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.display_name !== undefined) updateData.display_name = data.display_name;
    if (data.tags !== undefined) updateData.tags = data.tags;
    
    // Update slug if title changed
    if (data.title) {
      updateData.slug = generateSlug(data.title);
    }

    // Handle settings update if provided
    if (data.settings) {
      // Get current resume to merge settings
      const { data: currentResume, error: fetchError } = await supabase
        .from('resumes')
        .select('settings')
        .eq('id', resumeId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching current resume settings:', fetchError);
        return { data: null, error: fetchError.message };
      }
      
      // Merge current settings with new settings
      const currentSettings = currentResume.settings || {};
      updateData.settings = {
        ...currentSettings,
        ...data.settings
      };
      
      // If urlSlug is provided, update the slug field as well
      if (data.settings.urlSlug !== undefined && data.settings.urlSlug.trim() !== '') {
        updateData.slug = data.settings.urlSlug.trim();
        updateData.settings.urlSlug = data.settings.urlSlug.trim();
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