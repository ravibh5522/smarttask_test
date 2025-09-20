-- Fix security issues by setting proper search_path for functions

-- Update get_user_org_role function
CREATE OR REPLACE FUNCTION public.get_user_org_role(org_id UUID, user_id UUID)
RETURNS public.app_role AS $$
  SELECT role FROM public.organization_memberships 
  WHERE organization_id = org_id AND user_id = get_user_org_role.user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update get_user_project_role function  
CREATE OR REPLACE FUNCTION public.get_user_project_role(proj_id UUID, user_id UUID)
RETURNS public.app_role AS $$
  SELECT role FROM public.project_memberships 
  WHERE project_id = proj_id AND user_id = get_user_project_role.user_id;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;