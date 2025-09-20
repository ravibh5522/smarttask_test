import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Settings,
  Bell,
  Shield,
  Trash2,
  Archive,
  Calendar,
  DollarSign,
  Users,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";

interface ProjectSettingsProps {
  project: any;
  onUpdate: (projectId: string, updates: any) => void;
}

export function ProjectSettings({ project, onUpdate }: ProjectSettingsProps) {
  const [formData, setFormData] = useState({
    name: project.name || '',
    description: project.description || '',
    visibility: project.visibility || 'private',
    status: project.status || 'planning',
    category: project.category || 'other',
    priority: project.priority || 'medium',
    due_date: project.due_date || '',
    budget: project.budget || '',
    currency: project.currency || 'USD'
  });

  const [notifications, setNotifications] = useState({
    task_updates: true,
    member_changes: true,
    deadline_reminders: true,
    daily_digest: false
  });

  const [permissions, setPermissions] = useState({
    allow_guest_comments: false,
    require_approval_for_tasks: false,
    restrict_file_uploads: false
  });

  const handleSave = () => {
    onUpdate(project.id, formData);
    toast.success("Project settings updated successfully");
  };

  const handleArchive = () => {
    onUpdate(project.id, { archived_at: new Date().toISOString() });
    toast.success("Project archived successfully");
  };

  const handleDelete = () => {
    // This would typically call a delete function
    toast.success("Project deleted successfully");
  };

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            General Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name</Label>
                <Input
                  id="project-name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="glass-input border-0 bg-white/5"
                />
              </div>

              <div>
                <Label htmlFor="project-description">Description</Label>
                <Textarea
                  id="project-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="glass-input border-0 bg-white/5 min-h-[100px]"
                />
              </div>

              <div>
                <Label htmlFor="project-visibility">Visibility</Label>
                <Select 
                  value={formData.visibility} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, visibility: value }))}
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
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="project-status">Status</Label>
                <Select 
                  value={formData.status} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="glass-input border-0 bg-white/5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism-card border-0">
                    <SelectItem value="planning">Planning</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="project-category">Category</Label>
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
                <Label htmlFor="project-priority">Priority</Label>
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
          </div>

          <Separator />

          {/* Timeline & Budget */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <Label htmlFor="due-date" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Due Date
              </Label>
              <Input
                id="due-date"
                type="date"
                value={formData.due_date ? formData.due_date.split('T')[0] : ''}
                onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                className="glass-input border-0 bg-white/5"
              />
            </div>

            <div>
              <Label htmlFor="budget" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Budget
              </Label>
              <Input
                id="budget"
                type="number"
                placeholder="0.00"
                value={formData.budget}
                onChange={(e) => setFormData(prev => ({ ...prev, budget: e.target.value }))}
                className="glass-input border-0 bg-white/5"
              />
            </div>

            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger className="glass-input border-0 bg-white/5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="glass-morphism-card border-0">
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} className="glass-morphism-button bg-gradient-primary border-0">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(notifications).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="font-medium">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for {key.replace(/_/g, ' ')}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Permissions */}
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Project Permissions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(permissions).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <Label className="font-medium">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {key === 'allow_guest_comments' && 'Allow non-members to comment on tasks'}
                  {key === 'require_approval_for_tasks' && 'All new tasks require admin approval'}
                  {key === 'restrict_file_uploads' && 'Only admins can upload files'}
                </p>
              </div>
              <Switch
                checked={value}
                onCheckedChange={(checked) => 
                  setPermissions(prev => ({ ...prev, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="glass-morphism-card border-0 border-destructive/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 glass-morphism-card rounded-lg border border-warning/20">
            <div>
              <h4 className="font-medium">Archive Project</h4>
              <p className="text-sm text-muted-foreground">
                Archive this project. It will be hidden from the dashboard but can be restored.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="border-warning text-warning">
                  <Archive className="w-4 h-4 mr-2" />
                  Archive
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-morphism-card border-0">
                <AlertDialogHeader>
                  <AlertDialogTitle>Archive Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to archive "{project.name}"? This will hide the project from your dashboard, but you can restore it later.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleArchive}>Archive Project</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <div className="flex items-center justify-between p-4 glass-morphism-card rounded-lg border border-destructive/20">
            <div>
              <h4 className="font-medium text-destructive">Delete Project</h4>
              <p className="text-sm text-muted-foreground">
                Permanently delete this project and all its data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="glass-morphism-card border-0">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Project</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to permanently delete "{project.name}"? This will delete all tasks, files, and project data. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
                    Delete Project
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}