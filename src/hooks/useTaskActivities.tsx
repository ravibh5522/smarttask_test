import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  activity_type: string; // 'created', 'updated', 'commented', 'assigned', 'status_changed', etc.
  activity_data: any;
  created_at: string;
  user_profile?: {
    full_name?: string;
    email?: string;
  };
}

export function useTaskActivities(taskId?: string) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!user || !taskId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('task_activities')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch profile data separately to avoid relation issues
      const userIds = data?.map(a => a.user_id) || [];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      // Combine the data
      const activitiesWithProfiles = data?.map(activity => ({
        ...activity,
        user_profile: profiles?.find(p => p.id === activity.user_id)
      })) || [];

      setActivities(activitiesWithProfiles as any);
    } catch (error) {
      console.error('Error fetching task activities:', error);
      toast.error('Failed to load activity feed');
    } finally {
      setLoading(false);
    }
  };

  const logActivity = async (activityType: string, activityData: any = {}) => {
    if (!user || !taskId) return;

    try {
      const { error } = await supabase
        .from('task_activities')
        .insert({
          task_id: taskId,
          user_id: user.id,
          activity_type: activityType,
          activity_data: activityData
        });

      if (error) throw error;
      await fetchActivities();
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  };

  useEffect(() => {
    fetchActivities();

    // Set up real-time subscription for activities
    if (taskId) {
      const channel = supabase
        .channel(`task-activities-${taskId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'task_activities',
            filter: `task_id=eq.${taskId}`
          },
          () => {
            fetchActivities();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user, taskId]);

  return {
    activities,
    loading,
    logActivity,
    refetch: fetchActivities
  };
}