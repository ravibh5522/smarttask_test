import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Tag,
  Plus
} from "lucide-react";
import { Task, useTasks } from "@/hooks/useTasks";
import { TaskDetailModal } from "./TaskDetailModal";
import { format } from "date-fns";

interface TaskKanbanViewProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string, checked: boolean) => void;
}

export function TaskKanbanView({ 
  tasks, 
  selectedTasks, 
  onSelectTask 
}: TaskKanbanViewProps) {
  const { updateTask, deleteTask } = useTasks();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const columns = [
    { id: 'draft', title: 'Draft', color: 'bg-gray-100', count: 0 },
    { id: 'open', title: 'To Do', color: 'bg-blue-100', count: 0 },
    { id: 'in_progress', title: 'In Progress', color: 'bg-yellow-100', count: 0 },
    { id: 'in_review', title: 'In Review', color: 'bg-purple-100', count: 0 },
    { id: 'completed', title: 'Completed', color: 'bg-green-100', count: 0 },
    { id: 'blocked', title: 'Blocked', color: 'bg-red-100', count: 0 }
  ];

  // Group tasks by status
  const tasksByStatus = tasks.reduce((acc, task) => {
    if (!acc[task.status]) {
      acc[task.status] = [];
    }
    acc[task.status].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  // Update column counts
  columns.forEach(column => {
    column.count = tasksByStatus[column.id]?.length || 0;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-red-500";
      case "high":
        return "border-l-orange-500";
      case "medium":
        return "border-l-yellow-500";
      case "low":
        return "border-l-green-500";
      default:
        return "border-l-gray-300";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case "high":
        return <Flag className="w-3 h-3 text-orange-500" />;
      case "medium":
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case "low":
        return <Target className="w-3 h-3 text-green-500" />;
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await updateTask(taskId, { status: newStatus as any });
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
              <span className="text-sm text-muted-foreground">
                {selectedTasks.length > 0 
                  ? `${selectedTasks.length} selected`
                  : `${tasks.length} tasks across ${columns.filter(c => c.count > 0).length} columns`
                }
              </span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Kanban View
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto">
        {columns.map((column) => (
          <Card key={column.id} className="glass-morphism-card border-0 min-w-80 lg:min-w-0">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <span>{column.title}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {column.count}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {tasksByStatus[column.id]?.map((task) => (
                <Card
                  key={task.id}
                  className={`glass-morphism-card border-0 border-l-4 ${getPriorityColor(task.priority)} hover:shadow-glow transition-smooth cursor-pointer hover-scale bg-white/5`}
                  onClick={() => openTaskDetail(task)}
                >
                  <CardContent className="p-3">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={selectedTasks.includes(task.id)}
                            onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-shrink-0"
                          />
                          {getPriorityIcon(task.priority)}
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-6 w-6 p-0 glass-morphism-button border-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreHorizontal className="w-3 h-3" />
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
                            {/* Move to different status */}
                            {columns.filter(c => c.id !== task.status).map(targetColumn => (
                              <DropdownMenuItem 
                                key={targetColumn.id}
                                onClick={() => handleStatusChange(task.id, targetColumn.id)}
                              >
                                Move to {targetColumn.title}
                              </DropdownMenuItem>
                            ))}
                            <DropdownMenuItem onClick={() => handleDelete(task.id)} className="text-destructive">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Title */}
                      <div>
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {task.title}
                        </h4>
                        
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </div>
                      
                      {/* Metadata */}
                      <div className="space-y-2">
                        {/* Badges */}
                        <div className="flex flex-wrap gap-1">
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
                          
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                        
                        {/* Due Date */}
                        {task.due_date && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>{format(new Date(task.due_date), 'MMM d')}</span>
                          </div>
                        )}
                        
                        {/* Estimated Hours */}
                        {task.estimated_hours && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            <span>{task.estimated_hours}h</span>
                          </div>
                        )}
                        
                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Tag className="w-3 h-3 text-muted-foreground" />
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
                          </div>
                        )}
                      </div>
                      
                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <div className="flex items-center gap-1">
                          {task.assignee_id && (
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                <User className="w-3 h-3" />
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(task.created_at), 'MMM d')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )) || (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No tasks</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add task
                  </Button>
                </div>
              )}
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