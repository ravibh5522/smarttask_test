import { useState, memo, useMemo, useCallback } from "react";
import { Plus, File, AlertCircle, Clock, User, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTasks, Task } from "@/hooks/useTasks";
import { useVirtualScrolling } from "@/hooks/useVirtualScrolling";
import { ColumnLoadingSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface TaskColumnProps {
  tasks: Task[];
  loading: boolean;
  selectedTaskId?: string;
  onTaskSelect: (taskId: string) => void;
  searchTerm: string;
  projectId?: string;
}

export const TaskColumn = memo(function TaskColumn({
  tasks,
  loading,
  selectedTaskId,
  onTaskSelect,
  searchTerm,
  projectId
}: TaskColumnProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent'
  });
  
  const { createTask } = useTasks(projectId);

  const filteredTasks = useMemo(() => 
    tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [tasks, searchTerm]
  );

  const handleCreateTask = useCallback(async () => {
    if (!newTask.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    if (!projectId) {
      toast.error("Please select a project first");
      return;
    }

    try {
      await createTask({
        title: newTask.title.trim(),
        description: newTask.description.trim() || undefined,
        priority: newTask.priority,
        project_id: projectId
      });
      
      setNewTask({ title: '', description: '', priority: 'medium' });
      setIsCreating(false);
      toast.success("Task created successfully!");
    } catch (error) {
      toast.error("Failed to create task");
    }
  }, [createTask, newTask, projectId]);

  const cancelCreate = useCallback(() => {
    setNewTask({ title: '', description: '', priority: 'medium' });
    setIsCreating(false);
  }, []);

  const handleTaskClick = useCallback((taskId: string) => {
    onTaskSelect(taskId);
  }, [onTaskSelect]);

  // Virtual scrolling for tasks
  const {
    containerProps,
    scrollElementProps,
    virtualItems,
    getItemProps,
  } = useVirtualScrolling({
    items: filteredTasks,
    itemHeight: 100, // Approximate height of each task card
    containerHeight: 400, // Height of the scrollable container
    overscan: 3,
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'high': return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30';
      case 'low': return 'bg-green-500/20 text-green-300 border-green-500/30';
      default: return 'bg-muted';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-300';
      case 'in_progress': return 'bg-blue-500/20 text-blue-300';
      case 'blocked': return 'bg-red-500/20 text-red-300';
      case 'in_review': return 'bg-purple-500/20 text-purple-300';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return <ColumnLoadingSkeleton title="Tasks" count={5} />;
  }

  return (
    <Card className="glass-morphism-card border-0 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <File className="w-5 h-5" />
            Tasks
            <Badge variant="secondary" className="text-xs">
              {filteredTasks.length}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            disabled={!projectId}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-3">
        {/* Create Task Form */}
        {isCreating && (
          <div className="space-y-3 p-3 glass-morphism-card rounded-lg border-0 bg-white/5 mb-4">
            <Input
              placeholder="Task title"
              value={newTask.title}
              onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
              className="glass-input border-0 bg-white/5"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newTask.description}
              onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
              className="glass-input border-0 bg-white/5 min-h-[60px]"
            />
            <Select 
              value={newTask.priority} 
              onValueChange={(value: any) => setNewTask(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger className="glass-input border-0 bg-white/5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-morphism-card border-0">
                <SelectItem value="low">Low Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateTask} className="flex-1">
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={cancelCreate} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Tasks List with Virtual Scrolling */}
        <div {...containerProps}>
          <div {...scrollElementProps}>
            {!projectId ? (
              <div className="text-center py-8 text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a project to view tasks</p>
              </div>
            ) : filteredTasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <File className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No tasks found</p>
                {!isCreating && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreating(true)}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Task
                  </Button>
                )}
              </div>
            ) : (
              virtualItems.map((virtualItem) => {
                const task = filteredTasks[virtualItem.index];
                return (
                  <div
                    {...getItemProps(virtualItem)}
                    key={task.id}
                  >
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/5 mx-2 my-1 ${
                        selectedTaskId === task.id
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-white/10 glass-morphism-card'
                      }`}
                      onClick={() => handleTaskClick(task.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <File className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-sm truncate">
                              {task.title}
                            </h3>
                          </div>
                          {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {task.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                              {task.priority}
                            </Badge>
                            <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            {task.assignee_id && (
                              <Badge variant="outline" className="text-xs">
                                <User className="w-3 h-3 mr-1" />
                                Assigned
                              </Badge>
                            )}
                            {task.due_date && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="w-3 h-3 mr-1" />
                                Due
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Assign</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
