import { useState, useCallback, useMemo } from "react";
import { Plus, Folder, File, ChevronRight, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { ProjectColumn } from "./TaskCreationColumns/ProjectColumn";
import { TaskColumn } from "./TaskCreationColumns/TaskColumn";
import { SubtaskColumn } from "./TaskCreationColumns/SubtaskColumn";
import { PreviewColumn } from "./TaskCreationColumns/PreviewColumn";

export interface NavigationState {
  selectedProjectId?: string;
  selectedTaskId?: string;
  selectedSubtaskId?: string;
}

export function TaskCreationSystem() {
  const [navigation, setNavigation] = useState<NavigationState>({});
  const [searchTerm, setSearchTerm] = useState("");
  
  const { projects, loading: projectsLoading } = useProjects();
  const { tasks, loading: tasksLoading } = useTasks(navigation.selectedProjectId);

  const handleProjectSelect = useCallback((projectId: string) => {
    setNavigation({
      selectedProjectId: projectId,
      selectedTaskId: undefined,
      selectedSubtaskId: undefined
    });
  }, []);

  const handleTaskSelect = useCallback((taskId: string) => {
    setNavigation(prev => ({
      ...prev,
      selectedTaskId: taskId,
      selectedSubtaskId: undefined
    }));
  }, []);

  const handleSubtaskSelect = useCallback((subtaskId: string) => {
    setNavigation(prev => ({
      ...prev,
      selectedSubtaskId: subtaskId
    }));
  }, []);

  const breadcrumbItems = useMemo(() => {
    const items = [];
    
    if (navigation.selectedProjectId) {
      const project = projects.find(p => p.id === navigation.selectedProjectId);
      items.push({ type: 'project', name: project?.name || 'Project', id: navigation.selectedProjectId });
    }
    
    if (navigation.selectedTaskId) {
      const task = tasks.find(t => t.id === navigation.selectedTaskId);
      items.push({ type: 'task', name: task?.title || 'Task', id: navigation.selectedTaskId });
    }
    
    if (navigation.selectedSubtaskId) {
      const subtask = tasks.find(t => t.id === navigation.selectedSubtaskId);
      items.push({ type: 'subtask', name: subtask?.title || 'Subtask', id: navigation.selectedSubtaskId });
    }
    
    return items;
  }, [navigation, projects, tasks]);

  return (
    <div className="space-y-6">
      {/* Header with Search and Breadcrumb */}
      <div className="glass-morphism-card p-4 rounded-lg border-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects, tasks, or subtasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-80 glass-input border-0 bg-white/5"
            />
          </div>
          <Button variant="outline" size="sm" className="glass-button">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
        
        {/* Breadcrumb Navigation */}
        {breadcrumbItems.length > 0 && (
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Folder className="w-4 h-4" />
            {breadcrumbItems.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-2">
                {index > 0 && <ChevronRight className="w-3 h-3" />}
                <span className="font-medium text-primary-readable">
                  {item.name}
                </span>
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 4-Column Layout */}
      <div className="grid grid-cols-4 gap-4 h-[calc(100vh-12rem)]">
        {/* Column 1: Projects */}
        <ProjectColumn
          projects={projects}
          loading={projectsLoading}
          selectedProjectId={navigation.selectedProjectId}
          onProjectSelect={handleProjectSelect}
          searchTerm={searchTerm}
        />

        {/* Column 2: Tasks */}
        <TaskColumn
          tasks={tasks.filter(t => !t.parent_task_id)}
          loading={tasksLoading}
          selectedTaskId={navigation.selectedTaskId}
          onTaskSelect={handleTaskSelect}
          searchTerm={searchTerm}
          projectId={navigation.selectedProjectId}
        />

        {/* Column 3: Subtasks */}
        <SubtaskColumn
          subtasks={tasks.filter(t => t.parent_task_id === navigation.selectedTaskId)}
          loading={tasksLoading}
          selectedSubtaskId={navigation.selectedSubtaskId}
          onSubtaskSelect={handleSubtaskSelect}
          searchTerm={searchTerm}
          parentTaskId={navigation.selectedTaskId}
          projectId={navigation.selectedProjectId}
        />

        {/* Column 4: Preview & Features */}
        <PreviewColumn
          selectedProjectId={navigation.selectedProjectId}
          selectedTaskId={navigation.selectedTaskId}
          selectedSubtaskId={navigation.selectedSubtaskId}
          projects={projects}
          tasks={tasks}
        />
      </div>
    </div>
  );
}
