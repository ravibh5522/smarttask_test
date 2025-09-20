import { useState, useEffect } from "react";
import { Clock, User, MessageSquare, Edit, UserPlus, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface TaskActivity {
  id: string;
  task_id: string;
  user_id: string;
  activity_type: string;
  activity_data: any;
  created_at: string;
  user_profile?: {
    full_name?: string;
    email?: string;
  };
}

interface TaskActivitiesProps {
  taskId: string;
}

export function TaskActivities({ taskId }: TaskActivitiesProps) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<TaskActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [taskId]);

  const fetchActivities = async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('task_activities')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user profiles for activities
      const userIds = [...new Set(data?.map(a => a.user_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', userIds);

      const activitiesWithProfiles = data?.map(activity => ({
        ...activity,
        user_profile: profiles?.find(p => p.id === activity.user_id)
      })) || [];

      setActivities(activitiesWithProfiles);
    } catch (error) {
      console.error('Error fetching task activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'created': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'updated': return <Edit className="w-4 h-4 text-blue-500" />;
      case 'assigned': return <UserPlus className="w-4 h-4 text-purple-500" />;
      case 'unassigned': return <User className="w-4 h-4 text-gray-500" />;
      case 'status_changed': return <CheckCircle className="w-4 h-4 text-orange-500" />;
      case 'commented': return <MessageSquare className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityDescription = (activity: TaskActivity) => {
    const userName = activity.user_profile?.full_name || activity.user_profile?.email || 'Someone';
    
    switch (activity.activity_type) {
      case 'created':
        return `${userName} created the task`;
      case 'updated':
        return `${userName} updated the task`;
      case 'assigned':
        return `${userName} assigned the task`;
      case 'unassigned':
        return `${userName} unassigned the task`;
      case 'status_changed':
        return `${userName} changed status from ${activity.activity_data?.old_status || 'unknown'} to ${activity.activity_data?.new_status || 'unknown'}`;
      case 'commented':
        return `${userName} added a comment`;
      default:
        return `${userName} performed an action`;
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="glass-morphism-card border-0 bg-white/5">
            <CardContent className="p-3">
              <div className="animate-pulse flex items-center gap-3">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
        <p className="text-sm">No activity yet</p>
      </div>
    );
  }

  return (
    <ScrollArea className="max-h-64">
      <div className="space-y-2">
        {activities.map((activity) => (
          <Card key={activity.id} className="glass-morphism-card border-0 bg-white/5">
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    {getActivityDescription(activity)}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {activity.activity_type.replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(activity.created_at)}
                    </span>
                  </div>
                </div>
                <Avatar className="w-6 h-6">
                  <AvatarFallback className="text-xs">
                    {activity.user_profile?.full_name?.[0] || activity.user_profile?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
}
