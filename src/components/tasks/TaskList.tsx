import { CheckCircle, Clock, AlertCircle, Plus, MoreHorizontal, Calendar, Eye, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTasks } from "@/hooks/useTasks";
import { format } from "date-fns";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { TaskDetailModal } from "./TaskDetailModal";
import { TaskCreateWizard } from "./TaskCreateWizard";
import { Task } from "@/hooks/useTasks";

interface TaskListProps {
  projectId?: string;
}

export function TaskList({ projectId }: TaskListProps) {
  const navigate = useNavigate();
  const { tasks, loading, updateTask, deleteTask } = useTasks(projectId);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed'>('all');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const closeTaskDetail = () => {
    setSelectedTask(null);
    setIsDetailModalOpen(false);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">My Tasks</h3>
        </div>
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="glass-morphism-card border-0">
              <CardContent className="p-3 sm:p-4">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-muted rounded"></div>
                  <div className="h-3 bg-muted rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'open' || task.status === 'draft';
    if (filter === 'in_progress') return task.status === 'in_progress';
    if (filter === 'completed') return task.status === 'completed';
    return true;
  });

  const handleStatusChange = async (taskId: string, status: string) => {
    await updateTask(taskId, { status: status as any });
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
    await updateTask(taskId, { status: newStatus as any });
  };

  const handleTaskClick = (task: Task, e: React.MouseEvent) => {
    // Don't navigate if clicking on interactive elements
    if ((e.target as HTMLElement).closest('button, input, [role="button"]')) {
      return;
    }
    openTaskDetail(task);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "open":
      case "draft":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "high":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h3 className="text-lg font-semibold">
          {projectId ? 'Project Tasks' : 'My Tasks'}
        </h3>
        <div className="flex items-center gap-3">
          {projectId && (
            <Button
              onClick={() => setIsCreateWizardOpen(true)}
              className="bg-gradient-primary hover:shadow-glow"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          )}
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <Button
              size="sm"
              variant={filter === 'all' ? 'default' : 'outline'}
              onClick={() => setFilter('all')}
              className="text-xs sm:text-sm glass-morphism-button border-0 bg-white/5"
            >
              All ({tasks.length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'pending' ? 'default' : 'outline'}
              onClick={() => setFilter('pending')}
              className="text-xs sm:text-sm glass-morphism-button border-0 bg-white/5"
            >
              Pending ({tasks.filter(t => t.status === 'open' || t.status === 'draft').length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'in_progress' ? 'default' : 'outline'}
              onClick={() => setFilter('in_progress')}
              className="text-xs sm:text-sm glass-morphism-button border-0 bg-white/5"
            >
              Active ({tasks.filter(t => t.status === 'in_progress').length})
            </Button>
            <Button
              size="sm"
              variant={filter === 'completed' ? 'default' : 'outline'}
              onClick={() => setFilter('completed')}
              className="text-xs sm:text-sm glass-morphism-button border-0 bg-white/5"
            >
              Done ({tasks.filter(t => t.status === 'completed').length})
            </Button>
          </div>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="glass-morphism-card p-8 rounded-xl border-0 text-center">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              {filter === 'all' 
                ? (projectId ? 'No tasks in this project yet.' : 'No tasks yet.') 
                : `No ${filter} tasks.`}
            </p>
            {projectId && filter === 'all' && (
              <Button
                onClick={() => setIsCreateWizardOpen(true)}
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Task
              </Button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card 
              key={task.id} 
              className="glass-morphism-card border-0 hover:shadow-glow transition-smooth cursor-pointer hover-scale"
              onClick={(e) => handleTaskClick(task, e)}
            >
              <CardContent className="p-3 sm:p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox 
                        checked={task.status === 'completed'}
                        onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                        className="mt-1 flex-shrink-0"
                      />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className={`font-medium text-sm sm:text-base ${task.status === 'completed' ? 'line-through text-muted-foreground' : ''} line-clamp-1`}>
                                {task.title}
                              </h4>
                              {task.parent_task_id && (
                                <Badge variant="outline" className="text-xs">
                                  Subtask
                                </Badge>
                              )}
                              {task.metadata?.hasSubtasks && (
                                <Badge variant="outline" className="text-xs">
                                  {task.metadata.subtaskCount} subtasks
                                </Badge>
                              )}
                            </div>
                            
                            {task.description && (
                              <p className="text-xs sm:text-sm text-muted-foreground mb-2 line-clamp-2">
                                {task.description}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs text-muted-foreground">
                              {task.due_date && (
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  <Calendar className="w-3 h-3" />
                                  <span className="hidden sm:inline">Due:</span>
                                  {format(new Date(task.due_date), 'MMM d')}
                                </div>
                              )}
                              
                              <Badge 
                                variant="outline" 
                                className={`${getStatusColor(task.status)} text-xs flex-shrink-0`}
                              >
                                {task.status.replace('_', ' ')}
                              </Badge>
                              
                              <Badge className={`${getPriorityColor(task.priority)} text-xs flex-shrink-0`}>
                                {task.priority}
                              </Badge>

                              {task.category && (
                                <Badge variant="outline" className="text-xs flex-shrink-0">
                                  {task.category}
                                </Badge>
                              )}

                              {task.estimated_hours && (
                                <span className="text-xs text-muted-foreground flex-shrink-0">
                                  {task.estimated_hours}h
                                </span>
                              )}

                              {task.tags && task.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {task.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {task.tags.length > 2 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{task.tags.length - 2}
                                    </Badge>
                                  )}
                                </div>
                              )}
                              
                              <span className="text-xs text-muted-foreground hidden sm:inline">
                                {format(new Date(task.created_at), 'MMM d, yyyy')}
                              </span>
                            </div>
                          </div>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {task.assignee_id && (
                          <Avatar className="w-6 h-6">
                            <AvatarFallback className="text-xs">
                              U
                            </AvatarFallback>
                          </Avatar>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 glass-morphism-button border-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="glass-morphism-card border-0">
                            <DropdownMenuItem onClick={() => openTaskDetail(task)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {task.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'completed')}>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                            )}
                            {task.status !== 'in_progress' && task.status !== 'completed' && (
                              <DropdownMenuItem onClick={() => handleStatusChange(task.id, 'in_progress')}>
                                <Clock className="w-4 h-4 mr-2" />
                                Start Progress
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={isDetailModalOpen}
        onClose={closeTaskDetail}
        onDelete={handleDelete}
      />

      {/* Task Creation Wizard */}
      {projectId && (
        <TaskCreateWizard
          isOpen={isCreateWizardOpen}
          onClose={() => setIsCreateWizardOpen(false)}
          projectId={projectId}
        />
      )}
    </div>
  );
}

export default TaskList;