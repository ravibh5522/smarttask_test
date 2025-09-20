import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Search,
  Filter,
  MoreHorizontal,
  Download,
  Upload,
  Grid3X3,
  List,
  Calendar,
  SortAsc,
  Eye,
  Edit,
  Trash2,
  Copy,
  Archive,
  Tag,
  Clock,
  User,
  AlertTriangle,
  Target,
  FileText,
  Settings,
  Save,
  RefreshCw
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { TaskCreateWizard } from "@/components/tasks/TaskCreateWizard";
import { TaskImportExport } from "@/components/tasks/TaskImportExport";
import { TaskFilters } from "@/components/tasks/TaskFilters";
import { TaskKanbanView } from "@/components/tasks/TaskKanbanView";
import { TaskListView } from "@/components/tasks/TaskListView";
import { TaskCalendarView } from "@/components/tasks/TaskCalendarView";
import { TaskBulkActions } from "@/components/tasks/TaskBulkActions";
import { toast } from "sonner";
import { format } from "date-fns";

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

export default function TasksAdvanced() {
  const { tasks, loading } = useTasks();
  const { projects } = useProjects();
  
  // View and UI State
  const [currentView, setCurrentView] = useState<'list' | 'kanban' | 'calendar'>('list');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [isImportExportOpen, setIsImportExportOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Filter State
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    priority: [],
    project: [],
    assignee: [],
    dateRange: { start: '', end: '' },
    tags: []
  });

  // Derived State
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        task.title.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.category?.toLowerCase().includes(searchLower) ||
        task.tags?.some(tag => tag.toLowerCase().includes(searchLower));
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status.length > 0 && !filters.status.includes(task.status)) {
      return false;
    }

    // Priority filter
    if (filters.priority.length > 0 && !filters.priority.includes(task.priority)) {
      return false;
    }

    // Project filter
    if (filters.project.length > 0 && !filters.project.includes(task.project_id)) {
      return false;
    }

    // Date range filter
    if (filters.dateRange.start && task.due_date) {
      if (new Date(task.due_date) < new Date(filters.dateRange.start)) return false;
    }
    if (filters.dateRange.end && task.due_date) {
      if (new Date(task.due_date) > new Date(filters.dateRange.end)) return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(filterTag => 
        task.tags?.includes(filterTag)
      );
      if (!hasMatchingTag) return false;
    }

    return true;
  });

  // Statistics
  const stats = {
    total: filteredTasks.length,
    completed: filteredTasks.filter(t => t.status === 'completed').length,
    inProgress: filteredTasks.filter(t => t.status === 'in_progress').length,
    overdue: filteredTasks.filter(t => 
      t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed'
    ).length,
    highPriority: filteredTasks.filter(t => 
      t.priority === 'high' || t.priority === 'urgent'
    ).length
  };

  // Handlers
  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTasks([...selectedTasks, taskId]);
    } else {
      setSelectedTasks(selectedTasks.filter(id => id !== taskId));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTasks(filteredTasks.map(task => task.id));
    } else {
      setSelectedTasks([]);
    }
  };

  const clearFilters = () => {
    setFilters({
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

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen glass-morphism-bg">
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass-morphism-card border-0">
                <CardContent className="p-6">
                  <div className="animate-pulse">
                    <div className="h-8 bg-white/20 rounded mb-2"></div>
                    <div className="h-4 bg-white/20 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="glass-morphism-card border-0">
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-16 bg-white/20 rounded"></div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="glass-morphism-card p-6 rounded-xl border-0">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div>
                            <h1 className="text-3xl font-bold text-primary-readable">
                Advanced Task Management
              </h1>
              <p className="text-muted-foreground mt-1">
                Organize, track, and manage all your tasks in one place
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsImportExportOpen(true)}
                className="glass-button"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import/Export
              </Button>
              
              <Button
                onClick={() => setIsCreateWizardOpen(true)}
                className="bg-gradient-primary hover:shadow-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Task
              </Button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="glass-morphism-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-xl font-bold">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-xl font-bold">{stats.inProgress}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-xl font-bold">{stats.completed}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-ai rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-xl font-bold text-destructive">{stats.overdue}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                  <p className="text-xl font-bold">{stats.highPriority}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Controls */}
        <Card className="glass-morphism-card border-0">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search tasks..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="pl-10 glass-input border-0 bg-white/5"
                />
              </div>

              {/* Quick Filters */}
              <div className="flex items-center gap-2">
                <Select
                  value={filters.status.length === 1 ? filters.status[0] : ''}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      status: value ? [value] : [] 
                    }))
                  }
                >
                  <SelectTrigger className="w-32 glass-input border-0 bg-white/5">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism-card border-0">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="blocked">Blocked</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={filters.priority.length === 1 ? filters.priority[0] : ''}
                  onValueChange={(value) => 
                    setFilters(prev => ({ 
                      ...prev, 
                      priority: value ? [value] : [] 
                    }))
                  }
                >
                  <SelectTrigger className="w-32 glass-input border-0 bg-white/5">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism-card border-0">
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setIsFiltersOpen(true)}
                  className="glass-button"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Advanced
                  {hasActiveFilters && (
                    <Badge className="ml-2 bg-primary text-primary-foreground">
                      {Object.values(filters).flat().filter(Boolean).length}
                    </Badge>
                  )}
                </Button>

                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    onClick={clearFilters}
                    className="glass-button"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                )}
              </div>

              {/* View Toggle */}
              <Tabs value={currentView} onValueChange={(value: any) => setCurrentView(value)}>
                <TabsList className="glass-morphism-card border-0 bg-white/5">
                  <TabsTrigger value="list" className="data-[state=active]:bg-white/10">
                    <List className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="kanban" className="data-[state=active]:bg-white/10">
                    <Grid3X3 className="w-4 h-4" />
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="data-[state=active]:bg-white/10">
                    <Calendar className="w-4 h-4" />
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground">Active filters:</span>
                  
                  {filters.search && (
                    <Badge variant="outline" className="glass-badge border-0">
                      Search: {filters.search}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                      >
                        ×
                      </Button>
                    </Badge>
                  )}

                  {filters.status.map(status => (
                    <Badge key={status} variant="outline" className="glass-badge border-0">
                      Status: {status}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          status: prev.status.filter(s => s !== status) 
                        }))}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}

                  {filters.priority.map(priority => (
                    <Badge key={priority} variant="outline" className="glass-badge border-0">
                      Priority: {priority}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-1"
                        onClick={() => setFilters(prev => ({ 
                          ...prev, 
                          priority: prev.priority.filter(p => p !== priority) 
                        }))}
                      >
                        ×
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedTasks.length > 0 && (
          <Card className="glass-morphism-card border-0">
            <CardContent className="p-4">
              <TaskBulkActions
                selectedTasks={selectedTasks}
                onClearSelection={() => setSelectedTasks([])}
              />
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {currentView === 'list' && (
            <TaskListView
              tasks={filteredTasks}
              selectedTasks={selectedTasks}
              onSelectTask={handleSelectTask}
              onSelectAll={handleSelectAll}
            />
          )}

          {currentView === 'kanban' && (
            <TaskKanbanView
              tasks={filteredTasks}
              selectedTasks={selectedTasks}
              onSelectTask={handleSelectTask}
            />
          )}

          {currentView === 'calendar' && (
            <TaskCalendarView
              tasks={filteredTasks}
              selectedTasks={selectedTasks}
              onSelectTask={handleSelectTask}
              onTaskUpdate={(task) => {
                // Handle task update
                toast.success("Task updated successfully");
              }}
              onTaskCreate={(date) => {
                setIsCreateWizardOpen(true);
                // Pre-fill with the selected date
                console.log("Creating task for date:", date);
              }}
            />
          )}
        </div>

        {/* Empty State */}
        {filteredTasks.length === 0 && !loading && (
          <Card className="glass-morphism-card border-0 text-center p-12">
            <CardContent>
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-2">
                {hasActiveFilters ? 'No tasks match your filters' : 'No tasks yet'}
              </h3>
              <p className="text-muted-foreground mb-6">
                {hasActiveFilters 
                  ? 'Try adjusting your search criteria or clear filters to see more tasks.'
                  : 'Get started by creating your first task to organize your work.'
                }
              </p>
              <div className="flex items-center justify-center gap-3">
                {hasActiveFilters ? (
                  <Button 
                    onClick={clearFilters}
                    variant="outline"
                    className="glass-button"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Clear Filters
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setIsCreateWizardOpen(true)}
                    className="bg-gradient-primary hover:shadow-glow"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Task
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Modals */}
        <TaskCreateWizard
          isOpen={isCreateWizardOpen}
          onClose={() => setIsCreateWizardOpen(false)}
          projectId=""
        />

        <TaskImportExport
          isOpen={isImportExportOpen}
          onClose={() => setIsImportExportOpen(false)}
          tasks={filteredTasks}
        />

        <TaskFilters
          isOpen={isFiltersOpen}
          onClose={() => setIsFiltersOpen(false)}
          filters={filters}
          onFiltersChange={setFilters}
          projects={projects}
        />
      </div>
    </div>
  );
}