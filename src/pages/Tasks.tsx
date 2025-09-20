import React, { useState } from "react";
import { Plus, MessageSquare, Users, Target, Calendar, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";

interface TaskFormData {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  project_id: string;
  due_date: string;
  estimated_hours: string;
  parent_task_id?: string;
  discussion: string;
}

export default function Tasks() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("discussion");
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    description: '',
    priority: 'medium',
    project_id: '',
    due_date: '',
    estimated_hours: '',
    parent_task_id: undefined,
    discussion: ''
  });

  const { createTask } = useTasks();
  const { projects } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateTask = async () => {
    if (!formData.title || !formData.project_id) {
      toast.error("Please fill in required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await createTask({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        project_id: formData.project_id,
        metadata: {
          initial_discussion: formData.discussion,
          due_date: formData.due_date || undefined,
          estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined
        }
      });
      
      toast.success("Task created successfully!");
      setIsCreateModalOpen(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        priority: 'medium',
        project_id: '',
        due_date: '',
        estimated_hours: '',
        parent_task_id: undefined,
        discussion: ''
      });
      setActiveTab("discussion");
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary-readable">
              Task Management
            </h1>
            <p className="text-muted-foreground mt-2">
              Create and manage tasks with detailed discussions and planning
            </p>
          </div>

          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-primary hover:shadow-glow">
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-morphism-card border-0 light:bg-white/95 light:border-primary/20 max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-primary-readable font-semibold text-xl">
                  Create New Task
                </DialogTitle>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3 glass-morphism-card border-0 light:bg-white/90">
                  <TabsTrigger value="discussion" className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Discussion
                  </TabsTrigger>
                  <TabsTrigger value="details" className="flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Task Details
                  </TabsTrigger>
                  <TabsTrigger value="planning" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Planning
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="discussion" className="mt-6">
                  <Card className="glass-morphism-card border-0 light:bg-white/90 light:border-primary/15">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Initial Discussion & Requirements
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="task-title">Task Title *</Label>
                        <Input
                          id="task-title"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="What needs to be done?"
                          className="glass-input border-0 bg-white/5"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="discussion">Initial Discussion & Context</Label>
                        <Textarea
                          id="discussion"
                          value={formData.discussion}
                          onChange={(e) => setFormData(prev => ({ ...prev, discussion: e.target.value }))}
                          placeholder="Describe the context, requirements, expectations, and any initial thoughts about this task..."
                          className="glass-input border-0 bg-white/5 min-h-[200px]"
                        />
                      </div>

                      <div className="bg-primary/10 p-4 rounded-lg">
                        <h4 className="font-medium mb-2">💡 Tips for a good initial discussion:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• Explain the "why" behind this task</li>
                          <li>• Include any specific requirements or constraints</li>
                          <li>• Mention related tasks or dependencies</li>
                          <li>• Add questions that need to be answered</li>
                          <li>• Include relevant links or references</li>
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="details" className="mt-6">
                  <Card className="glass-morphism-card border-0 light:bg-white/90 light:border-primary/15">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Task Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <Label htmlFor="task-description">Detailed Description</Label>
                        <Textarea
                          id="task-description"
                          value={formData.description}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Provide detailed task description, acceptance criteria, and deliverables..."
                          className="glass-input border-0 bg-white/5 min-h-[120px]"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Project *</Label>
                          <Select 
                            value={formData.project_id} 
                            onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}
                          >
                            <SelectTrigger className="glass-input border-0 bg-white/5">
                              <SelectValue placeholder="Select project" />
                            </SelectTrigger>
                            <SelectContent className="glass-morphism-card border-0">
                              {projects.map((project) => (
                                <SelectItem key={project.id} value={project.id}>
                                  {project.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

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
                                  <div className="w-2 h-2 rounded-full bg-success"></div>
                                  Low
                                </div>
                              </SelectItem>
                              <SelectItem value="medium">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-warning"></div>
                                  Medium
                                </div>
                              </SelectItem>
                              <SelectItem value="high">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-destructive"></div>
                                  High
                                </div>
                              </SelectItem>
                              <SelectItem value="urgent">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                                  Urgent
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="planning" className="mt-6">
                  <Card className="glass-morphism-card border-0 light:bg-white/90 light:border-primary/15">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Planning & Timeline
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="due-date" className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Due Date
                          </Label>
                          <Input
                            id="due-date"
                            type="date"
                            value={formData.due_date}
                            onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                            className="glass-input border-0 bg-white/5"
                          />
                        </div>

                        <div>
                          <Label htmlFor="estimated-hours" className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Estimated Hours
                          </Label>
                          <Input
                            id="estimated-hours"
                            type="number"
                            placeholder="8"
                            value={formData.estimated_hours}
                            onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: e.target.value }))}
                            className="glass-input border-0 bg-white/5"
                          />
                        </div>
                      </div>

                      <div className="bg-warning/10 p-4 rounded-lg">
                        <h4 className="font-medium mb-2 flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          Collaboration Notes
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          After creating this task, team members can be assigned, and you can continue the discussion
                          in the task comments. The initial discussion will be saved as context for the task.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>

              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="glass-button"
                >
                  Cancel
                </Button>

                <Button
                  onClick={handleCreateTask}
                  disabled={!formData.title || !formData.project_id || isSubmitting}
                  className="bg-gradient-primary hover:shadow-glow"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                  <Plus className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Tasks</p>
                  <p className="text-2xl font-bold">24</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-warning/20 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">8</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-success/20 rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">12</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-destructive/20 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold">2</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10">
          <CardHeader>
            <CardTitle>Getting Started with Task Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">📝 Task Creation Process</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>1. Start with an initial discussion to capture context</li>
                  <li>2. Define clear task details and requirements</li>
                  <li>3. Set timeline and effort estimates</li>
                  <li>4. Create subtasks for complex work items</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🎯 Best Practices</h4>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Keep task titles clear and actionable</li>
                  <li>• Include acceptance criteria in descriptions</li>
                  <li>• Use priority levels to guide work order</li>
                  <li>• Break large tasks into smaller subtasks</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}