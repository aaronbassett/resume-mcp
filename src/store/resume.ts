import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Tag {
  id: string;
  text: string;
  className?: string;
}

export interface ResumeFormData {
  title: string;
  role: string;
  displayName: string;
  tags: Tag[];
}

interface ResumeState {
  currentResume: ResumeFormData;
  updateTitle: (title: string) => void;
  updateRole: (role: string) => void;
  updateDisplayName: (displayName: string) => void;
  updateTags: (tags: Tag[]) => void;
  resetResume: () => void;
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
      
      resetResume: () => set({ currentResume: defaultResume })
    }),
    {
      name: 'resume-storage',
    }
  )
);