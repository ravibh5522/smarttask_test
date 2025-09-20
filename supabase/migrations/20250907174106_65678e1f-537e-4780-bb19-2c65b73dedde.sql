-- Add welcome data for existing and new users
DO $$
DECLARE
    user_record RECORD;
    demo_org_id UUID;
    welcome_project_id UUID;
BEGIN
    -- Get or create demo organization
    SELECT id INTO demo_org_id FROM public.organizations WHERE slug = 'demo-org';
    
    -- For each existing user without organization membership, add them to demo org
    FOR user_record IN 
        SELECT p.id, p.email, p.full_name 
        FROM public.profiles p
        LEFT JOIN public.organization_memberships om ON p.id = om.user_id
        WHERE om.user_id IS NULL
    LOOP
        -- Add user to demo organization
        INSERT INTO public.organization_memberships (organization_id, user_id, role, joined_at)
        VALUES (demo_org_id, user_record.id, 'member', NOW())
        ON CONFLICT (organization_id, user_id) DO NOTHING;

        -- Check if user has any projects
        IF NOT EXISTS (SELECT 1 FROM public.projects WHERE created_by = user_record.id) THEN
            -- Create a welcome project
            INSERT INTO public.projects (name, description, organization_id, created_by, visibility)
            VALUES (
                'Welcome to TaskFlow AI',
                'Your first project - start organizing your tasks here!',
                demo_org_id,
                user_record.id,
                'private'
            )
            RETURNING id INTO welcome_project_id;

            -- Add user as project admin
            INSERT INTO public.project_memberships (project_id, user_id, role)
            VALUES (welcome_project_id, user_record.id, 'admin')
            ON CONFLICT (project_id, user_id) DO NOTHING;

            -- Create some sample tasks
            INSERT INTO public.tasks (title, description, status, priority, project_id, created_by)
            VALUES 
                (
                    'Welcome to TaskFlow AI!',
                    'This is your first task. Click the checkbox to mark it as complete.',
                    'open',
                    'medium',
                    welcome_project_id,
                    user_record.id
                ),
                (
                    'Create your first project',
                    'Try creating a new project using the "+ New Project" button.',
                    'open',
                    'low',
                    welcome_project_id,
                    user_record.id
                ),
                (
                    'Explore Focus Mode',
                    'Check out Focus Mode for distraction-free work sessions with Pomodoro timer.',
                    'open',
                    'low',
                    welcome_project_id,
                    user_record.id
                );
        END IF;
    END LOOP;
END $$;