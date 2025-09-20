import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProjectMilestone {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  status: string;
  position: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useProjectMilestones = (projectId: string) => {
  const [milestones, setMilestones] = useState<ProjectMilestone[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMilestones = async () => {
    if (!projectId) return;
    
    try {
      const { data, error } = await supabase
        .from('project_milestones')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (error) throw error;
      setMilestones(data || []);
    } catch (error) {
      console.error('Error fetching milestones:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project milestones",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createMilestone = async (milestoneData: {
    title: string;
    description?: string;
    due_date?: string;
    status?: string;
  }) => {
    try {
      const maxPosition = Math.max(...milestones.map(m => m.position), 0);
      
      const { data, error } = await supabase
        .from('project_milestones')
        .insert({
          ...milestoneData,
          project_id: projectId,
          position: maxPosition + 1,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchMilestones();
      toast({
        title: "Success",
        description: "Milestone created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to create milestone",
        variant: "destructive",
      });
    }
  };

  const updateMilestone = async (milestoneId: string, updates: Partial<ProjectMilestone>) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .update(updates)
        .eq('id', milestoneId);

      if (error) throw error;

      await fetchMilestones();
      toast({
        title: "Success",
        description: "Milestone updated successfully",
      });
    } catch (error) {
      console.error('Error updating milestone:', error);
      toast({
        title: "Error",
        description: "Failed to update milestone",
        variant: "destructive",
      });
    }
  };

  const completeMilestone = async (milestoneId: string) => {
    await updateMilestone(milestoneId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
    });
  };

  const deleteMilestone = async (milestoneId: string) => {
    try {
      const { error } = await supabase
        .from('project_milestones')
        .delete()
        .eq('id', milestoneId);

      if (error) throw error;

      await fetchMilestones();
      toast({
        title: "Success",
        description: "Milestone deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting milestone:', error);
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        variant: "destructive",
      });
    }
  };

  const reorderMilestones = async (reorderedMilestones: ProjectMilestone[]) => {
    try {
      const updates = reorderedMilestones.map((milestone, index) => ({
        id: milestone.id,
        position: index + 1,
      }));

      for (const update of updates) {
        await supabase
          .from('project_milestones')
          .update({ position: update.position })
          .eq('id', update.id);
      }

      await fetchMilestones();
    } catch (error) {
      console.error('Error reordering milestones:', error);
      toast({
        title: "Error",
        description: "Failed to reorder milestones",
        variant: "destructive",
      });
    }
  };

  const getCompletedMilestones = () => {
    return milestones.filter(m => m.status === 'completed');
  };

  const getUpcomingMilestones = () => {
    return milestones
      .filter(m => m.status !== 'completed' && m.due_date)
      .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime());
  };

  const getOverdueMilestones = () => {
    const now = new Date();
    return milestones.filter(m => 
      m.status !== 'completed' && 
      m.due_date && 
      new Date(m.due_date) < now
    );
  };

  const getProgressPercentage = () => {
    if (milestones.length === 0) return 0;
    const completed = getCompletedMilestones().length;
    return Math.round((completed / milestones.length) * 100);
  };

  useEffect(() => {
    fetchMilestones();
  }, [projectId]);

  return {
    milestones,
    loading,
    createMilestone,
    updateMilestone,
    completeMilestone,
    deleteMilestone,
    reorderMilestones,
    getCompletedMilestones,
    getUpcomingMilestones,
    getOverdueMilestones,
    getProgressPercentage,
    fetchMilestones,
  };
};