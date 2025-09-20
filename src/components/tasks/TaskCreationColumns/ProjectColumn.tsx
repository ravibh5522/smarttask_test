import { useState, memo, useMemo, useCallback } from "react";
import { Plus, Folder, Settings, MoreVertical } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/useProjects";
import { useVirtualScrolling } from "@/hooks/useVirtualScrolling";
import { ColumnLoadingSkeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description?: string;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

interface ProjectColumnProps {
  projects: Project[];
  loading: boolean;
  selectedProjectId?: string;
  onProjectSelect: (projectId: string) => void;
  searchTerm: string;
}

export const ProjectColumn = memo(function ProjectColumn({
  projects,
  loading,
  selectedProjectId,
  onProjectSelect,
  searchTerm
}: ProjectColumnProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    visibility: 'private' as 'public' | 'private'
  });
  
  const { createProject } = useProjects();

  const filteredProjects = useMemo(() => 
    projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase())
    ), [projects, searchTerm]
  );

  const handleCreateProject = useCallback(async () => {
    if (!newProject.name.trim()) {
      toast.error("Project name is required");
      return;
    }

    try {
      await createProject({
        name: newProject.name.trim(),
        description: newProject.description.trim() || undefined,
        visibility: newProject.visibility
      });
      
      setNewProject({ name: '', description: '', visibility: 'private' });
      setIsCreating(false);
      toast.success("Project created successfully!");
    } catch (error) {
      toast.error("Failed to create project");
    }
  }, [createProject, newProject]);

  const cancelCreate = useCallback(() => {
    setNewProject({ name: '', description: '', visibility: 'private' });
    setIsCreating(false);
  }, []);

  const handleProjectClick = useCallback((projectId: string) => {
    onProjectSelect(projectId);
  }, [onProjectSelect]);

  // Virtual scrolling for projects
  const {
    containerProps,
    scrollElementProps,
    virtualItems,
    getItemProps,
  } = useVirtualScrolling({
    items: filteredProjects,
    itemHeight: 85, // Approximate height of each project card
    containerHeight: 400, // Height of the scrollable container
    overscan: 3,
  });

  if (loading) {
    return <ColumnLoadingSkeleton title="Projects" count={5} />;
  }

  return (
    <Card className="glass-morphism-card border-0 h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Folder className="w-5 h-5" />
            Projects
            <Badge variant="secondary" className="text-xs">
              {filteredProjects.length}
            </Badge>
          </CardTitle>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsCreating(true)}
            className="h-8 w-8 p-0"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-3">
        {/* Create Project Form */}
        {isCreating && (
          <div className="space-y-3 p-3 glass-morphism-card rounded-lg border-0 bg-white/5 mb-4">
            <Input
              placeholder="Project name"
              value={newProject.name}
              onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
              className="glass-input border-0 bg-white/5"
            />
            <Textarea
              placeholder="Description (optional)"
              value={newProject.description}
              onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
              className="glass-input border-0 bg-white/5 min-h-[60px]"
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleCreateProject} className="flex-1">
                Create
              </Button>
              <Button size="sm" variant="outline" onClick={cancelCreate} className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Projects List with Virtual Scrolling */}
        <div {...containerProps}>
          <div {...scrollElementProps}>
            {filteredProjects.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Folder className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No projects found</p>
                {!isCreating && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsCreating(true)}
                    className="mt-3"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Project
                  </Button>
                )}
              </div>
            ) : (
              virtualItems.map((virtualItem) => {
                const project = filteredProjects[virtualItem.index];
                return (
                  <div
                    {...getItemProps(virtualItem)}
                    key={project.id}
                  >
                    <div
                      className={`p-3 rounded-lg border cursor-pointer transition-all hover:bg-white/5 mx-2 my-1 ${
                        selectedProjectId === project.id
                          ? 'border-primary/50 bg-primary/10'
                          : 'border-white/10 glass-morphism-card'
                      }`}
                      onClick={() => handleProjectClick(project.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Folder className="w-4 h-4 text-primary" />
                            <h3 className="font-medium text-sm truncate">
                              {project.name}
                            </h3>
                          </div>
                          {project.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                              {project.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={project.visibility === 'public' ? 'default' : 'secondary'} 
                              className="text-xs"
                            >
                              {project.visibility}
                            </Badge>
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
                            <DropdownMenuItem>
                              <Settings className="w-4 h-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
