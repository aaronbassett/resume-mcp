import React, { createContext, useContext, useState, useCallback } from 'react';
import type { Block } from '@aaronbassett/block-party';

interface ResumeBlockContextValue {
  resumeId: string | null;
  setResumeId: (id: string | null) => void;
  sharedBlocks: Set<string>;
  setSharedBlocks: (blocks: Set<string>) => void;
  isLoadingBlocks: boolean;
  setIsLoadingBlocks: (loading: boolean) => void;
  handleSharedBlockEdit: (blockId: string) => Promise<'modify' | 'duplicate' | 'cancel'>;
}

const ResumeBlockContext = createContext<ResumeBlockContextValue | undefined>(undefined);

export interface ResumeBlockProviderProps {
  children: React.ReactNode;
  resumeId?: string;
  onSharedBlockWarning?: (blockId: string, resumeCount: number) => Promise<'modify' | 'duplicate' | 'cancel'>;
}

/**
 * Provider for resume-specific block functionality
 * Manages shared block warnings and resume context
 */
export const ResumeBlockProvider: React.FC<ResumeBlockProviderProps> = ({
  children,
  resumeId: initialResumeId,
  onSharedBlockWarning,
}) => {
  const [resumeId, setResumeId] = useState<string | null>(initialResumeId || null);
  const [sharedBlocks, setSharedBlocks] = useState<Set<string>>(new Set());
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);

  const handleSharedBlockEdit = useCallback(async (blockId: string): Promise<'modify' | 'duplicate' | 'cancel'> => {
    if (!sharedBlocks.has(blockId)) {
      return 'modify';
    }

    if (onSharedBlockWarning) {
      // In a real implementation, we'd fetch the resume count from the API
      const resumeCount = 2; // Placeholder
      return await onSharedBlockWarning(blockId, resumeCount);
    }

    // Default behavior: show a confirm dialog
    const result = window.confirm(
      'This block is used in multiple resumes. Do you want to modify it (affects all resumes) or create a copy?'
    );
    
    if (result === null) return 'cancel';
    return result ? 'modify' : 'duplicate';
  }, [sharedBlocks, onSharedBlockWarning]);

  const value: ResumeBlockContextValue = {
    resumeId,
    setResumeId,
    sharedBlocks,
    setSharedBlocks,
    isLoadingBlocks,
    setIsLoadingBlocks,
    handleSharedBlockEdit,
  };

  return (
    <ResumeBlockContext.Provider value={value}>
      {children}
    </ResumeBlockContext.Provider>
  );
};

/**
 * Hook to access resume block context
 */
export const useResumeBlockContext = () => {
  const context = useContext(ResumeBlockContext);
  if (!context) {
    throw new Error('useResumeBlockContext must be used within a ResumeBlockProvider');
  }
  return context;
};