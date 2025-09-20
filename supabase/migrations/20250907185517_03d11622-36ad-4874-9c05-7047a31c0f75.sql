-- Create increment_template_usage function
CREATE OR REPLACE FUNCTION public.increment_template_usage(template_id uuid)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  UPDATE public.project_templates 
  SET usage_count = usage_count + 1 
  WHERE id = template_id;
$$;