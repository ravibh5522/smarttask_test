import { useState, memo, useMemo, useCallback } from "react";
import { Eye, MessageSquare, Clock, User, Calendar, Tag, BarChart3, Settings, Edit } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Task } from "@/hooks/useTasks";
import { TaskAssignment } from "@/components/tasks/TaskAssignment";
import { TaskComments } from "@/components/tasks/TaskComments";
import { TaskActivities } from "@/components/tasks/TaskActivities";

interface Project {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

interface PreviewColumnProps {
  selectedProjectId?: string;
  selectedTaskId?: string;
  selectedSubtaskId?: string;
  projects: Project[];
  tasks: Task[];
}

export const PreviewColumn = memo(function PreviewColumn({
  selectedProjectId,
  selectedTaskId,
  selectedSubtaskId,
  projects,
  tasks
}: PreviewColumnProps) {
  const [activeTab, setActiveTab] = useState("details");

  const selectedProject = useMemo(() => 
    projects.find(p => p.id === selectedProjectId), 
    [projects, selectedProjectId]
  );
  
  const selectedTask = useMemo(() => 
    tasks.find(t => t.id === selectedTaskId), 
    [tasks, selectedTaskId]
  );
  
  const selectedSubtask = useMemo(() => 
    tasks.find(t => t.id === selectedSubtaskId), 
    [tasks, selectedSubtaskId]
  );

  const currentItem = selectedSubtask || selectedTask || selectedProject;
  const itemType = selectedSubtask ? 'subtask' : selectedTask ? 'task' : selectedProject ? 'project' : null;

  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
  }, []);

  const getPriorityColor = useCallback((priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-muted';
    }
  }, []);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300';
      case 'blocked': return 'bg-red-500/20 text-red-300';
      case 'in_review': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-muted';
    }
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!currentItem) {
    return (
      <Card className="glass-morphism-card border-0 h-full">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5" />
            Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Eye className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nothing Selected</p>
            <p className="text-sm">
              Select a project, task, or subtask to view its details and features
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-morphism-card border-0 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="w-5 h-5" />
            Preview
            <Badge variant="outline" className="text-xs capitalize">
              {itemType}
            </Badge>
          </CardTitle>
          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
            <Edit className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-3">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            {/* Item Header */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold text-primary-readable line-clamp-2">
                {itemType === 'project' ? (currentItem as Project).name : (currentItem as Task).title}
              </h2>
              
              {(currentItem as Task | Project).description && (
                <p className="text-sm text-muted-foreground">
                  {(currentItem as Task | Project).description}
                </p>
              )}

              {/* Badges and Status */}
              <div className="flex flex-wrap gap-2">
                {itemType !== 'project' && (
                  <>
                    <Badge className={`text-xs ${getPriorityColor((currentItem as Task).priority)}`}>
                      {(currentItem as Task).priority} priority
                    </Badge>
                    <Badge className={`text-xs ${getStatusColor((currentItem as Task).status)}`}>
                      {(currentItem as Task).status.replace('_', ' ')}
                    </Badge>
                  </>
                )}
                {itemType === 'project' && (
                  <Badge variant={(currentItem as Project).visibility === 'public' ? 'default' : 'secondary'}>
                    {(currentItem as Project).visibility}
                  </Badge>
                )}
              </div>
            </div>

            <Separator />

            {/* Details and Features Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 glass-morphism-card border-0">
                <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
                <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
                <TabsTrigger value="features" className="text-xs">Features</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                {/* Quick Stats */}
                {itemType !== 'project' && (
                  <div className="grid grid-cols-2 gap-4">
                    {(currentItem as Task).estimated_hours && (
                      <div className="glass-morphism-card p-3 rounded-lg border-0 bg-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium">Estimated</span>
                        </div>
                        <p className="text-sm">{(currentItem as Task).estimated_hours}h</p>
                      </div>
                    )}
                    
                    {(currentItem as Task).due_date && (
                      <div className="glass-morphism-card p-3 rounded-lg border-0 bg-white/5">
                        <div className="flex items-center gap-2 mb-1">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium">Due Date</span>
                        </div>
                        <p className="text-sm">{formatDate((currentItem as Task).due_date)}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Metadata */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{formatDate(currentItem.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span>{formatDate(currentItem.updated_at)}</span>
                    </div>
                    {itemType !== 'project' && (currentItem as Task).assignee_id && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Assignee</span>
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-xs">A</AvatarFallback>
                        </Avatar>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                {itemType !== 'project' && (currentItem as Task).tags && (currentItem as Task).tags!.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {(currentItem as Task).tags!.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <Tag className="w-3 h-3 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                {itemType !== 'project' && selectedTaskId && (
                  <TaskActivities taskId={selectedTaskId} />
                )}
                {itemType === 'project' && (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">Project activity tracking coming soon</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="features" className="space-y-4">
                {itemType !== 'project' && selectedTaskId && (
                  <div className="space-y-4">
                    {/* Assignment */}
                    <TaskAssignment 
                      task={currentItem as Task} 
                      onAssignmentChange={() => {}} 
                    />
                    
                    <Separator />
                    
                    {/* Comments */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-medium flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" />
                        Comments
                      </h4>
                      <TaskComments taskId={selectedTaskId} />
                    </div>
                  </div>
                )}
                
                {itemType === 'project' && (
                  <div className="space-y-4">
                    <Button variant="outline" size="sm" className="w-full">
                      <Settings className="w-4 h-4 mr-2" />
                      Project Settings
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <User className="w-4 h-4 mr-2" />
                      Manage Members
                    </Button>
                    <Button variant="outline" size="sm" className="w-full">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
