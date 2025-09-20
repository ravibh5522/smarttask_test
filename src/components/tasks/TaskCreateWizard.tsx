import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  Target,
  CheckCircle2,
  Plus,
  X,
  Clock,
  AlertTriangle,
  Flag,
  Layers
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { toast } from "sonner";

interface SubTask {
  id: string;
  title: string;
  description?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours?: number;
}

interface TaskCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
}

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  estimatedHours: string;
  dueDate: string;
  startDate: string;
  tags: string[];
  subtasks: SubTask[];
}

export function TaskCreateWizard({ isOpen, onClose, projectId }: TaskCreateWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    category: '',
    estimatedHours: '',
    dueDate: '',
    startDate: '',
    tags: [],
    subtasks: []
  });

  const { createTask } = useTasks(projectId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [newSubtask, setNewSubtask] = useState<Omit<SubTask, 'id'>>({
    title: '',
    description: '',
    priority: 'medium'
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addSubtask = () => {
    if (newSubtask.title.trim()) {
      const subtask: SubTask = {
        ...newSubtask,
        id: Date.now().toString(),
        title: newSubtask.title.trim()
      };
      setFormData(prev => ({
        ...prev,
        subtasks: [...prev.subtasks, subtask]
      }));
      setNewSubtask({
        title: '',
        description: '',
        priority: 'medium'
      });
    }
  };

  const removeSubtask = (subtaskId: string) => {
    setFormData(prev => ({
      ...prev,
      subtasks: prev.subtasks.filter(st => st.id !== subtaskId)
    }));
  };

  const handleSubmit = async () => {
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create main task
      const taskData = {
        title: formData.title.trim(),
        description: formData.description?.trim() || undefined,
        project_id: projectId,
        priority: formData.priority,
        category: formData.category || undefined,
        estimated_hours: formData.estimatedHours ? parseInt(formData.estimatedHours) : undefined,
        due_date: formData.dueDate || undefined,
        start_date: formData.startDate || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        metadata: {
          hasSubtasks: formData.subtasks.length > 0,
          subtaskCount: formData.subtasks.length
        }
      };

      const mainTask = await createTask(taskData);
      
      if (mainTask && formData.subtasks.length > 0) {
        // Create subtasks
        for (const subtask of formData.subtasks) {
          await createTask({
            title: subtask.title,
            description: subtask.description || undefined,
            project_id: projectId,
            priority: subtask.priority,
            parent_task_id: mainTask.id,
            estimated_hours: subtask.estimatedHours,
            metadata: {
              isSubtask: true,
              parentTaskId: mainTask.id
            }
          });
        }
      }
      
      toast.success(`Task created successfully${formData.subtasks.length > 0 ? ` with ${formData.subtasks.length} subtasks` : ''}!`);
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        category: '',
        estimatedHours: '',
        dueDate: '',
        startDate: '',
        tags: [],
        subtasks: []
      });
      setCurrentStep(1);
    } catch (error: any) {
      console.error("Task creation failed:", error);
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Target className="w-5 h-5" />;
      case 2:
        return <Layers className="w-5 h-5" />;
      case 3:
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <Flag className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <Target className="w-4 h-4 text-green-500" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-morphism-card border-0 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
                    <DialogTitle className="text-primary-readable font-semibold text-xl">
            Create Task with AI Assistant
          </DialogTitle>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between mb-8">
          {Array.from({ length: totalSteps }).map((_, index) => {
            const step = index + 1;
            const isActive = step === currentStep;
            const isCompleted = step < currentStep;
            
            return (
              <div key={step} className="flex items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${isCompleted ? 'bg-success text-white' : 
                    isActive ? 'bg-primary text-white' : 
                    'bg-muted text-muted-foreground'}
                `}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    getStepIcon(step)
                  )}
                </div>
                {index < totalSteps - 1 && (
                  <div className={`w-16 h-1 mx-2 ${
                    isCompleted ? 'bg-success' : 'bg-muted'
                  }`} />
                )}
              </div>
            );
          })}
        </div>

        {/* Step Content */}
        <div className="min-h-[400px]">
          {currentStep === 1 && (
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Task Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="task-title">Task Title *</Label>
                  <Input
                    id="task-title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Enter task title"
                    className="glass-input border-0 bg-white/5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe the task..."
                    className="glass-input border-0 bg-white/5 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger className="glass-input border-0 bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism-card border-0">
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <Target className="w-4 h-4 text-green-500" />
                            Low
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-yellow-500" />
                            Medium
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <Flag className="w-4 h-4 text-orange-500" />
                            High
                          </div>
                        </SelectItem>
                        <SelectItem value="urgent">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-red-500" />
                            Urgent
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      placeholder="e.g., Development, Design"
                      className="glass-input border-0 bg-white/5"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="estimated-hours">Estimated Hours</Label>
                    <Input
                      id="estimated-hours"
                      type="number"
                      value={formData.estimatedHours}
                      onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                      placeholder="0"
                      className="glass-input border-0 bg-white/5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="glass-input border-0 bg-white/5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="due-date">Due Date</Label>
                    <Input
                      id="due-date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="glass-input border-0 bg-white/5"
                    />
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <Label>Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag"
                      className="glass-input border-0 bg-white/5"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag();
                        }
                      }}
                    />
                    <Button 
                      onClick={addTag}
                      variant="outline" 
                      className="glass-button"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="glass-badge border-0">
                        {tag}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer hover:text-destructive" 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="w-5 h-5" />
                  Subtasks (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="glass-morphism-card p-4 rounded-lg border-0 bg-white/5">
                  <h4 className="font-medium mb-4">Add Subtask</h4>
                  <div className="space-y-4">
                    <Input
                      value={newSubtask.title}
                      onChange={(e) => setNewSubtask(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Subtask title"
                      className="glass-input border-0 bg-white/5"
                    />
                    
                    <Textarea
                      value={newSubtask.description}
                      onChange={(e) => setNewSubtask(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Subtask description (optional)"
                      className="glass-input border-0 bg-white/5 min-h-[80px]"
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Priority</Label>
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
                      </div>

                      <div>
                        <Label>Estimated Hours</Label>
                        <Input
                          type="number"
                          value={newSubtask.estimatedHours || ''}
                          onChange={(e) => setNewSubtask(prev => ({ ...prev, estimatedHours: e.target.value ? parseInt(e.target.value) : undefined }))}
                          placeholder="0"
                          className="glass-input border-0 bg-white/5"
                        />
                      </div>
                    </div>

                    <Button 
                      onClick={addSubtask}
                      disabled={!newSubtask.title.trim()}
                      className="bg-gradient-primary hover:shadow-glow"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add Subtask
                    </Button>
                  </div>
                </div>

                {/* Existing Subtasks */}
                {formData.subtasks.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-4">Subtasks ({formData.subtasks.length})</h4>
                    <div className="space-y-3">
                      {formData.subtasks.map((subtask) => (
                        <Card key={subtask.id} className="glass-morphism-card border-0 bg-white/5">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  {getPriorityIcon(subtask.priority)}
                                  <h5 className="font-medium">{subtask.title}</h5>
                                </div>
                                {subtask.description && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {subtask.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                  <Badge className="text-xs">
                                    {subtask.priority}
                                  </Badge>
                                  {subtask.estimatedHours && (
                                    <span>{subtask.estimatedHours}h</span>
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeSubtask(subtask.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  Review & Create
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Task Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Task Title</Label>
                        <p className="font-medium">{formData.title || 'Untitled Task'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p className="text-sm">{formData.description || 'No description provided'}</p>
                      </div>

                      <div className="flex gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Priority</Label>
                          <div className="flex items-center gap-2 mt-1">
                            {getPriorityIcon(formData.priority)}
                            <Badge className="w-fit">
                              {formData.priority}
                            </Badge>
                          </div>
                        </div>
                        {formData.category && (
                          <div>
                            <Label className="text-sm text-muted-foreground">Category</Label>
                            <Badge className="block mt-1 w-fit">
                              {formData.category}
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {formData.estimatedHours && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Estimated Hours</Label>
                          <p className="font-medium">{formData.estimatedHours}h</p>
                        </div>
                      )}

                      {formData.startDate && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Start Date</Label>
                          <p className="font-medium">
                            {new Date(formData.startDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {formData.dueDate && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Due Date</Label>
                          <p className="font-medium">
                            {new Date(formData.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {formData.tags.length > 0 && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Tags</Label>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {formData.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="glass-badge border-0">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {formData.subtasks.length > 0 && (
                    <>
                      <Separator className="my-6" />
                      <div>
                        <h4 className="font-medium mb-3">Subtasks ({formData.subtasks.length})</h4>
                        <div className="space-y-2">
                          {formData.subtasks.map((subtask, index) => (
                            <div key={subtask.id} className="flex items-center gap-3 p-3 glass-morphism-card rounded-lg border-0 bg-white/5">
                              <span className="text-sm text-muted-foreground">{index + 1}.</span>
                              <div className="flex items-center gap-2">
                                {getPriorityIcon(subtask.priority)}
                                <span className="font-medium">{subtask.title}</span>
                              </div>
                              {subtask.estimatedHours && (
                                <Badge variant="outline" className="text-xs">
                                  {subtask.estimatedHours}h
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <Button
            variant="outline"
            onClick={currentStep === 1 ? onClose : handlePrevious}
            className="glass-button"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!formData.title.trim()}
              className="bg-gradient-primary hover:shadow-glow"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.title.trim() || isSubmitting}
              className="bg-gradient-primary hover:shadow-glow"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
