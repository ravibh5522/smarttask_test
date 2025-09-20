-- Update the user signup trigger to auto-add users to demo org
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    demo_org_id UUID;
BEGIN
    -- Insert user profile
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );

    -- Get or create demo organization
    SELECT id INTO demo_org_id FROM public.organizations WHERE slug = 'demo-org';
    
    IF demo_org_id IS NULL THEN
        INSERT INTO public.organizations (name, slug, description)
        VALUES ('Demo Organization', 'demo-org', 'A sample organization for new users')
        RETURNING id INTO demo_org_id;
    END IF;

    -- Add user to demo organization
    INSERT INTO public.organization_memberships (organization_id, user_id, role, joined_at)
    VALUES (demo_org_id, NEW.id, 'member', NOW())
    ON CONFLICT (organization_id, user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;