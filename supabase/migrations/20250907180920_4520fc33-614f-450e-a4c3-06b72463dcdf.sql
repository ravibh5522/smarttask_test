-- Add task comments functionality
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.task_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on task comments
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for task comments
CREATE POLICY "Project members can view task comments" 
ON public.task_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_memberships pm ON t.project_id = pm.project_id
    WHERE t.id = task_comments.task_id AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create comments" 
ON public.task_comments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_memberships pm ON t.project_id = pm.project_id
    WHERE t.id = task_comments.task_id AND pm.user_id = auth.uid()
  ) AND user_id = auth.uid()
);

CREATE POLICY "Users can update their own comments" 
ON public.task_comments 
FOR UPDATE 
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" 
ON public.task_comments 
FOR DELETE 
USING (user_id = auth.uid());

-- Add trigger for updated_at on task comments
CREATE TRIGGER update_task_comments_updated_at
  BEFORE UPDATE ON public.task_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add task watchers functionality for notifications
CREATE TABLE IF NOT EXISTS public.task_watchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS on task watchers
ALTER TABLE public.task_watchers ENABLE ROW LEVEL SECURITY;

-- Create policies for task watchers
CREATE POLICY "Project members can view task watchers" 
ON public.task_watchers 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_memberships pm ON t.project_id = pm.project_id
    WHERE t.id = task_watchers.task_id AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Users can manage their own watching" 
ON public.task_watchers 
FOR ALL 
USING (user_id = auth.uid());

-- Add task activity log
CREATE TABLE IF NOT EXISTS public.task_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'created', 'updated', 'commented', 'assigned', 'status_changed', etc.
  activity_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on task activities
ALTER TABLE public.task_activities ENABLE ROW LEVEL SECURITY;

-- Create policy for task activities
CREATE POLICY "Project members can view task activities" 
ON public.task_activities 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_memberships pm ON t.project_id = pm.project_id
    WHERE t.id = task_activities.task_id AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create activities" 
ON public.task_activities 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t
    JOIN public.project_memberships pm ON t.project_id = pm.project_id
    WHERE t.id = task_activities.task_id AND pm.user_id = auth.uid()
  ) AND user_id = auth.uid()
);