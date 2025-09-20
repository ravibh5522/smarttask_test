import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TaskSuggestion {
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  estimatedHours: number;
  reasoning: string;
}

export interface AITaskSuggestionsResponse {
  suggestions: TaskSuggestion[];
  insights: string;
}

export function useAITaskSuggestions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async (
    projectId: string, 
    userContext?: string
  ): Promise<AITaskSuggestionsResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-task-suggestions', {
        body: {
          projectId,
          userContext
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data as AITaskSuggestionsResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate task suggestions';
      setError(errorMessage);
      console.error('Error generating task suggestions:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSuggestions,
    loading,
    error
  };
}