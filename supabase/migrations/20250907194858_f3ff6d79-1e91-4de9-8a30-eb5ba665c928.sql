-- Fix security linter warnings - properly drop and recreate function with trigger

-- First drop the trigger
DROP TRIGGER IF EXISTS update_project_completion_trigger ON public.tasks;

-- Then drop the function
DROP FUNCTION IF EXISTS public.update_project_completion();

-- Recreate the function with proper security settings
CREATE OR REPLACE FUNCTION public.update_project_completion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Update the project's completion percentage based on completed tasks
    UPDATE public.projects 
    SET completion_percentage = (
        SELECT CASE 
            WHEN COUNT(*) = 0 THEN 0
            ELSE ROUND((COUNT(CASE WHEN status = 'completed' THEN 1 END) * 100.0) / COUNT(*))
        END
        FROM public.tasks 
        WHERE project_id = COALESCE(NEW.project_id, OLD.project_id)
    )
    WHERE id = COALESCE(NEW.project_id, OLD.project_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_project_completion_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_project_completion();