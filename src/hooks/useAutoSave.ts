import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import type { SaveStatus } from '../components/resume/AutoSaveIndicator';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<{ error: string | null }>;
  delay?: number; // Debounce delay in milliseconds
  onStatusChange?: (status: SaveStatus) => void;
  enabled?: boolean; // Whether auto-save is enabled
}

export const useAutoSave = <T>({
  data,
  onSave,
  delay = 1000,
  onStatusChange,
  enabled = true
}: UseAutoSaveOptions<T>) => {
  const { isAuthenticated } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const triggerSave = useCallback(async () => {
    if (!isAuthenticated || isSavingRef.current || !enabled) {
      return;
    }

    const currentDataString = JSON.stringify(data);
    
    // Don't save if data hasn't changed
    if (currentDataString === lastSavedDataRef.current) {
      return;
    }

    isSavingRef.current = true;
    onStatusChange?.('saving');

    try {
      const result = await onSave(data);
      
      if (result.error) {
        onStatusChange?.('error');
      } else {
        lastSavedDataRef.current = currentDataString;
        onStatusChange?.('saved');
        // Don't auto-hide saved status - it will stay visible with reduced opacity
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      onStatusChange?.('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, isAuthenticated, onStatusChange, enabled]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isAuthenticated || !enabled) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      triggerSave();
    }, delay);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, delay, triggerSave, isAuthenticated, enabled]);

  // Manual save function
  const manualSave = useCallback(() => {
    if (!enabled) {
      return;
    }
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    triggerSave();
  }, [triggerSave, enabled]);

  return { manualSave };
};