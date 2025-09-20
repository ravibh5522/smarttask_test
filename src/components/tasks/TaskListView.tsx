import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  MoreHorizontal,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Copy,
  Target,
  Flag,
  User,
  Tag
} from "lucide-react";
import { Task, useTasks } from "@/hooks/useTasks";
import { TaskDetailModal } from "./TaskDetailModal";
import { format } from "date-fns";

interface TaskListViewProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
}

export function TaskListView({ 
  tasks, 
  selectedTasks, 
  onSelectTask, 
  onSelectAll 
}: TaskListViewProps) {
  const { updateTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "in_progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "blocked":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Target className="w-4 h-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "on_hold":
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
      default:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case "high":
        return <Flag className="w-4 h-4 text-orange-500" />;
      case "medium":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "low":
        return <Target className="w-4 h-4 text-green-500" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const handleToggleComplete = async (taskId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'open' : 'completed';
    await updateTask(taskId, { status: newStatus as any });
  };

  const handleStatusChange = async (taskId: string, status: string) => {
    await updateTask(taskId, { status: status as any });
  };

  const handleDelete = async (taskId: string) => {
    if (confirm('Are you sure you want to delete this task?')) {
      await deleteTask(taskId);
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const closeTaskDetail = () => {
    setSelectedTask(null);
    setIsDetailModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-morphism-card border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={tasks.length > 0 && selectedTasks.length === tasks.length}
                onCheckedChange={onSelectAll}
              />
              <span className="text-sm text-muted-foreground">
                {selectedTasks.length > 0 
                  ? `${selectedTasks.length} of ${tasks.length} selected`
                  : `${tasks.length} tasks`
                }
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              List View
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.map((task) => (
          <Card 
            key={task.id} 
            className="glass-morphism-card border-0 hover:shadow-glow transition-smooth cursor-pointer hover-scale"
            onClick={() => openTaskDetail(task)}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Checkbox 
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 flex-shrink-0"
                />
                
                <Checkbox 
                  checked={task.status === 'completed'}
                  onCheckedChange={() => handleToggleComplete(task.id, task.status)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1 flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title and Status */}
                      <div className="flex items-center gap-2 mb-2">
                        {getStatusIcon(task.status)}
                        <h4 className={`font-medium text-base ${
                          task.status === 'completed' ? 'line-through text-muted-foreground' : ''
                        } line-clamp-1`}>
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
                      
                      {/* Description */}
                      {task.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                      
                      {/* Meta Information */}
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        {/* Status Badge */}
                        <Badge className={`${getStatusColor(task.status)} text-xs`}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                        
                        {/* Priority */}
                        <div className="flex items-center gap-1">
                          {getPriorityIcon(task.priority)}
                          <Badge className={`${getPriorityColor(task.priority)} text-xs`}>
                            {task.priority}
                          </Badge>
                        </div>
                        
                        {/* Category */}
                        {task.category && (
                          <Badge variant="outline" className="text-xs">
                            {task.category}
                          </Badge>
                        )}
                        
                        {/* Due Date */}
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span className="text-xs">
                              Due {format(new Date(task.due_date), 'MMM d')}
                            </span>
                          </div>
                        )}
                        
                        {/* Estimated Hours */}
                        {task.estimated_hours && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span className="text-xs">{task.estimated_hours}h</span>
                          </div>
                        )}
                        
                        {/* Assignee */}
                        {task.assignee_id && (
                          <div className="flex items-center gap-1">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                <User className="w-3 h-3" />
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        )}
                      </div>
                      
                      {/* Tags */}
                      {task.tags && task.tags.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Tag className="w-3 h-3 text-muted-foreground" />
                          <div className="flex gap-1">
                            {task.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {task.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{task.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(task.created_at), 'MMM d')}
                      </span>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 glass-morphism-button border-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-morphism-card border-0">
                          <DropdownMenuItem onClick={() => openTaskDetail(task)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Task
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="w-4 h-4 mr-2" />
                            Duplicate
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
                            <Trash2 className="w-4 h-4 mr-2" />
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
        ))}
      </div>

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={isDetailModalOpen}
        onClose={closeTaskDetail}
        onDelete={handleDelete}
      />
    </div>
  );
}