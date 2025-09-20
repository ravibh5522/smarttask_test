import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  X,
  CheckCircle,
  Clock,
  Archive,
  Trash2,
  Copy,
  Tag,
  User,
  MoreHorizontal,
  AlertTriangle,
  Edit,
  Calendar
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";

interface TaskBulkActionsProps {
  selectedTasks: string[];
  onClearSelection: () => void;
}

export function TaskBulkActions({ selectedTasks, onClearSelection }: TaskBulkActionsProps) {
  const { updateTask, deleteTask } = useTasks();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleBulkStatusUpdate = async (status: string) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => updateTask(taskId, { status: status as any }))
      );
      toast.success(`Updated ${selectedTasks.length} tasks to ${status}`);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to update tasks');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkPriorityUpdate = async (priority: string) => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => updateTask(taskId, { priority: priority as any }))
      );
      toast.success(`Updated ${selectedTasks.length} tasks priority to ${priority}`);
      onClearSelection();
    } catch (error) {
      toast.error('Failed to update task priorities');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    setIsProcessing(true);
    try {
      await Promise.all(
        selectedTasks.map(taskId => deleteTask(taskId))
      );
      toast.success(`Deleted ${selectedTasks.length} tasks`);
      onClearSelection();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete tasks');
    } finally {
      setIsProcessing(false);
    }
  };

  const statusOptions = [
    { value: 'open', label: 'Open', icon: AlertTriangle },
    { value: 'in_progress', label: 'In Progress', icon: Clock },
    { value: 'in_review', label: 'In Review', icon: Edit },
    { value: 'completed', label: 'Completed', icon: CheckCircle },
    { value: 'blocked', label: 'Blocked', icon: AlertTriangle },
    { value: 'on_hold', label: 'On Hold', icon: Clock },
    { value: 'archived', label: 'Archived', icon: Archive }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Badge className="bg-primary text-primary-foreground">
          {selectedTasks.length} selected
        </Badge>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="glass-button"
        >
          <X className="w-4 h-4 mr-2" />
          Clear Selection
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* Quick Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkStatusUpdate('completed')}
          disabled={isProcessing}
          className="glass-button"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Mark Complete
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => handleBulkStatusUpdate('in_progress')}
          disabled={isProcessing}
          className="glass-button"
        >
          <Clock className="w-4 h-4 mr-2" />
          Start Progress
        </Button>

        {/* Status Update Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="glass-button">
              <Edit className="w-4 h-4 mr-2" />
              Change Status
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-morphism-card border-0">
            {statusOptions.map((option) => {
              const Icon = option.icon;
              return (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleBulkStatusUpdate(option.value)}
                  disabled={isProcessing}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {option.label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Priority Update Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="glass-button">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Change Priority
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-morphism-card border-0">
            {priorityOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => handleBulkPriorityUpdate(option.value)}
                disabled={isProcessing}
              >
                {option.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="glass-button">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass-morphism-card border-0" align="end">
            <DropdownMenuItem disabled={isProcessing}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate Tasks
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isProcessing}>
              <User className="w-4 h-4 mr-2" />
              Assign To...
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isProcessing}>
              <Tag className="w-4 h-4 mr-2" />
              Add Tags
            </DropdownMenuItem>
            <DropdownMenuItem disabled={isProcessing}>
              <Calendar className="w-4 h-4 mr-2" />
              Set Due Date
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleBulkStatusUpdate('archived')}
              disabled={isProcessing}
            >
              <Archive className="w-4 h-4 mr-2" />
              Archive Tasks
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setIsDeleteDialogOpen(true)}
              disabled={isProcessing}
              className="text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete Tasks
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="glass-morphism-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Delete Selected Tasks
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedTasks.length} selected tasks? 
              This action cannot be undone and all associated data will be permanently removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="glass-button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              disabled={isProcessing}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isProcessing ? 'Deleting...' : 'Delete Tasks'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}