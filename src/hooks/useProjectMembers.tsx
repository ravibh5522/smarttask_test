import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface ProjectMember {
  id: string;
  user_id: string;
  project_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member' | 'guest';
  created_at: string;
  user_profile?: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  };
}

export function useProjectMembers(projectId?: string) {
  const { user } = useAuth();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!user || !projectId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('project_memberships')
        .select(`
          *
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profile data separately to avoid relation issues
      const userIds = data?.map(m => m.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', userIds);

      // Combine the data
      const membersWithProfiles = data?.map(member => ({
        ...member,
        user_profile: profiles?.find(p => p.id === member.user_id)
      })) || [];

      setMembers(membersWithProfiles as any);
    } catch (error) {
      console.error('Error fetching project members:', error);
      toast.error('Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const assignTaskToMember = async (taskId: string, userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          assignee_id: userId,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Add activity log
      await supabase
        .from('task_activities')
        .insert({
          task_id: taskId,
          user_id: user.id,
          activity_type: 'assigned',
          activity_data: { assignee_id: userId }
        });

      toast.success('Task assigned successfully');
    } catch (error) {
      console.error('Error assigning task:', error);
      toast.error('Failed to assign task');
    }
  };

  const unassignTask = async (taskId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          assignee_id: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;

      // Add activity log
      await supabase
        .from('task_activities')
        .insert({
          task_id: taskId,
          user_id: user.id,
          activity_type: 'unassigned',
          activity_data: {}
        });

      toast.success('Task unassigned successfully');
    } catch (error) {
      console.error('Error unassigning task:', error);
      toast.error('Failed to unassign task');
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [user, projectId]);

  return {
    members,
    loading,
    assignTaskToMember,
    unassignTask,
    refetch: fetchMembers
  };
}