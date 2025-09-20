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
import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Users,
  Target,
  FileText,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { useProjectTemplates } from "@/hooks/useProjectTemplates";
import { useProjects } from "@/hooks/useProjects";
import { toast } from "sonner";

interface ProjectCreateWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProjectFormData {
  name: string;
  description: string;
  visibility: 'private' | 'internal' | 'public';
  category: string;
  priority: string;
  due_date: string;
  template_id?: string;
}

export function ProjectCreateWizard({ isOpen, onClose }: ProjectCreateWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ProjectFormData>({
    name: '',
    description: '',
    visibility: 'private',
    category: 'other',
    priority: 'medium',
    due_date: '',
    template_id: undefined
  });

  const { templates } = useProjectTemplates();
  const { createProject } = useProjects();
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createProject({
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        visibility: formData.visibility,
        category: formData.category as any,
        priority: formData.priority,
        due_date: formData.due_date || undefined
      });
      
      if (result) {
        toast.success("Project created successfully!");
        onClose();
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          visibility: 'private',
          category: 'other',
          priority: 'medium',
          due_date: '',
          template_id: undefined
        });
        setCurrentStep(1);
      }
    } catch (error: any) {
      // Error already handled in createProject
      console.error("Project creation failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        template_id: templateId,
        name: template.name,
        description: template.description || '',
        category: template.category
      }));
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1:
        return <Target className="w-5 h-5" />;
      case 2:
        return <Sparkles className="w-5 h-5" />;
      case 3:
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return <Target className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-morphism-card border-0 max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-readable font-semibold text-xl">
            Create New Project
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
                  Project Basics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="project-name">Project Name *</Label>
                  <Input
                    id="project-name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter project name"
                    className="glass-input border-0 bg-white/5"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="project-description">Description</Label>
                  <Textarea
                    id="project-description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe your project..."
                    className="glass-input border-0 bg-white/5 min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Visibility</Label>
                    <Select 
                      value={formData.visibility} 
                      onValueChange={(value: any) => setFormData(prev => ({ ...prev, visibility: value }))}
                    >
                      <SelectTrigger className="glass-input border-0 bg-white/5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="glass-morphism-card border-0">
                        <SelectItem value="private">Private</SelectItem>
                        <SelectItem value="internal">Internal</SelectItem>
                        <SelectItem value="public">Public</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Priority</Label>
                    <Select 
                      value={formData.priority} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
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
                </div>
              </CardContent>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Choose Template (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="glass-input border-0 bg-white/5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-morphism-card border-0">
                      <SelectItem value="web_development">Web Development</SelectItem>
                      <SelectItem value="mobile_app">Mobile App</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="research">Research</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                      <SelectItem value="consulting">Consulting</SelectItem>
                      <SelectItem value="product">Product</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Project Templates</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    {templates
                      .filter(template => !formData.category || template.category === formData.category)
                      .slice(0, 4)
                      .map((template) => (
                        <Card 
                          key={template.id}
                          className={`glass-morphism-card border-0 cursor-pointer transition-all hover:shadow-glow ${
                            formData.template_id === template.id ? 'ring-2 ring-primary' : ''
                          }`}
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-medium">{template.name}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {template.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <Badge variant="outline" className="glass-badge border-0 text-xs">
                                    {template.category}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    Used {template.usage_count} times
                                  </span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                  </div>
                  
                  {formData.template_id && (
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setFormData(prev => ({ ...prev, template_id: undefined }))}
                    >
                      Clear Template Selection
                    </Button>
                  )}
                </div>
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
                  <Label htmlFor="due-date" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Due Date (Optional)
                  </Label>
                  <Input
                    id="due-date"
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                    className="glass-input border-0 bg-white/5"
                  />
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-4">Project Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Project Name</Label>
                        <p className="font-medium">{formData.name || 'Untitled Project'}</p>
                      </div>
                      
                      <div>
                        <Label className="text-sm text-muted-foreground">Description</Label>
                        <p className="text-sm">{formData.description || 'No description provided'}</p>
                      </div>

                      <div className="flex gap-4">
                        <div>
                          <Label className="text-sm text-muted-foreground">Visibility</Label>
                          <Badge className="block mt-1 w-fit">
                            {formData.visibility}
                          </Badge>
                        </div>
                        <div>
                          <Label className="text-sm text-muted-foreground">Priority</Label>
                          <Badge className="block mt-1 w-fit">
                            {formData.priority}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Category</Label>
                        <p className="font-medium capitalize">{formData.category.replace('_', ' ')}</p>
                      </div>

                      {formData.due_date && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Due Date</Label>
                          <p className="font-medium">
                            {new Date(formData.due_date).toLocaleDateString()}
                          </p>
                        </div>
                      )}

                      {formData.template_id && (
                        <div>
                          <Label className="text-sm text-muted-foreground">Template</Label>
                          <p className="font-medium">
                            {templates.find(t => t.id === formData.template_id)?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
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
              disabled={!formData.name}
              className="bg-gradient-primary hover:shadow-glow"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || isSubmitting}
              className="bg-gradient-primary hover:shadow-glow"
            >
              {isSubmitting ? 'Creating...' : 'Create Project'}
              <CheckCircle2 className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}