import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Filter,
  X,
  Save,
  RefreshCw,
  Calendar,
  Tag,
  User,
  AlertTriangle,
  Settings
} from "lucide-react";
import { Project } from "@/hooks/useProjects";

interface FilterState {
  search: string;
  status: string[];
  priority: string[];
  project: string[];
  assignee: string[];
  dateRange: {
    start: string;
    end: string;
  };
  tags: string[];
}

interface TaskFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  projects: Project[];
}

export function TaskFilters({ 
  isOpen, 
  onClose, 
  filters, 
  onFiltersChange, 
  projects 
}: TaskFiltersProps) {
  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'in_review', label: 'In Review' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'archived', label: 'Archived' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleStatusChange = (status: string, checked: boolean) => {
    const newStatus = checked 
      ? [...filters.status, status]
      : filters.status.filter(s => s !== status);
    onFiltersChange({ ...filters, status: newStatus });
  };

  const handlePriorityChange = (priority: string, checked: boolean) => {
    const newPriority = checked 
      ? [...filters.priority, priority]
      : filters.priority.filter(p => p !== priority);
    onFiltersChange({ ...filters, priority: newPriority });
  };

  const handleProjectChange = (projectId: string, checked: boolean) => {
    const newProjects = checked 
      ? [...filters.project, projectId]
      : filters.project.filter(p => p !== projectId);
    onFiltersChange({ ...filters, project: newProjects });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      status: [],
      priority: [],
      project: [],
      assignee: [],
      dateRange: { start: '', end: '' },
      tags: []
    });
  };

  const hasActiveFilters = 
    filters.search ||
    filters.status.length > 0 ||
    filters.priority.length > 0 ||
    filters.project.length > 0 ||
    filters.assignee.length > 0 ||
    filters.dateRange.start ||
    filters.dateRange.end ||
    filters.tags.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="glass-morphism-card border-0 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-primary-readable font-semibold text-xl flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Advanced Filters
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            Configure detailed filters to find exactly the tasks you need
          </p>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <Card className="glass-morphism-card border-0 bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Search & Text
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="search">Search in title, description, and tags</Label>
                <Input
                  id="search"
                  placeholder="Enter search terms..."
                  value={filters.search}
                  onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
                  className="glass-input border-0 bg-white/5"
                />
              </div>
            </CardContent>
          </Card>

          {/* Status & Priority */}
          <Card className="glass-morphism-card border-0 bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Status & Priority
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-3 block">Status</Label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`status-${option.value}`}
                        checked={filters.status.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handleStatusChange(option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={`status-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {filters.status.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.status.map(status => (
                      <Badge key={status} variant="outline" className="glass-badge border-0 text-xs">
                        {statusOptions.find(s => s.value === status)?.label}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => handleStatusChange(status, false)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Separator className="border-white/10" />

              <div>
                <Label className="mb-3 block">Priority</Label>
                <div className="grid grid-cols-2 gap-2">
                  {priorityOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`priority-${option.value}`}
                        checked={filters.priority.includes(option.value)}
                        onCheckedChange={(checked) => 
                          handlePriorityChange(option.value, checked as boolean)
                        }
                      />
                      <Label htmlFor={`priority-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
                {filters.priority.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.priority.map(priority => (
                      <Badge key={priority} variant="outline" className="glass-badge border-0 text-xs">
                        {priorityOptions.find(p => p.value === priority)?.label}
                        <X 
                          className="w-3 h-3 ml-1 cursor-pointer" 
                          onClick={() => handlePriorityChange(priority, false)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Projects */}
          <Card className="glass-morphism-card border-0 bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <User className="w-4 h-4" />
                Projects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-3 block">Select Projects</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {projects.map((project) => (
                    <div key={project.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`project-${project.id}`}
                        checked={filters.project.includes(project.id)}
                        onCheckedChange={(checked) => 
                          handleProjectChange(project.id, checked as boolean)
                        }
                      />
                      <Label htmlFor={`project-${project.id}`} className="text-sm">
                        {project.name}
                      </Label>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {project.category || 'other'}
                      </Badge>
                    </div>
                  ))}
                </div>
                {filters.project.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filters.project.map(projectId => {
                      const project = projects.find(p => p.id === projectId);
                      return (
                        <Badge key={projectId} variant="outline" className="glass-badge border-0 text-xs">
                          {project?.name || 'Unknown Project'}
                          <X 
                            className="w-3 h-3 ml-1 cursor-pointer" 
                            onClick={() => handleProjectChange(projectId, false)}
                          />
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card className="glass-morphism-card border-0 bg-white/5">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Date Range
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date-start">Start Date</Label>
                  <Input
                    id="date-start"
                    type="date"
                    value={filters.dateRange.start}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, start: e.target.value }
                    })}
                    className="glass-input border-0 bg-white/5"
                  />
                </div>
                <div>
                  <Label htmlFor="date-end">End Date</Label>
                  <Input
                    id="date-end"
                    type="date"
                    value={filters.dateRange.end}
                    onChange={(e) => onFiltersChange({
                      ...filters,
                      dateRange: { ...filters.dateRange, end: e.target.value }
                    })}
                    className="glass-input border-0 bg-white/5"
                  />
                </div>
              </div>
              {(filters.dateRange.start || filters.dateRange.end) && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {filters.dateRange.start && filters.dateRange.end
                      ? `From ${filters.dateRange.start} to ${filters.dateRange.end}`
                      : filters.dateRange.start
                      ? `From ${filters.dateRange.start}`
                      : `Until ${filters.dateRange.end}`
                    }
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 ml-2"
                    onClick={() => onFiltersChange({
                      ...filters,
                      dateRange: { start: '', end: '' }
                    })}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-white/10">
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Badge className="bg-primary text-primary-foreground">
                {[
                  filters.search && 'search',
                  ...filters.status,
                  ...filters.priority,
                  ...filters.project.map(p => 'project'),
                  filters.dateRange.start && 'date-start',
                  filters.dateRange.end && 'date-end'
                ].filter(Boolean).length} active filters
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={clearAllFilters}
              disabled={!hasActiveFilters}
              className="glass-button"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Clear All
            </Button>
            
            <Button
              onClick={onClose}
              className="bg-gradient-primary hover:shadow-glow"
            >
              <Save className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}