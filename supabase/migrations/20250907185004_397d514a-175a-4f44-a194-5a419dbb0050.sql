-- Phase 5: Advanced Project Management & Collaboration Database Schema

-- Time Tracking
CREATE TABLE public.time_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  task_id UUID NOT NULL,
  project_id UUID NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  duration_minutes INTEGER,
  description TEXT,
  billable BOOLEAN NOT NULL DEFAULT false,
  hourly_rate DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project Templates
CREATE TABLE public.project_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_by UUID NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Project Milestones
CREATE TABLE public.project_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'planned',
  position INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Resource Allocations
CREATE TABLE public.resource_allocations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  user_id UUID NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  allocation_percentage INTEGER NOT NULL DEFAULT 100,
  hourly_rate DECIMAL(10,2),
  role TEXT,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Document Storage
CREATE TABLE public.project_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL,
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  is_current_version BOOLEAN NOT NULL DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Custom Reports
CREATE TABLE public.custom_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  report_type TEXT NOT NULL,
  configuration JSONB NOT NULL DEFAULT '{}',
  organization_id UUID NOT NULL,
  created_by UUID NOT NULL,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  scheduled BOOLEAN NOT NULL DEFAULT false,
  schedule_config JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resource_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_reports ENABLE ROW LEVEL SECURITY;

-- Time Entries Policies
CREATE POLICY "Users can view their own time entries" ON public.time_entries
  FOR SELECT USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = time_entries.project_id AND pm.user_id = auth.uid()));

CREATE POLICY "Users can create their own time entries" ON public.time_entries
  FOR INSERT WITH CHECK (user_id = auth.uid() AND 
    EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = time_entries.project_id AND pm.user_id = auth.uid()));

CREATE POLICY "Users can update their own time entries" ON public.time_entries
  FOR UPDATE USING (user_id = auth.uid());

-- Project Templates Policies
CREATE POLICY "Anyone can view public templates" ON public.project_templates
  FOR SELECT USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create templates" ON public.project_templates
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their own templates" ON public.project_templates
  FOR UPDATE USING (created_by = auth.uid());

-- Project Milestones Policies
CREATE POLICY "Project members can view milestones" ON public.project_milestones
  FOR SELECT USING (EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()));

CREATE POLICY "Project members can create milestones" ON public.project_milestones
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Project members can update milestones" ON public.project_milestones
  FOR UPDATE USING (EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = project_milestones.project_id AND pm.user_id = auth.uid()));

-- Resource Allocations Policies
CREATE POLICY "Project members can view allocations" ON public.resource_allocations
  FOR SELECT USING (user_id = auth.uid() OR 
    EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = resource_allocations.project_id AND pm.user_id = auth.uid()));

CREATE POLICY "Project admins can manage allocations" ON public.resource_allocations
  FOR ALL USING (EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = resource_allocations.project_id AND pm.user_id = auth.uid() AND pm.role IN ('admin', 'owner')));

-- Project Documents Policies
CREATE POLICY "Project members can view documents" ON public.project_documents
  FOR SELECT USING (EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = project_documents.project_id AND pm.user_id = auth.uid()));

CREATE POLICY "Project members can upload documents" ON public.project_documents
  FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM project_memberships pm WHERE pm.project_id = project_documents.project_id AND pm.user_id = auth.uid()) AND uploaded_by = auth.uid());

-- Custom Reports Policies
CREATE POLICY "Organization members can view reports" ON public.custom_reports
  FOR SELECT USING (EXISTS (SELECT 1 FROM organization_memberships om WHERE om.organization_id = custom_reports.organization_id AND om.user_id = auth.uid()));

CREATE POLICY "Users can create reports" ON public.custom_reports
  FOR INSERT WITH CHECK (created_by = auth.uid() AND EXISTS (SELECT 1 FROM organization_memberships om WHERE om.organization_id = custom_reports.organization_id AND om.user_id = auth.uid()));

CREATE POLICY "Report creators can update reports" ON public.custom_reports
  FOR UPDATE USING (created_by = auth.uid());

-- Create triggers for updated_at
CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_templates_updated_at BEFORE UPDATE ON public.project_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_milestones_updated_at BEFORE UPDATE ON public.project_milestones FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_resource_allocations_updated_at BEFORE UPDATE ON public.resource_allocations FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_project_documents_updated_at BEFORE UPDATE ON public.project_documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_custom_reports_updated_at BEFORE UPDATE ON public.custom_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for performance
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_project_id ON public.time_entries(project_id);
CREATE INDEX idx_time_entries_task_id ON public.time_entries(task_id);
CREATE INDEX idx_time_entries_start_time ON public.time_entries(start_time);
CREATE INDEX idx_project_templates_category ON public.project_templates(category);
CREATE INDEX idx_project_milestones_project_id ON public.project_milestones(project_id);
CREATE INDEX idx_resource_allocations_project_id ON public.resource_allocations(project_id);
CREATE INDEX idx_resource_allocations_user_id ON public.resource_allocations(user_id);
CREATE INDEX idx_project_documents_project_id ON public.project_documents(project_id);