import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Project {
  id: string;
  name: string;
  description?: string | null;
  visibility: 'private' | 'internal' | 'public';
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  task_count?: number;
  member_count?: number;
  status?: string | null;
  category?: string | null;
  due_date?: string | null;
  budget?: number | null;
  currency?: string | null;
  archived_at?: string | null;
  completion_percentage?: number | null;
  priority?: string | null;
}

export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get task counts for each project (optimized with single query)
      const projectIds = (data || []).map(p => p.id);
      
      if (projectIds.length > 0) {
        const [tasksCountResult, membersCountResult] = await Promise.all([
          supabase
            .from('tasks')
            .select('project_id')
            .in('project_id', projectIds),
          supabase
            .from('project_memberships')
            .select('project_id')
            .in('project_id', projectIds)
        ]);

        const taskCounts = (tasksCountResult.data || []).reduce((acc, task) => {
          acc[task.project_id] = (acc[task.project_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const memberCounts = (membersCountResult.data || []).reduce((acc, member) => {
          acc[member.project_id] = (acc[member.project_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const projectsWithCounts = (data || []).map(project => ({
          ...project,
          task_count: taskCounts[project.id] || 0,
          member_count: memberCounts[project.id] || 0
        }));

        setProjects(projectsWithCounts);
      } else {
        setProjects(data || []);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Real-time subscription for projects
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('projects_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'projects'
        },
        (payload) => {
          console.log('Project change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newProject = payload.new as Project;
            setProjects(prev => [{ ...newProject, task_count: 0, member_count: 0 }, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedProject = payload.new as Project;
            setProjects(prev => prev.map(project => 
              project.id === updatedProject.id 
                ? { ...updatedProject, task_count: project.task_count, member_count: project.member_count }
                : project
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedProject = payload.old as Project;
            setProjects(prev => prev.filter(project => project.id !== deletedProject.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const createProject = useCallback(async (projectData: { 
    name: string; 
    description?: string; 
    visibility?: 'private' | 'internal' | 'public';
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a project');
      return null;
    }

    try {
      console.log('Creating project with user:', user.id);
      
      // Get user's organization
      const { data: membership } = await supabase
        .from('organization_memberships')
        .select('organization_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      if (!membership) {
        throw new Error('User is not a member of any organization');
      }

      const { data: newProject, error } = await supabase
        .from('projects')
        .insert({
          name: projectData.name,
          description: projectData.description,
          visibility: projectData.visibility || 'private',
          organization_id: membership.organization_id,
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add user as project admin
      await supabase
        .from('project_memberships')
        .insert({
          project_id: newProject.id,
          user_id: user.id,
          role: 'admin'
        });

      toast.success('Project created successfully');
      return newProject as Project;
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Failed to create project');
      throw error;
    }
  }, [user]);

  const updateProject = useCallback(async (projectId: string, updates: any) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Project updated successfully');
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Failed to update project');
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectId);

      if (error) throw error;

      toast.success('Project deleted successfully');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Failed to delete project');
    }
  }, []);

  // Memoized projects for performance
  const memoizedProjects = useMemo(() => projects, [projects]);

  return {
    projects: memoizedProjects,
    loading,
    createProject,
    updateProject,
    deleteProject,
    refetch: fetchProjects
  };
}