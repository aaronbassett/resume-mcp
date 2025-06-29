import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

interface UseGenerativeAIOptions {
  existingText?: string;
  contextualInfo?: string;
}

interface UseGenerativeAIResult {
  generateText: (instructions: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
}

interface GenerateTextResponse {
  text?: string;
  error?: string;
}

export const useGenerativeAI = (options: UseGenerativeAIOptions = {}): UseGenerativeAIResult => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateText = useCallback(async (instructions: string): Promise<string | null> => {
    if (!instructions.trim()) {
      setError('Instructions are required');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Get the current session to ensure user is authenticated
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        setError('You must be logged in to use this feature');
        setIsLoading(false);
        return null;
      }

      // Prepare the input for the edge function
      let input = '';
      
      // Combine existing text and contextual info if available
      if (options.existingText || options.contextualInfo) {
        const parts: string[] = [];
        
        if (options.existingText) {
          parts.push(`Current text: ${options.existingText}`);
        }
        
        if (options.contextualInfo) {
          parts.push(`Context: ${options.contextualInfo}`);
        }
        
        input = parts.join('\n\n');
      }

      // Call the Supabase Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('generate-text', {
        body: {
          instructions,
          input: input || undefined
        }
      });

      if (functionError) {
        console.error('Edge function error:', functionError);
        setError('Failed to generate text. Please try again.');
        setIsLoading(false);
        return null;
      }

      const response = data as GenerateTextResponse;

      if (response.error) {
        setError(response.error);
        setIsLoading(false);
        return null;
      }

      if (!response.text) {
        setError('No text was generated');
        setIsLoading(false);
        return null;
      }

      setIsLoading(false);
      return response.text;

    } catch (err) {
      console.error('Generate text error:', err);
      
      // Handle specific error types
      if (err instanceof Error) {
        if (err.message.includes('timeout') || err.message.includes('408')) {
          setError('Request timed out. Please try again.');
        } else if (err.message.includes('401') || err.message.includes('unauthorized')) {
          setError('You must be logged in to use this feature');
        } else if (err.message.includes('network') || err.message.includes('fetch')) {
          setError('Network error. Please check your connection and try again.');
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
      
      setIsLoading(false);
      return null;
    }
  }, [options.existingText, options.contextualInfo]);

  return {
    generateText,
    isLoading,
    error
  };
};