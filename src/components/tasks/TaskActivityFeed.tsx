import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Activity,
  MessageCircle, 
  User, 
  CheckCircle, 
  Clock, 
  FileText,
  UserPlus,
  UserMinus,
  Edit
} from "lucide-react";
import { useTaskActivities } from "@/hooks/useTaskActivities";
import { format } from "date-fns";

interface TaskActivityFeedProps {
  taskId: string;
}

export function TaskActivityFeed({ taskId }: TaskActivityFeedProps) {
  const { activities, loading } = useTaskActivities(taskId);

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'created':
        return <FileText className="w-4 h-4 text-primary" />;
      case 'commented':
        return <MessageCircle className="w-4 h-4 text-blue-500" />;
      case 'assigned':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'unassigned':
        return <UserMinus className="w-4 h-4 text-orange-500" />;
      case 'status_changed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'updated':
        return <Edit className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityDescription = (activity: any) => {
    const userName = activity.user_profile?.full_name || activity.user_profile?.email || 'Someone';
    
    switch (activity.activity_type) {
      case 'created':
        return `${userName} created this task`;
      case 'commented':
        const comment = activity.activity_data?.content;
        return `${userName} commented: "${comment ? comment.substring(0, 50) + (comment.length > 50 ? '...' : '') : 'No content'}"`;
      case 'assigned':
        return `${userName} assigned this task`;
      case 'unassigned':
        return `${userName} removed the assignment`;
      case 'status_changed':
        const newStatus = activity.activity_data?.new_status;
        const oldStatus = activity.activity_data?.old_status;
        return `${userName} changed status from ${oldStatus || 'unknown'} to ${newStatus || 'unknown'}`;
      case 'updated':
        return `${userName} updated this task`;
      default:
        return `${userName} performed an action`;
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-3 bg-muted rounded w-3/4 mb-1"></div>
                    <div className="h-2 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Activity ({activities.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="flex-shrink-0">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(activity.user_profile?.full_name, activity.user_profile?.email)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        {getActivityDescription(activity)}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(activity.created_at), 'MMM d, h:mm a')}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.activity_type.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}