import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { projectId } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('Starting ai-project-insights function');
    console.log('Project ID:', projectId);
    console.log('Gemini API Key present:', !!geminiApiKey);
    
    if (!geminiApiKey) {
      console.error('Gemini API key not found');
      throw new Error('Gemini API key not configured');
    }

    console.log('Fetching project data...');
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch comprehensive project data
    const { data: project } = await supabase
      .from('projects')
      .select('name, description, created_at')
      .eq('id', projectId)
      .single();

    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, description, status, priority, due_date, estimated_hours, actual_hours, created_at, updated_at')
      .eq('project_id', projectId);

    const { data: activities } = await supabase
      .from('task_activities')
      .select('activity_type, created_at')
      .in('task_id', (tasks || []).map(t => t.id))
      .order('created_at', { ascending: false })
      .limit(50);

    // Analyze project metrics
    const now = new Date();
    const projectAge = project ? Math.floor((now.getTime() - new Date(project.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0;
    
    const taskStats = {
      total: tasks?.length || 0,
      completed: tasks?.filter(t => t.status === 'completed').length || 0,
      inProgress: tasks?.filter(t => t.status === 'in_progress').length || 0,
      overdue: tasks?.filter(t => t.due_date && new Date(t.due_date) < now && t.status !== 'completed').length || 0,
      highPriority: tasks?.filter(t => t.priority === 'high').length || 0
    };

    const completionRate = taskStats.total > 0 ? (taskStats.completed / taskStats.total * 100).toFixed(1) : '0';

    console.log('Task statistics:', taskStats);
    console.log('Completion rate:', completionRate);

    // Call Gemini for insights
    console.log('Calling Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI project management analyst. Analyze project data and provide actionable insights. Return response in JSON format:
{
  "overallHealth": "excellent|good|fair|poor",
  "healthScore": number (0-100),
  "keyMetrics": {
    "completionRate": string,
    "productivity": "high|medium|low",
    "riskLevel": "low|medium|high"
  },
  "insights": [
    {
      "type": "success|warning|info|critical",
      "title": "Insight title",
      "description": "Detailed insight",
      "actionItem": "Suggested action"
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "Specific recommended action",
      "impact": "Expected impact of this action"
    }
  ],
  "predictions": {
    "completionDate": "Estimated project completion",
    "risksIdentified": ["list of potential risks"],
    "bottlenecks": ["current bottlenecks"]
  }
}

Project Analysis Request:

Project: ${project?.name || 'Unknown'}
Description: ${project?.description || 'No description'}
Project Age: ${projectAge} days

Task Statistics:
- Total Tasks: ${taskStats.total}
- Completed: ${taskStats.completed} (${completionRate}%)
- In Progress: ${taskStats.inProgress}
- Overdue: ${taskStats.overdue}
- High Priority: ${taskStats.highPriority}

Recent Activity: ${activities?.length || 0} activities in the last period

Please provide comprehensive project insights, health assessment, and actionable recommendations.`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
        },
      }),
    });

    console.log('Gemini response status:', response.status);
    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API error: ${response.status} ${error}`);
    }

    const data = await response.json();
    console.log('Gemini response received, parsing...');
    const aiResponse = data.candidates[0].content.parts[0].text;
    
    let insights;
    try {
      insights = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback insights
      insights = {
        overallHealth: taskStats.overdue > taskStats.total * 0.2 ? "poor" : taskStats.completed > taskStats.total * 0.7 ? "good" : "fair",
        healthScore: Math.max(0, 100 - (taskStats.overdue * 10) + (taskStats.completed * 2)),
        keyMetrics: {
          completionRate: `${completionRate}%`,
          productivity: taskStats.inProgress > taskStats.total * 0.3 ? "high" : "medium",
          riskLevel: taskStats.overdue > 0 ? "medium" : "low"
        },
        insights: [
          {
            type: taskStats.overdue > 0 ? "warning" : "info",
            title: "Task Status Review",
            description: `You have ${taskStats.completed} completed tasks out of ${taskStats.total} total tasks.`,
            actionItem: taskStats.overdue > 0 ? "Review overdue tasks and update deadlines" : "Continue current momentum"
          }
        ],
        recommendations: [
          {
            priority: "medium",
            action: "Regular task review and priority updates",
            impact: "Improved project visibility and progress tracking"
          }
        ],
        predictions: {
          completionDate: "Analysis pending",
          risksIdentified: taskStats.overdue > 0 ? ["Overdue tasks may impact timeline"] : [],
          bottlenecks: taskStats.inProgress === 0 ? ["No active tasks"] : []
        }
      };
    }

    console.log('Generated project insights:', insights);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-project-insights:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      overallHealth: "unknown",
      insights: [],
      recommendations: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});