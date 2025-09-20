import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  template_data: any;
  is_public: boolean;
  created_by: string;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export const useProjectTemplates = () => {
  const [templates, setTemplates] = useState<ProjectTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('project_templates')
        .select('*')
        .order('usage_count', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to fetch project templates",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createTemplate = async (templateData: {
    name: string;
    description?: string;
    category: string;
    template_data: any;
    is_public?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('project_templates')
        .insert({
          ...templateData,
          created_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      await fetchTemplates();
      toast({
        title: "Success",
        description: "Project template created successfully",
      });

      return data;
    } catch (error) {
      console.error('Error creating template:', error);
      toast({
        title: "Error",
        description: "Failed to create project template",
        variant: "destructive",
      });
    }
  };

  const updateTemplate = async (templateId: string, updates: Partial<ProjectTemplate>) => {
    try {
      const { error } = await supabase
        .from('project_templates')
        .update(updates)
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
      toast({
        title: "Success",
        description: "Template updated successfully",
      });
    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: "Error",
        description: "Failed to update template",
        variant: "destructive",
      });
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('project_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await fetchTemplates();
      toast({
        title: "Success",
        description: "Template deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive",
      });
    }
  };

  const incrementUsageCount = async (templateId: string) => {
    try {
      // First get current usage count
      const { data: template, error: fetchError } = await supabase
        .from('project_templates')
        .select('usage_count')
        .eq('id', templateId)
        .single();

      if (fetchError) throw fetchError;

      // Then update with incremented value
      const { error: updateError } = await supabase
        .from('project_templates')
        .update({ usage_count: (template.usage_count || 0) + 1 })
        .eq('id', templateId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error incrementing usage count:', error);
    }
  };

  const getTemplatesByCategory = (category: string) => {
    return templates.filter(template => template.category === category);
  };

  const getPopularTemplates = (limit = 5) => {
    return templates
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, limit);
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    loading,
    createTemplate,
    updateTemplate,
    deleteTemplate,
    incrementUsageCount,
    getTemplatesByCategory,
    getPopularTemplates,
    fetchTemplates,
  };
};