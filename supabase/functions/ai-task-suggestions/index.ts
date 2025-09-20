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
    const { projectId, userContext } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('Starting ai-task-suggestions function');
    console.log('Project ID:', projectId);
    console.log('User context:', userContext);
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

    // Fetch project data for context
    const { data: project } = await supabase
      .from('projects')
      .select('name, description')
      .eq('id', projectId)
      .single();

    // Fetch existing tasks for analysis
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, description, status, priority, due_date')
      .eq('project_id', projectId)
      .limit(20);

    // Prepare context for AI
    const projectContext = {
      project: project || { name: 'Unknown Project', description: '' },
      existingTasks: tasks || [],
      userContext: userContext || 'General project management'
    };

    console.log('Project context prepared:', projectContext);

    // Call Gemini for task suggestions
    console.log('Calling Gemini API...');
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are an AI project management assistant. Based on the project context and existing tasks, suggest 3-5 relevant tasks that would help move the project forward. Consider task dependencies, priorities, and project timeline.

Return suggestions in JSON format:
{
  "suggestions": [
    {
      "title": "Task title",
      "description": "Detailed description",
      "priority": "high|medium|low",
      "category": "development|design|testing|documentation|planning|marketing",
      "estimatedHours": number,
      "reasoning": "Why this task is important"
    }
  ],
  "insights": "Overall project insights and recommendations"
}

Project: ${projectContext.project.name}
Description: ${projectContext.project.description}

Existing tasks: ${JSON.stringify(projectContext.existingTasks)}

User context: ${projectContext.userContext}

Please suggest relevant tasks to help move this project forward.`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.8,
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
    
    let suggestions;
    try {
      suggestions = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback if JSON parsing fails
      suggestions = {
        suggestions: [
          {
            title: "Review and prioritize existing tasks",
            description: "Analyze current task backlog and update priorities based on project goals",
            priority: "medium",
            category: "planning",
            estimatedHours: 2,
            reasoning: "Regular task review helps maintain project momentum"
          }
        ],
        insights: "AI suggestions are temporarily unavailable. Please review your existing tasks."
      };
    }

    console.log('Generated task suggestions:', suggestions);

    return new Response(JSON.stringify(suggestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-task-suggestions:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      suggestions: [],
      insights: "Unable to generate suggestions at this time."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});