-- Add task watchers functionality for notifications (if not exists)
CREATE TABLE IF NOT EXISTS public.task_watchers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Enable RLS on task watchers
ALTER TABLE public.task_watchers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Project members can view task watchers" ON public.task_watchers;
DROP POLICY IF EXISTS "Users can manage their own watching" ON public.task_watchers;

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

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Project members can view task activities" ON public.task_activities;
DROP POLICY IF EXISTS "Authenticated users can create activities" ON public.task_activities;

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