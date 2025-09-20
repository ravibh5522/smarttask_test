import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useTeamActivity } from "@/hooks/useTeamActivity";
import { 
  Users, 
  MessageSquare, 
  CheckCircle, 
  UserPlus, 
  Calendar,
  Clock,
  GitCommit
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TeamActivityFeedProps {
  projectId?: string;
  limit?: number;
}

export function TeamActivityFeed({ projectId, limit = 10 }: TeamActivityFeedProps) {
  const { activities, loading } = useTeamActivity(projectId, limit);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "task_completed": return <CheckCircle className="w-4 h-4 text-success" />;
      case "task_assigned": return <Users className="w-4 h-4 text-primary" />;
      case "comment_added": return <MessageSquare className="w-4 h-4 text-info" />;
      case "member_joined": return <UserPlus className="w-4 h-4 text-success" />;
      case "project_updated": return <GitCommit className="w-4 h-4 text-warning" />;
      default: return <GitCommit className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case "task_completed": return "text-success";
      case "task_assigned": return "text-primary";
      case "comment_added": return "text-info";
      case "member_joined": return "text-success";
      case "project_updated": return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getActivityDescription = (activity: any) => {
    switch (activity.activity_type) {
      case "task_completed":
        return `completed task "${activity.metadata?.task_title || 'Unknown Task'}"`;
      case "task_assigned":
        return `was assigned to "${activity.metadata?.task_title || 'Unknown Task'}"`;
      case "comment_added":
        return `commented on "${activity.metadata?.task_title || 'Unknown Task'}"`;
      case "member_joined":
        return `joined the project`;
      case "project_updated":
        return `updated project settings`;
      default:
        return activity.description || "performed an action";
    }
  };

  return (
      <Card className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10 hover:shadow-glow transition-smooth">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-primary-readable font-semibold">Team Activity</span>
          </CardTitle>
        </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {activities.map((activity, index) => (
              <div key={activity.id || index} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 glass-morphism-card light:bg-white/80 light:border light:border-primary/10 rounded-lg border-0 hover:shadow-glow light:hover:bg-white/95 transition-smooth">
                <Avatar className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0">
                  <AvatarFallback className="bg-gradient-primary text-white text-xs">
                    {getInitials(activity.user_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    <div className="flex-shrink-0">
                      {getActivityIcon(activity.activity_type)}
                    </div>
                    <p className="text-xs sm:text-sm">
                      <span className="font-medium">{activity.user_name || "Unknown User"}</span>
                      <span className="text-muted-foreground ml-1">
                        {getActivityDescription(activity)}
                      </span>
                    </p>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 flex-shrink-0" />
                      <span>
                        {activity.created_at 
                          ? formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })
                          : "Just now"
                        }
                      </span>
                    </div>
                    {activity.activity_type && (
                      <Badge variant="outline" className="text-xs glass-badge flex-shrink-0">
                        {activity.activity_type.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 sm:w-12 sm:h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-medium mb-2">No recent activity</h3>
            <p className="text-xs text-muted-foreground">
              Team activity will appear here when members start collaborating.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}