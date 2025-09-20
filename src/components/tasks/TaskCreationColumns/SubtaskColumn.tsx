import { useState, memo, useMemo, useCallback } from "react";
import { Plus, FileText, Clock, User, CheckCircle, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useTasks, Task } from "@/hooks/useTasks";
import { ColumnLoadingSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface SubtaskColumnProps {
  subtasks: Task[];
  loading: boolean;
  selectedSubtaskId?: string;
  onSubtaskSelect: (subtaskId: string) => void;
  searchTerm: string;
  parentTaskId?: string;
  projectId?: string;
}

export const SubtaskColumn = memo(function SubtaskColumn({
  subtasks,
  loading,
  selectedSubtaskId,
  onSubtaskSelect,
  searchTerm,
  parentTaskId,
  projectId
}: SubtaskColumnProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newSubtask, setNewSubtask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
    estimatedHours: ''
  });
  
  const { createTask } = useTasks(projectId);

  const filteredSubtasks = useMemo(() => 
    subtasks.filter(subtask => 
      subtask.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subtask.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [subtasks, searchTerm]
  );

  const handleCreateSubtask = useCallback(async () => {
    if (!newSubtask.title.trim()) {
      toast.error("Subtask title is required");
      return;
    }

    if (!parentTaskId || !projectId) {
      toast.error("Please select a task first");
      return;
    }

    try {
      await createTask({
        title: newSubtask.title.trim(),
        description: newSubtask.description.trim() || undefined,
        priority: newSubtask.priority,
        project_id: projectId,
        parent_task_id: parentTaskId
      });
      
      setNewSubtask({ title: '', description: '', priority: 'medium', estimatedHours: '' });
      setIsCreating(false);
      toast.success("Subtask created successfully!");
    } catch (error) {
      toast.error("Failed to create subtask");
    }
  }, [createTask, newSubtask, parentTaskId, projectId]);

  const cancelCreate = useCallback(() => {
    setNewSubtask({ title: '', description: '', priority: 'medium', estimatedHours: '' });
    setIsCreating(false);
  }, []);

  const handleSubtaskClick = useCallback((subtaskId: string) => {
    onSubtaskSelect(subtaskId);
  }, [onSubtaskSelect]);

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
    return <ColumnLoadingSkeleton title="Subtasks" count={4} />;
  }

  return (
    <Card className="glass-morphism-card border-0 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Subtasks
            <Badge variant="secondary" className="text-xs">
              {filteredSubtasks.length}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            disabled={!parentTaskId}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-3">
        {/* Create Subtask Form */}
        {isCreating && (
          <div className="space-y-3 p-3 glass-morphism-card rounded-lg border-0 bg-white/5 mb-4">
            <Input
              placeholder="Subtask title"
              value={newSubtask.title}
              onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
              className="glass-input border-0 bg-white/5"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newSubtask.description}
              onChange={(e) => setNewSubtask(prev => ({ ...prev, description: e.target.value }))}
              className="glass-input border-0 bg-white/5 min-h-[60px]"
            />
            <div className="grid grid-cols-2 gap-2">
              <Select 
                value={newSubtask.priority} 
                onValueChange={(value: any) => setNewSubtask(prev => ({ ...prev, priority: value }))}
              >
                <SelectTrigger className="glass-input border-0 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-morphism-card border-0">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="number"
                placeholder="Hours"
                value={newSubtask.estimatedHours}
                onChange={(e) => setNewSubtask(prev => ({ ...prev, estimatedHours: e.target.value }))}
                className="glass-input border-0 bg-white/5"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateSubtask} className="flex-1">
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={cancelCreate} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Subtasks List with Virtual Scrolling */}
        <ScrollArea className="h-full">
          <div className="space-y-2">
            {!parentTaskId ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select a task to view subtasks</p>
              </div>
            ) : filteredSubtasks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No subtasks found</p>
                {!isCreating && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreating(true)}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Subtask
                  </Button>
                )}
              </div>
            ) : (
              filteredSubtasks.map((subtask) => (
                <div
                  key={subtask.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/5 ${
                    selectedSubtaskId === subtask.id
                      ? 'border-primary/50 bg-primary/10'
                      : 'border-white/10 glass-morphism-card'
                  }`}
                  onClick={() => onSubtaskSelect(subtask.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {subtask.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <FileText className="w-4 h-4 text-primary" />
                        )}
                        <h3 className="font-medium text-sm truncate">
                          {subtask.title}
                        </h3>
                      </div>
                      {subtask.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                          {subtask.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs ${getPriorityColor(subtask.priority)}`}>
                          {subtask.priority}
                        </Badge>
                        <Badge className={`text-xs ${getStatusColor(subtask.status)}`}>
                          {subtask.status.replace('_', ' ')}
                        </Badge>
                        {subtask.estimated_hours && (
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" />
                            {subtask.estimated_hours}h
                          </Badge>
                        )}
                        {subtask.assignee_id && (
                          <Badge variant="outline" className="text-xs">
                            <User className="w-3 h-3 mr-1" />
                            Assigned
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
                        <DropdownMenuItem>Mark Complete</DropdownMenuItem>
                        <DropdownMenuItem>Assign</DropdownMenuItem>
                        <DropdownMenuItem>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
});
