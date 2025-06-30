import { create } from 'zustand';

export interface Tag {
  id: string;
  text: string;
  className?: string;
}

export interface ResumeFormData {
  id?: string; // Add ID for existing resumes
  title: string;
  role: string;
  displayName: string;
  tags: Tag[];
  bodyContent?: string;
}

interface ResumeState {
  currentResume: ResumeFormData;
  isNewResume: boolean;
  hasUnsavedChanges: boolean; // Track if user has made any changes
  updateTitle: (title: string) => void;
  updateRole: (role: string) => void;
  updateDisplayName: (displayName: string) => void;
  updateTags: (tags: Tag[]) => void;
  updateBodyContent: (bodyContent: string) => void;
  setResume: (resume: ResumeFormData) => void;
  resetResume: () => void;
  setIsNewResume: (isNew: boolean) => void;
  markAsChanged: () => void; // Mark that user has made changes
  clearUnsavedChanges: () => void; // Clear the unsaved changes flag
}

const defaultResume: ResumeFormData = {
  title: 'Untitled Resume',
  role: '',
  displayName: '',
  tags: [],
  bodyContent: ''
};

export const useResumeStore = create<ResumeState>()((set) => ({
  currentResume: defaultResume,
  isNewResume: true,
  hasUnsavedChanges: false,
  
  updateTitle: (title: string) =>
    set((state) => ({
      currentResume: { ...state.currentResume, title },
      hasUnsavedChanges: true
    })),
  
  updateRole: (role: string) =>
    set((state) => ({
      currentResume: { ...state.currentResume, role },
      hasUnsavedChanges: true
    })),
  
  updateDisplayName: (displayName: string) =>
    set((state) => ({
      currentResume: { ...state.currentResume, displayName },
      hasUnsavedChanges: true
    })),
  
  updateTags: (tags: Tag[]) =>
    set((state) => ({
      currentResume: { ...state.currentResume, tags },
      hasUnsavedChanges: true
    })),
  
  updateBodyContent: (bodyContent: string) =>
    set((state) => ({
      currentResume: { ...state.currentResume, bodyContent },
      hasUnsavedChanges: true
    })),
  
  setResume: (resume: ResumeFormData) =>
    set({ currentResume: resume, isNewResume: false, hasUnsavedChanges: false }),
  
  resetResume: () => 
    set({ currentResume: defaultResume, isNewResume: true, hasUnsavedChanges: false }),
  
  setIsNewResume: (isNew: boolean) =>
    set({ isNewResume: isNew }),
  
  markAsChanged: () =>
    set({ hasUnsavedChanges: true }),
  
  clearUnsavedChanges: () =>
    set({ hasUnsavedChanges: false })
}));