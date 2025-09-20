-- Fix RLS policies for projects table to handle auth properly
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Project creators can update projects" ON public.projects;
DROP POLICY IF EXISTS "Users can view projects they belong to" ON public.projects;

-- Create more robust policies
CREATE POLICY "Users can create projects" 
ON public.projects 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Users can view projects they belong to" 
ON public.projects 
FOR SELECT 
TO authenticated 
USING (
  auth.uid() IS NOT NULL AND (
    id IN (
      SELECT project_id 
      FROM project_memberships 
      WHERE user_id = auth.uid()
    ) 
    OR visibility = 'public'
    OR created_by = auth.uid()
  )
);

CREATE POLICY "Project creators can update projects" 
ON public.projects 
FOR UPDATE 
TO authenticated 
USING (auth.uid() IS NOT NULL AND created_by = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

-- Fix project_memberships policies too
DROP POLICY IF EXISTS "Project admins can manage memberships" ON public.project_memberships;
DROP POLICY IF EXISTS "Users can view their project memberships" ON public.project_memberships;

CREATE POLICY "Users can view their project memberships" 
ON public.project_memberships 
FOR SELECT 
TO authenticated 
USING (auth.uid() IS NOT NULL AND user_id = auth.uid());

CREATE POLICY "Project creators can manage memberships" 
ON public.project_memberships 
FOR INSERT 
TO authenticated 
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  EXISTS (
    SELECT 1 
    FROM projects 
    WHERE id = project_id AND created_by = auth.uid()
  )
);