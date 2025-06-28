import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/auth';
import type { SaveStatus } from '../components/resume/AutoSaveIndicator';

interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<{ error: string | null }>;
  delay?: number; // Debounce delay in milliseconds
  onStatusChange?: (status: SaveStatus) => void;
}

export const useAutoSave = <T>({
  data,
  onSave,
  delay = 1000,
  onStatusChange
}: UseAutoSaveOptions<T>) => {
  const { isAuthenticated } = useAuthStore();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<string>('');
  const isSavingRef = useRef(false);

  const triggerSave = useCallback(async () => {
    if (!isAuthenticated || isSavingRef.current) {
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
        
        // Auto-hide saved status after 2 seconds
        setTimeout(() => {
          onStatusChange?.('idle');
        }, 2000);
      }
    } catch (error) {
      console.error('Auto-save error:', error);
      onStatusChange?.('error');
    } finally {
      isSavingRef.current = false;
    }
  }, [data, onSave, isAuthenticated, onStatusChange]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isAuthenticated) {
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
  }, [data, delay, triggerSave, isAuthenticated]);

  // Manual save function
  const manualSave = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    triggerSave();
  }, [triggerSave]);

  return { manualSave };
};