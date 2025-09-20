import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Activity,
  Plus,
  Edit,
  Trash2,
  Users,
  FileText,
  Calendar,
  MessageSquare,
  CheckCircle2,
  Clock,
  Upload
} from "lucide-react";
import { format, isToday, isYesterday, differenceInDays } from "date-fns";

interface ProjectActivityProps {
  projectId: string;
}

// Mock data for demonstration
const mockActivities = [
  {
    id: '1',
    activity_type: 'task_created',
    user_name: 'John Doe',
    description: 'Created task "Implement user authentication"',
    created_at: new Date().toISOString(),
    activity_data: { task_title: 'Implement user authentication' }
  },
  {
    id: '2',
    activity_type: 'task_completed',
    user_name: 'Jane Smith',
    description: 'Completed task "Design login page"',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    activity_data: { task_title: 'Design login page' }
  },
  {
    id: '3',
    activity_type: 'member_added',
    user_name: 'Mike Johnson',
    description: 'Added Sarah Wilson to the project',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    activity_data: { member_name: 'Sarah Wilson' }
  },
  {
    id: '4',
    activity_type: 'file_uploaded',
    user_name: 'Sarah Wilson',
    description: 'Uploaded file "Project Requirements.pdf"',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    activity_data: { file_name: 'Project Requirements.pdf' }
  },
  {
    id: '5',
    activity_type: 'comment_added',
    user_name: 'John Doe',
    description: 'Added a comment on "API Integration" task',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    activity_data: { task_title: 'API Integration' }
  }
];

export function ProjectActivity({ projectId }: ProjectActivityProps) {
  const activities = mockActivities;

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'task_created':
        return <Plus className="w-4 h-4 text-success" />;
      case 'task_completed':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'task_updated':
        return <Edit className="w-4 h-4 text-primary" />;
      case 'task_deleted':
        return <Trash2 className="w-4 h-4 text-destructive" />;
      case 'member_added':
        return <Users className="w-4 h-4 text-primary" />;
      case 'file_uploaded':
        return <Upload className="w-4 h-4 text-blue-500" />;
      case 'comment_added':
        return <MessageSquare className="w-4 h-4 text-purple-500" />;
      case 'milestone_completed':
        return <Calendar className="w-4 h-4 text-success" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getActivityColor = (activityType: string) => {
    switch (activityType) {
      case 'task_created':
      case 'task_completed':
      case 'milestone_completed':
        return 'bg-success/10 border-success/20';
      case 'task_updated':
      case 'member_added':
        return 'bg-primary/10 border-primary/20';
      case 'task_deleted':
        return 'bg-destructive/10 border-destructive/20';
      case 'file_uploaded':
        return 'bg-blue-500/10 border-blue-500/20';
      case 'comment_added':
        return 'bg-purple-500/10 border-purple-500/20';
      default:
        return 'bg-muted/10 border-muted/20';
    }
  };

  const formatActivityTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (differenceInDays(new Date(), date) <= 7) {
      return format(date, 'EEEE');
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  // Group activities by date
  const groupedActivities = activities.reduce((groups, activity) => {
    const date = new Date(activity.created_at);
    let dateKey;
    
    if (isToday(date)) {
      dateKey = 'Today';
    } else if (isYesterday(date)) {
      dateKey = 'Yesterday';
    } else if (differenceInDays(new Date(), date) <= 7) {
      dateKey = format(date, 'EEEE');
    } else {
      dateKey = format(date, 'MMM d, yyyy');
    }

    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(activity);
    return groups;
  }, {} as Record<string, typeof activities>);

  return (
    <div className="space-y-6">
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(groupedActivities).map(([dateGroup, groupActivities]) => (
            <div key={dateGroup} className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-px bg-border flex-1" />
                <Badge variant="outline" className="glass-badge border-0 bg-white/5">
                  {dateGroup}
                </Badge>
                <div className="h-px bg-border flex-1" />
              </div>

              <div className="space-y-3">
                {groupActivities.map((activity) => {
                  const activityDate = new Date(activity.created_at);
                  
                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-4 p-4 rounded-lg border ${getActivityColor(activity.activity_type)}`}
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 border border-white/20 flex-shrink-0">
                        {getActivityIcon(activity.activity_type)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              {activity.user_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{activity.user_name}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatActivityTime(activityDate)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No activity yet</h3>
              <p className="text-muted-foreground">
                Start working on your project to see activity here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Filters */}
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <CardTitle>Activity Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 glass-morphism-card rounded-lg border-0">
              <div className="w-8 h-8 bg-success rounded-full mx-auto mb-2 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-success">
                {activities.filter(a => a.activity_type.includes('completed')).length}
              </p>
              <p className="text-xs text-muted-foreground">Completions</p>
            </div>

            <div className="text-center p-4 glass-morphism-card rounded-lg border-0">
              <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-primary">
                {activities.filter(a => a.activity_type.includes('created')).length}
              </p>
              <p className="text-xs text-muted-foreground">Created</p>
            </div>

            <div className="text-center p-4 glass-morphism-card rounded-lg border-0">
              <div className="w-8 h-8 bg-blue-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <Upload className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-blue-500">
                {activities.filter(a => a.activity_type === 'file_uploaded').length}
              </p>
              <p className="text-xs text-muted-foreground">Uploads</p>
            </div>

            <div className="text-center p-4 glass-morphism-card rounded-lg border-0">
              <div className="w-8 h-8 bg-purple-500 rounded-full mx-auto mb-2 flex items-center justify-center">
                <MessageSquare className="w-4 h-4 text-white" />
              </div>
              <p className="text-2xl font-bold text-purple-500">
                {activities.filter(a => a.activity_type === 'comment_added').length}
              </p>
              <p className="text-xs text-muted-foreground">Comments</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}