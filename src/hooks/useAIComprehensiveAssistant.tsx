import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AIReport {
  reportTitle: string;
  executiveSummary: string;
  keyMetrics: Record<string, string>;
  findings: Array<{
    category: string;
    finding: string;
    impact: 'high' | 'medium' | 'low';
    recommendation: string;
  }>;
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    action: string;
    timeline: string;
    expectedOutcome: string;
  }>;
  nextSteps: string[];
  riskAssessment: {
    risks: string[];
    mitigation: string[];
  };
}

export interface AIAnalysis {
  analysis: string;
  insights: string[];
  suggestedActions: Array<{
    type: string;
    description: string;
    params: any;
    reasoning: string;
  }>;
  recommendations: string[];
  followUpQuestions: string[];
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function useAIComprehensiveAssistant() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateReport = async (
    projectId: string,
    reportType: 'project_summary' | 'performance_analysis' | 'risk_assessment' | 'team_productivity' | 'milestone_review'
  ): Promise<AIReport | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: functionError } = await supabase.functions.invoke('ai-comprehensive-assistant', {
        body: {
          action: 'generate_report',
          projectId,
          userId: user.id,
          params: { reportType }
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data as AIReport;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate report';
      setError(errorMessage);
      console.error('Error generating report:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (
    projectId: string,
    actionType: string,
    actionParams: any
  ): Promise<ActionResult | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: functionError } = await supabase.functions.invoke('ai-comprehensive-assistant', {
        body: {
          action: 'execute_action',
          projectId,
          userId: user.id,
          params: { actionType, actionParams }
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data as ActionResult;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute action';
      setError(errorMessage);
      console.error('Error executing action:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const analyzeProject = async (
    projectId: string,
    query: string
  ): Promise<AIAnalysis | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: functionError } = await supabase.functions.invoke('ai-comprehensive-assistant', {
        body: {
          action: 'analyze',
          projectId,
          userId: user.id,
          params: { query }
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data as AIAnalysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze project';
      setError(errorMessage);
      console.error('Error analyzing project:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const getProjectOverview = async (projectId: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error: functionError } = await supabase.functions.invoke('ai-comprehensive-assistant', {
        body: {
          action: 'get_project_overview',
          projectId,
          userId: user.id,
          params: {}
        }
      });

      if (functionError) {
        throw new Error(functionError.message);
      }

      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get project overview';
      setError(errorMessage);
      console.error('Error getting project overview:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateReport,
    executeAction,
    analyzeProject,
    getProjectOverview,
    loading,
    error
  };
}