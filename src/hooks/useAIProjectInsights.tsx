import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ProjectInsight {
  type: 'success' | 'warning' | 'info' | 'critical';
  title: string;
  description: string;
  actionItem: string;
}

export interface ProjectRecommendation {
  priority: 'high' | 'medium' | 'low';
  action: string;
  impact: string;
}

export interface ProjectPredictions {
  completionDate: string;
  risksIdentified: string[];
  bottlenecks: string[];
}

export interface AIProjectInsightsResponse {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor';
  healthScore: number;
  keyMetrics: {
    completionRate: string;
    productivity: 'high' | 'medium' | 'low';
    riskLevel: 'low' | 'medium' | 'high';
  };
  insights: ProjectInsight[];
  recommendations: ProjectRecommendation[];
  predictions: ProjectPredictions;
}

export function useAIProjectInsights() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsights = async (projectId: string): Promise<AIProjectInsightsResponse | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: functionError } = await supabase.functions.invoke('ai-project-insights', {
        body: { projectId }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data as AIProjectInsightsResponse;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate project insights';
      setError(errorMessage);
      console.error('Error generating project insights:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateInsights,
    loading,
    error
  };
}