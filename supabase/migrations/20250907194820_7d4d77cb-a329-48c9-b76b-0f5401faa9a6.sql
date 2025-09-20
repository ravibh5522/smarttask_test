-- Fix security linter warnings

-- Fix search_path for the update_project_completion function
DROP FUNCTION IF EXISTS public.update_project_completion();

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