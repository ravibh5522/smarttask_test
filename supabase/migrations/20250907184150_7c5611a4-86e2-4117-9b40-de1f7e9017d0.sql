-- Enable real-time updates for AI features
ALTER TABLE tasks REPLICA IDENTITY FULL;
ALTER TABLE projects REPLICA IDENTITY FULL;
ALTER TABLE task_activities REPLICA IDENTITY FULL;
ALTER TABLE task_comments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE projects;  
ALTER PUBLICATION supabase_realtime ADD TABLE task_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE task_comments;

-- Create AI insights cache table
CREATE TABLE IF NOT EXISTS public.ai_insights_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  insight_type VARCHAR(50) NOT NULL,
  data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '1 hour'),
  UNIQUE(project_id, insight_type)
);

-- Enable RLS on ai_insights_cache
ALTER TABLE public.ai_insights_cache ENABLE ROW LEVEL SECURITY;

-- Create policies for ai_insights_cache
CREATE POLICY "Users can view insights for their projects"
ON public.ai_insights_cache
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_memberships pm
    WHERE pm.project_id = ai_insights_cache.project_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "System can manage AI insights"
ON public.ai_insights_cache
FOR ALL
USING (true)
WITH CHECK (true);

-- Create smart notifications table
CREATE TABLE IF NOT EXISTS public.smart_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB,
  priority VARCHAR(20) NOT NULL DEFAULT 'medium',
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on smart_notifications
ALTER TABLE public.smart_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for smart_notifications
CREATE POLICY "Users can view their own notifications"
ON public.smart_notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
ON public.smart_notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
ON public.smart_notifications
FOR INSERT
WITH CHECK (true);

-- Create automation rules table
CREATE TABLE IF NOT EXISTS public.automation_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  trigger_type VARCHAR(50) NOT NULL,
  trigger_conditions JSONB NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  action_config JSONB NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on automation_rules
ALTER TABLE public.automation_rules ENABLE ROW LEVEL SECURITY;

-- Create policies for automation_rules
CREATE POLICY "Project members can view automation rules"
ON public.automation_rules
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.project_memberships pm
    WHERE pm.project_id = automation_rules.project_id
    AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Project admins can manage automation rules"
ON public.automation_rules
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.project_memberships pm
    WHERE pm.project_id = automation_rules.project_id
    AND pm.user_id = auth.uid()
    AND pm.role IN ('admin', 'owner')
  )
);

-- Add indexes for performance
CREATE INDEX idx_ai_insights_cache_project_type ON public.ai_insights_cache(project_id, insight_type);
CREATE INDEX idx_ai_insights_cache_expires ON public.ai_insights_cache(expires_at);
CREATE INDEX idx_smart_notifications_user_read ON public.smart_notifications(user_id, read_at);
CREATE INDEX idx_automation_rules_project_enabled ON public.automation_rules(project_id, enabled);

-- Create trigger for updating automation_rules updated_at
CREATE TRIGGER update_automation_rules_updated_at
BEFORE UPDATE ON public.automation_rules
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to clean expired insights
CREATE OR REPLACE FUNCTION public.cleanup_expired_insights()
RETURNS void AS $$
BEGIN
  DELETE FROM public.ai_insights_cache 
  WHERE expires_at < now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;