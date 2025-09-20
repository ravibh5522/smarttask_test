-- Enhanced Project Management Schema
-- Phase 1: Project Categories and Enhanced Features

-- Create project categories enum
CREATE TYPE public.project_category AS ENUM (
    'web_development',
    'mobile_app', 
    'marketing',
    'design',
    'research',
    'operations',
    'consulting',
    'product',
    'other'
);

-- Create project status enum
CREATE TYPE public.project_status AS ENUM (
    'planning',
    'active', 
    'on_hold',
    'completed',
    'cancelled',
    'archived'
);

-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS status project_status NOT NULL DEFAULT 'planning',
ADD COLUMN IF NOT EXISTS category project_category DEFAULT 'other',
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS budget DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD',
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Create project files table for document management
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_current_version BOOLEAN NOT NULL DEFAULT true,
    uploaded_by UUID NOT NULL,
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

-- Create policies for project_files
CREATE POLICY "Project members can view files" 
ON public.project_files 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM project_memberships pm 
    WHERE pm.project_id = project_files.project_id 
    AND pm.user_id = auth.uid()
));

CREATE POLICY "Project members can upload files" 
ON public.project_files 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_memberships pm 
        WHERE pm.project_id = project_files.project_id 
        AND pm.user_id = auth.uid()
    ) AND uploaded_by = auth.uid()
);

CREATE POLICY "File uploaders can update their files" 
ON public.project_files 
FOR UPDATE 
USING (uploaded_by = auth.uid());

-- Create project activity log table
CREATE TABLE IF NOT EXISTS public.project_activities (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    activity_type TEXT NOT NULL,
    activity_data JSONB DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_activities
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for project_activities
CREATE POLICY "Project members can view activities" 
ON public.project_activities 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM project_memberships pm 
    WHERE pm.project_id = project_activities.project_id 
    AND pm.user_id = auth.uid()
));

CREATE POLICY "Authenticated users can log activities" 
ON public.project_activities 
FOR INSERT 
WITH CHECK (
    EXISTS (
        SELECT 1 FROM project_memberships pm 
        WHERE pm.project_id = project_activities.project_id 
        AND pm.user_id = auth.uid()
    ) AND user_id = auth.uid()
);

-- Create project settings table for advanced configurations
CREATE TABLE IF NOT EXISTS public.project_settings (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE UNIQUE,
    notifications JSONB DEFAULT '{"task_updates": true, "member_changes": true, "deadline_reminders": true}',
    automation_rules JSONB DEFAULT '{}',
    permissions JSONB DEFAULT '{"allow_guest_comments": false, "require_approval_for_tasks": false}',
    integrations JSONB DEFAULT '{}',
    custom_fields JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on project_settings
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for project_settings
CREATE POLICY "Project admins can manage settings" 
ON public.project_settings 
FOR ALL 
USING (EXISTS (
    SELECT 1 FROM project_memberships pm 
    WHERE pm.project_id = project_settings.project_id 
    AND pm.user_id = auth.uid() 
    AND pm.role IN ('admin', 'owner')
));

-- Create triggers for updated_at columns
CREATE TRIGGER update_project_files_updated_at
    BEFORE UPDATE ON public.project_files
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_settings_updated_at
    BEFORE UPDATE ON public.project_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-update project completion percentage
CREATE OR REPLACE FUNCTION public.update_project_completion()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the project's completion percentage based on completed tasks
    UPDATE public.projects 
    SET completion_percentage = (
        SELECT CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0) / COUNT(*))
        END
        FROM public.tasks 
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update completion percentage
CREATE TRIGGER update_project_completion_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_project_completion();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON public.project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_project_files_uploaded_by ON public.project_files(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_project_activities_project_id ON public.project_activities(project_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_user_id ON public.project_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_project_activities_created_at ON public.project_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_category ON public.projects(category);
CREATE INDEX IF NOT EXISTS idx_projects_due_date ON public.projects(due_date);
CREATE INDEX IF NOT EXISTS idx_projects_completion ON public.projects(completion_percentage);