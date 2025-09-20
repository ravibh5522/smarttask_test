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
    const { message, projectId, userId, context } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiApiKey) {
      throw new Error('Gemini API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Gather context if projectId is provided
    let projectContext = '';
    if (projectId) {
      const { data: project } = await supabase
        .from('projects')
        .select('name, description')
        .eq('id', projectId)
        .single();

      const { data: tasks } = await supabase
        .from('tasks')
        .select('title, status, priority, due_date')
        .eq('project_id', projectId)
        .limit(10);

      projectContext = `Current Project: ${project?.name || 'Unknown'}
Project Description: ${project?.description || 'No description'}
Recent Tasks: ${tasks?.map(t => `- ${t.title} (${t.status})`).join('\n') || 'No tasks'}`;
    }

    // Call Gemini (Note: Gemini doesn't support streaming, so we'll get the full response)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are TaskFlow AI, an intelligent project management assistant. You help users manage projects, tasks, and team collaboration effectively.

Key capabilities:
- Analyze project data and provide insights
- Suggest task improvements and priorities  
- Help with project planning and organization
- Answer questions about project management best practices
- Provide actionable recommendations

Context: ${context || 'General project management assistance'}
${projectContext}

Be helpful, concise, and actionable. Focus on practical project management advice.

User message: ${message}`
          }]
        }],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      throw new Error('Failed to get AI response');
    }

    const data = await response.json();
    const aiResponse = data.candidates[0].content.parts[0].text;

    // Since Gemini doesn't support streaming, we'll simulate it for compatibility
    const stream = new ReadableStream({
      start(controller) {
        // Send the response in chunks to simulate streaming
        const chunks = aiResponse.split(' ');
        let index = 0;

        const sendChunk = () => {
          if (index < chunks.length) {
            const chunk = chunks[index] + (index < chunks.length - 1 ? ' ' : '');
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ content: chunk })}\n\n`));
            index++;
            setTimeout(sendChunk, 50); // Small delay between chunks
          } else {
            controller.close();
          }
        };

        sendChunk();
      }
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in ai-assistant-chat:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      content: "I'm sorry, I'm having trouble processing your request right now. Please try again later."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});