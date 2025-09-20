-- Fix infinite recursion in RLS policies and foreign key issues

-- First, drop problematic policies
DROP POLICY IF EXISTS "Project members can view memberships" ON public.project_memberships;
DROP POLICY IF EXISTS "Members can view org memberships" ON public.organization_memberships;
DROP POLICY IF EXISTS "Project members can view projects" ON public.projects;

-- Fix foreign key constraint for assignee_id
ALTER TABLE public.tasks DROP CONSTRAINT IF EXISTS tasks_assignee_id_fkey;
ALTER TABLE public.tasks ADD CONSTRAINT tasks_assignee_id_fkey 
  FOREIGN KEY (assignee_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Create simpler, non-recursive RLS policies

-- Projects: Allow users to see projects they are members of
CREATE POLICY "Users can view their project memberships" ON public.project_memberships 
FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE POLICY "Users can view projects they belong to" ON public.projects 
FOR SELECT TO authenticated USING (
  id IN (SELECT project_id FROM public.project_memberships WHERE user_id = auth.uid()) OR
  visibility = 'public'
);

-- Organization memberships: Simple user-based access
CREATE POLICY "Users can view their own org memberships" ON public.organization_memberships 
FOR SELECT TO authenticated USING (user_id = auth.uid());

-- Add missing policies for creating project memberships
CREATE POLICY "Project admins can manage memberships" ON public.project_memberships 
FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.projects 
    WHERE id = project_id AND created_by = auth.uid()
  )
);

-- Add policies for creating/updating projects
CREATE POLICY "Users can create projects" ON public.projects 
FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());

CREATE POLICY "Project creators can update projects" ON public.projects 
FOR UPDATE TO authenticated USING (created_by = auth.uid());

-- Add organizations policies
CREATE POLICY "Users can create organizations" ON public.organizations 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Users can view organizations they belong to" ON public.organizations 
FOR SELECT TO authenticated USING (
  id IN (SELECT organization_id FROM public.organization_memberships WHERE user_id = auth.uid())
);

-- Add organization membership creation policy
CREATE POLICY "Users can join organizations" ON public.organization_memberships 
FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Make sure users are automatically added to demo org and can create their first project
DO $$
DECLARE
    demo_org_id UUID;
BEGIN
    -- Get the demo org ID
    SELECT id INTO demo_org_id FROM public.organizations WHERE slug = 'demo-org';
    
    -- If demo org doesn't exist, create it
    IF demo_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug, description)
        VALUES ('Demo Organization', 'demo-org', 'A sample organization for new users')
        RETURNING id INTO demo_org_id;
    END IF;
    
    -- Insert membership for the current user if they exist
    -- This will be handled by the trigger for new users
END $$;