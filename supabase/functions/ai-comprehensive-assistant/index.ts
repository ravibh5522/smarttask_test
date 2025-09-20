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
    const { action, projectId, userId, params } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    console.log('AI Assistant Action:', action);
    console.log('Project ID:', projectId);
    console.log('User ID:', userId);
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Comprehensive data gathering
    const gatherProjectData = async (projectId: string) => {
      console.log('Gathering comprehensive project data...');
      
      // Fetch all relevant data
      const [
        { data: project },
        { data: tasks },
        { data: milestones },
        { data: members },
        { data: activities },
        { data: timeEntries },
        { data: comments }
      ] = await Promise.all([
        supabase.from('projects').select('*').eq('id', projectId).single(),
        supabase.from('tasks').select('*').eq('project_id', projectId).order('created_at', { ascending: false }),
        supabase.from('project_milestones').select('*').eq('project_id', projectId).order('position'),
        supabase.from('project_memberships').select(`
          id, role, joined_at,
          profiles:user_id (id, full_name, email)
        `).eq('project_id', projectId),
        supabase.from('task_activities').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('time_entries').select('*').eq('project_id', projectId).order('start_time', { ascending: false }),
        supabase.from('task_comments').select(`
          id, content, created_at,
          task:task_id (id, title),
          user:user_id (id, full_name)
        `).limit(20)
      ]);

      return {
        project,
        tasks: tasks || [],
        milestones: milestones || [],
        members: members || [],
        activities: activities || [],
        timeEntries: timeEntries || [],
        comments: comments || []
      };
    };

    const projectData = projectId ? await gatherProjectData(projectId) : null;

    // Action handlers
    const handleReportGeneration = async (reportType: string) => {
      console.log('Generating report:', reportType);
      
      const prompt = `Generate a comprehensive ${reportType} report for this project management system.

Project Data:
${projectData ? `
Project: ${projectData.project?.name}
Description: ${projectData.project?.description}
Tasks: ${projectData.tasks.length} total
- Open: ${projectData.tasks.filter(t => t.status === 'open').length}
- In Progress: ${projectData.tasks.filter(t => t.status === 'in_progress').length}
- Completed: ${projectData.tasks.filter(t => t.status === 'completed').length}
- High Priority: ${projectData.tasks.filter(t => t.priority === 'high').length}

Milestones: ${projectData.milestones.length} total
- Completed: ${projectData.milestones.filter(m => m.status === 'completed').length}
- In Progress: ${projectData.milestones.filter(m => m.status === 'in_progress').length}

Team Members: ${projectData.members.length}
Recent Activities: ${projectData.activities.length}
Time Tracking Entries: ${projectData.timeEntries.length}
Comments/Discussions: ${projectData.comments.length}
` : 'No specific project data available - generate general report'}

Report Type: ${reportType}

Please provide a detailed, actionable report in JSON format:
{
  "reportTitle": "string",
  "executiveSummary": "string",
  "keyMetrics": {
    "metric1": "value",
    "metric2": "value"
  },
  "findings": [
    {
      "category": "string",
      "finding": "string",
      "impact": "high|medium|low",
      "recommendation": "string"
    }
  ],
  "recommendations": [
    {
      "priority": "high|medium|low",
      "action": "string",
      "timeline": "string",
      "expectedOutcome": "string"
    }
  ],
  "nextSteps": ["string"],
  "riskAssessment": {
    "risks": ["string"],
    "mitigation": ["string"]
  }
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 3000, temperature: 0.7 }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.candidates[0].content.parts[0].text;
      
      // Clean response - remove markdown code blocks if present
      responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse report JSON response:', responseText);
        throw new Error('Invalid JSON response from AI for report generation');
      }
    };

    const handleActionExecution = async (actionType: string, actionParams: any) => {
      console.log('Executing action:', actionType, actionParams);
      
      switch (actionType) {
        case 'create_task':
          const { data: newTask } = await supabase.from('tasks').insert({
            project_id: projectId,
            title: actionParams.title,
            description: actionParams.description,
            priority: actionParams.priority || 'medium',
            status: actionParams.status || 'draft',
            created_by: userId,
            due_date: actionParams.dueDate,
            estimated_hours: actionParams.estimatedHours
          }).select().single();
          
          // Log activity
          await supabase.from('task_activities').insert({
            task_id: newTask.id,
            user_id: userId,
            activity_type: 'created',
            activity_data: { title: newTask.title, source: 'ai_assistant' }
          });
          
          return { success: true, data: newTask };

        case 'update_task_status':
          const { data: updatedTask } = await supabase.from('tasks')
            .update({ 
              status: actionParams.status,
              completed_date: actionParams.status === 'completed' ? new Date().toISOString() : null
            })
            .eq('id', actionParams.taskId)
            .select().single();
          
          await supabase.from('task_activities').insert({
            task_id: actionParams.taskId,
            user_id: userId,
            activity_type: 'status_changed',
            activity_data: { 
              old_status: actionParams.oldStatus,
              new_status: actionParams.status,
              source: 'ai_assistant'
            }
          });
          
          return { success: true, data: updatedTask };

        case 'create_milestone':
          const { data: newMilestone } = await supabase.from('project_milestones').insert({
            project_id: projectId,
            title: actionParams.title,
            description: actionParams.description,
            due_date: actionParams.dueDate,
            created_by: userId,
            position: actionParams.position || 1
          }).select().single();
          
          return { success: true, data: newMilestone };

        case 'bulk_task_update':
          const updates = actionParams.updates || [];
          const results = [];
          
          for (const update of updates) {
            const { data } = await supabase.from('tasks')
              .update(update.changes)
              .eq('id', update.taskId)
              .select().single();
            results.push(data);
            
            // Log each update
            await supabase.from('task_activities').insert({
              task_id: update.taskId,
              user_id: userId,
              activity_type: 'bulk_updated',
              activity_data: { changes: update.changes, source: 'ai_assistant' }
            });
          }
          
          return { success: true, data: results };

        default:
          throw new Error(`Unknown action type: ${actionType}`);
      }
    };

    const handleIntelligentAnalysis = async (query: string) => {
      console.log('Performing intelligent analysis:', query);
      
      const prompt = `You are an advanced AI project management assistant with full access to project data and the ability to perform actions.

Current Project Data:
${JSON.stringify(projectData, null, 2)}

User Query: ${query}

Based on the project data and query, provide an intelligent response that can include:
1. Data analysis and insights
2. Specific recommendations
3. Action suggestions (with exact parameters)

Respond in JSON format:
{
  "analysis": "string - your analysis of the situation",
  "insights": ["key insights"],
  "suggestedActions": [
    {
      "type": "create_task|update_task_status|create_milestone|bulk_task_update",
      "description": "what this action does",
      "params": { /* specific parameters for the action */ },
      "reasoning": "why this action is recommended"
    }
  ],
  "recommendations": ["actionable recommendations"],
  "followUpQuestions": ["questions to ask for better assistance"]
}`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 2500, temperature: 0.8 }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      let responseText = data.candidates[0].content.parts[0].text;
      
      // Clean response - remove markdown code blocks if present
      responseText = responseText.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
      
      try {
        return JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse AI response:', responseText);
        throw new Error('Invalid JSON response from AI');
      }
    };

    // Main action router
    let result;
    
    switch (action) {
      case 'generate_report':
        result = await handleReportGeneration(params.reportType || 'project_summary');
        break;
        
      case 'execute_action':
        result = await handleActionExecution(params.actionType, params.actionParams);
        break;
        
      case 'analyze':
        result = await handleIntelligentAnalysis(params.query);
        break;
        
      case 'get_project_overview':
        result = {
          project: projectData?.project,
          summary: {
            totalTasks: projectData?.tasks.length || 0,
            completedTasks: projectData?.tasks.filter(t => t.status === 'completed').length || 0,
            totalMilestones: projectData?.milestones.length || 0,
            completedMilestones: projectData?.milestones.filter(m => m.status === 'completed').length || 0,
            teamSize: projectData?.members.length || 0,
            recentActivity: projectData?.activities.length || 0
          }
        };
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    console.log('AI Assistant response generated successfully');
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in ai-comprehensive-assistant:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});