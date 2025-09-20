import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TeamMember {
  user_id: string;
  role: 'owner' | 'admin' | 'moderator' | 'member' | 'guest';
  created_at: string;
  user_profile?: {
    id: string;
    email?: string;
    full_name?: string;
  };
}

export function useTeamMembers(projectId?: string) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = async () => {
    if (!projectId) {
      setMembers([]);
      setLoading(false);
      return;
    }

    try {
      // Simplified query without relations for now
      const { data, error } = await supabase
        .from('project_memberships')
        .select('user_id, role, created_at')
        .eq('project_id', projectId);

      if (error) throw error;

      setMembers((data || []).map(item => ({
        ...item,
        user_profile: {
          id: item.user_id,
          full_name: 'Team Member',
          email: 'member@example.com'
        }
      })));
    } catch (error) {
      console.error('Error fetching team members:', error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  return {
    members,
    loading,
    refetch: fetchMembers
  };
}