import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface TimeEntry {
  id: string;
  user_id: string;
  task_id: string;
  project_id: string;
  start_time: string;
  end_time: string | null;
  duration_minutes: number | null;
  description: string | null;
  billable: boolean;
  hourly_rate: number | null;
  created_at: string;
  updated_at: string;
}

export const useTimeTracking = (projectId?: string, taskId?: string) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTimeEntries = async () => {
    try {
      let query = supabase
        .from('time_entries')
        .select('*')
        .order('start_time', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }
      if (taskId) {
        query = query.eq('task_id', taskId);
      }

      const { data, error } = await query;
      if (error) throw error;

      setTimeEntries(data || []);
      
      // Check for active timer
      const active = data?.find(entry => !entry.end_time);
      setActiveTimer(active || null);
    } catch (error) {
      console.error('Error fetching time entries:', error);
      toast({
        title: "Error",
        description: "Failed to fetch time entries",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const startTimer = async (taskId: string, projectId: string, description?: string) => {
    try {
      // Stop any existing timer first
      if (activeTimer) {
        await stopTimer(activeTimer.id);
      }

      const { data, error } = await supabase
        .from('time_entries')
        .insert({
          task_id: taskId,
          project_id: projectId,
          start_time: new Date().toISOString(),
          description,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      setActiveTimer(data);
      await fetchTimeEntries();
      
      toast({
        title: "Timer Started",
        description: "Time tracking has begun for this task",
      });
    } catch (error) {
      console.error('Error starting timer:', error);
      toast({
        title: "Error",
        description: "Failed to start timer",
        variant: "destructive",
      });
    }
  };

  const stopTimer = async (entryId: string) => {
    try {
      const endTime = new Date().toISOString();
      const entry = timeEntries.find(e => e.id === entryId) || activeTimer;
      
      if (!entry) return;

      const startTime = new Date(entry.start_time);
      const duration = Math.round((new Date(endTime).getTime() - startTime.getTime()) / 60000);

      const { error } = await supabase
        .from('time_entries')
        .update({
          end_time: endTime,
          duration_minutes: duration,
        })
        .eq('id', entryId);

      if (error) throw error;

      setActiveTimer(null);
      await fetchTimeEntries();
      
      toast({
        title: "Timer Stopped",
        description: `Logged ${Math.floor(duration / 60)}h ${duration % 60}m`,
      });
    } catch (error) {
      console.error('Error stopping timer:', error);
      toast({
        title: "Error",
        description: "Failed to stop timer",
        variant: "destructive",
      });
    }
  };

  const updateTimeEntry = async (entryId: string, updates: Partial<TimeEntry>) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .update(updates)
        .eq('id', entryId);

      if (error) throw error;

      await fetchTimeEntries();
      
      toast({
        title: "Success",
        description: "Time entry updated",
      });
    } catch (error) {
      console.error('Error updating time entry:', error);
      toast({
        title: "Error",
        description: "Failed to update time entry",
        variant: "destructive",
      });
    }
  };

  const deleteTimeEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('time_entries')
        .delete()
        .eq('id', entryId);

      if (error) throw error;

      await fetchTimeEntries();
      
      toast({
        title: "Success",
        description: "Time entry deleted",
      });
    } catch (error) {
      console.error('Error deleting time entry:', error);
      toast({
        title: "Error",
        description: "Failed to delete time entry",
        variant: "destructive",
      });
    }
  };

  const getTotalHours = (entries: TimeEntry[] = timeEntries) => {
    return entries.reduce((total, entry) => {
      return total + (entry.duration_minutes || 0);
    }, 0) / 60;
  };

  const getBillableHours = (entries: TimeEntry[] = timeEntries) => {
    return entries
      .filter(entry => entry.billable)
      .reduce((total, entry) => {
        return total + (entry.duration_minutes || 0);
      }, 0) / 60;
  };

  useEffect(() => {
    fetchTimeEntries();
  }, [projectId, taskId]);

  return {
    timeEntries,
    activeTimer,
    loading,
    startTimer,
    stopTimer,
    updateTimeEntry,
    deleteTimeEntry,
    getTotalHours,
    getBillableHours,
    fetchTimeEntries,
  };
};