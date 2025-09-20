import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: 'draft' | 'open' | 'in_progress' | 'in_review' | 'completed' | 'archived' | 'blocked' | 'rejected' | 'on_hold';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id: string;
  assignee_id?: string | null;
  created_by: string;
  due_date?: string | null;
  start_date?: string | null;
  completed_date?: string | null;
  created_at: string;
  updated_at: string;
  tags?: string[];
  estimated_hours?: number | null;
  actual_hours?: number | null;
  parent_task_id?: string | null;
  position?: number | null;
  category?: string | null;
  metadata?: any | null;
  subtask_count?: number;
}

export function useTasks(projectId?: string | null) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Get subtask counts for parent tasks
      const parentTaskIds = (data || [])
        .filter(task => !task.parent_task_id)
        .map(task => task.id);

      if (parentTaskIds.length > 0) {
        const { data: subtaskCounts } = await supabase
          .from('tasks')
          .select('parent_task_id')
          .in('parent_task_id', parentTaskIds);

        const counts = (subtaskCounts || []).reduce((acc, subtask) => {
          if (subtask.parent_task_id) {
            acc[subtask.parent_task_id] = (acc[subtask.parent_task_id] || 0) + 1;
          }
          return acc;
        }, {} as Record<string, number>);

        const tasksWithSubtaskCounts = (data || []).map(task => ({
          ...task,
          subtask_count: task.parent_task_id ? 0 : (counts[task.id] || 0)
        }));

        setTasks(tasksWithSubtaskCounts);
      } else {
        setTasks((data || []).map(task => ({ ...task, subtask_count: 0 })));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [user, projectId]);

  // Real-time subscription for tasks
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('tasks_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tasks'
        },
        (payload) => {
          console.log('Task change detected:', payload);
          
          if (payload.eventType === 'INSERT') {
            const newTask = payload.new as Task;
            // Only add if it matches current project filter
            if (!projectId || newTask.project_id === projectId) {
              setTasks(prev => [{ ...newTask, subtask_count: 0 }, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            const updatedTask = payload.new as Task;
            setTasks(prev => prev.map(task => 
              task.id === updatedTask.id 
                ? { ...updatedTask, subtask_count: task.subtask_count }
                : task
            ));
          } else if (payload.eventType === 'DELETE') {
            const deletedTask = payload.old as Task;
            setTasks(prev => prev.filter(task => task.id !== deletedTask.id));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, projectId]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = useCallback(async (taskData: {
    title: string;
    description?: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    project_id: string;
    parent_task_id?: string | null;
    due_date?: string | null;
    tags?: string[];
  }) => {
    if (!user) {
      toast.error('You must be logged in to create a task');
      return null;
    }

    try {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority || 'medium',
          status: 'open',
          project_id: taskData.project_id,
          parent_task_id: taskData.parent_task_id,
          created_by: user.id,
          due_date: taskData.due_date,
          tags: taskData.tags || []
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Task created successfully');
      return newTask as Task;
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Failed to create task');
      throw error;
    }
  }, [user]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task');
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      toast.success('Task deleted successfully');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Failed to delete task');
    }
  }, []);

  // Memoized filtered tasks for performance
  const memoizedTasks = useMemo(() => tasks, [tasks]);

  const mainTasks = useMemo(() => 
    memoizedTasks.filter(task => !task.parent_task_id), 
    [memoizedTasks]
  );

  const getSubtasks = useCallback((parentTaskId: string) => 
    memoizedTasks.filter(task => task.parent_task_id === parentTaskId),
    [memoizedTasks]
  );

  return {
    tasks: memoizedTasks,
    mainTasks,
    getSubtasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refetch: fetchTasks
  };
}
