import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
}

interface ResumeState {
  currentResume: ResumeFormData;
  isNewResume: boolean;
  updateTitle: (title: string) => void;
  updateRole: (role: string) => void;
  updateDisplayName: (displayName: string) => void;
  updateTags: (tags: Tag[]) => void;
  setResume: (resume: ResumeFormData) => void;
  resetResume: () => void;
  setIsNewResume: (isNew: boolean) => void;
}

const defaultResume: ResumeFormData = {
  title: 'Untitled Resume',
  role: '',
  displayName: '',
  tags: []
};

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      currentResume: defaultResume,
      isNewResume: true,
      
      updateTitle: (title: string) =>
        set((state) => ({
          currentResume: { ...state.currentResume, title }
        })),
      
      updateRole: (role: string) =>
        set((state) => ({
          currentResume: { ...state.currentResume, role }
        })),
      
      updateDisplayName: (displayName: string) =>
        set((state) => ({
          currentResume: { ...state.currentResume, displayName }
        })),
      
      updateTags: (tags: Tag[]) =>
        set((state) => ({
          currentResume: { ...state.currentResume, tags }
        })),
      
      setResume: (resume: ResumeFormData) =>
        set({ currentResume: resume, isNewResume: false }),
      
      resetResume: () => 
        set({ currentResume: defaultResume, isNewResume: true }),
      
      setIsNewResume: (isNew: boolean) =>
        set({ isNewResume: isNew })
    }),
    {
      name: 'resume-storage',
    }
  )
);