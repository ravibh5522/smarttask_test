import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamActivity {
  id: string;
  activity_type: string;
  activity_data?: any;
  user_name?: string;
  created_at: string;
}

export function useTeamActivity(projectId?: string, limit: number = 10) {
  const [activities, setActivities] = useState<TeamActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivities = async () => {
    if (!projectId) {
      // If no specific project, fetch general team activities
      try {
        // Simplified query for now
        const { data, error } = await supabase
          .from('task_activities')
          .select('id, activity_type, activity_data, created_at, user_id')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        setActivities((data || []).map(item => ({
          id: item.id,
          activity_type: item.activity_type,
          activity_data: item.activity_data,
          user_name: 'Team Member',
          created_at: item.created_at
        })));
      } catch (error) {
        console.error('Error fetching team activities:', error);
        setActivities([]);
      }
    } else {
      // Fetch activities for a specific project
      try {
        const { data: taskData, error: taskError } = await supabase
          .from('tasks')
          .select('id')
          .eq('project_id', projectId);

        if (taskError) throw taskError;

        if (!taskData || taskData.length === 0) {
          setActivities([]);
          setLoading(false);
          return;
        }

        const taskIds = taskData.map(task => task.id);

        const { data, error } = await supabase
          .from('task_activities')
          .select('id, activity_type, activity_data, created_at, user_id')
          .in('task_id', taskIds)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) throw error;

        setActivities((data || []).map(item => ({
          id: item.id,
          activity_type: item.activity_type,
          activity_data: item.activity_data,
          user_name: 'Team Member',
          created_at: item.created_at
        })));
      } catch (error) {
        console.error('Error fetching project activities:', error);
        setActivities([]);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchActivities();
  }, [projectId, limit]);

  return {
    activities,
    loading,
    refetch: fetchActivities
  };
}