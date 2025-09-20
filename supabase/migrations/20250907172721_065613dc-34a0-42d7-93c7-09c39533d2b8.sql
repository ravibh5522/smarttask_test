-- Create enum types
CREATE TYPE public.app_role AS ENUM ('owner', 'admin', 'moderator', 'member', 'guest');
CREATE TYPE public.task_status AS ENUM ('draft', 'open', 'in_progress', 'in_review', 'completed', 'archived', 'blocked', 'rejected', 'on_hold');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE public.project_visibility AS ENUM ('private', 'internal', 'public');

-- Create organizations table
CREATE TABLE public.organizations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  timezone TEXT DEFAULT 'UTC',
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create organization memberships
CREATE TABLE public.organization_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  joined_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  visibility public.project_visibility NOT NULL DEFAULT 'private',
  settings JSONB DEFAULT '{}',
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project memberships
CREATE TABLE public.project_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, user_id)
);

-- Create tasks table
CREATE TABLE public.tasks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  parent_task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status NOT NULL DEFAULT 'draft',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  category TEXT,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  due_date TIMESTAMP WITH TIME ZONE,
  start_date TIMESTAMP WITH TIME ZONE,
  completed_date TIMESTAMP WITH TIME ZONE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  assignee_id UUID REFERENCES auth.users(id),
  position INTEGER DEFAULT 0,
  tags TEXT[],
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create task assignments for multiple assignees
CREATE TABLE public.task_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(task_id, user_id)
);

-- Create task comments
CREATE TABLE public.task_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES public.task_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;

-- Create security definer functions to avoid RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_org_role(org_id UUID, user_id UUID)
RETURNS public.app_role AS $$
  SELECT role FROM public.organization_memberships 
  WHERE organization_id = org_id AND user_id = get_user_org_role.user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.get_user_project_role(proj_id UUID, user_id UUID)
RETURNS public.app_role AS $$
  SELECT role FROM public.project_memberships 
  WHERE project_id = proj_id AND user_id = get_user_project_role.user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- RLS Policies for organizations
CREATE POLICY "Members can view their organizations" ON public.organizations 
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.organization_memberships WHERE organization_id = id AND user_id = auth.uid())
);

-- RLS Policies for organization memberships
CREATE POLICY "Members can view org memberships" ON public.organization_memberships 
FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  public.get_user_org_role(organization_id, auth.uid()) IN ('owner', 'admin')
);

-- RLS Policies for projects
CREATE POLICY "Project members can view projects" ON public.projects 
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.project_memberships WHERE project_id = id AND user_id = auth.uid()) OR
  visibility = 'public'
);

-- RLS Policies for project memberships
CREATE POLICY "Project members can view memberships" ON public.project_memberships 
FOR SELECT TO authenticated USING (
  user_id = auth.uid() OR 
  EXISTS (SELECT 1 FROM public.project_memberships pm WHERE pm.project_id = project_id AND pm.user_id = auth.uid())
);

-- RLS Policies for tasks
CREATE POLICY "Project members can view tasks" ON public.tasks 
FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.project_memberships WHERE project_id = tasks.project_id AND user_id = auth.uid())
);

CREATE POLICY "Project members can create tasks" ON public.tasks 
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM public.project_memberships WHERE project_id = tasks.project_id AND user_id = auth.uid()) AND
  created_by = auth.uid()
);

CREATE POLICY "Project members can update tasks" ON public.tasks 
FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM public.project_memberships WHERE project_id = tasks.project_id AND user_id = auth.uid())
);

-- RLS Policies for task assignments
CREATE POLICY "Project members can view task assignments" ON public.task_assignments 
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.project_memberships pm ON t.project_id = pm.project_id 
    WHERE t.id = task_id AND pm.user_id = auth.uid()
  )
);

-- RLS Policies for task comments
CREATE POLICY "Project members can view comments" ON public.task_comments 
FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.project_memberships pm ON t.project_id = pm.project_id 
    WHERE t.id = task_id AND pm.user_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create comments" ON public.task_comments 
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tasks t 
    JOIN public.project_memberships pm ON t.project_id = pm.project_id 
    WHERE t.id = task_id AND pm.user_id = auth.uid()
  ) AND user_id = auth.uid()
);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Create update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_task_comments_updated_at BEFORE UPDATE ON public.task_comments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data for testing
INSERT INTO public.organizations (name, slug, description) VALUES 
('Demo Organization', 'demo-org', 'A sample organization for testing');

-- The user profile will be created automatically via trigger when they sign up