import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Users,
  Calendar,
  Target,
  TrendingUp,
  Clock
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { TeamMembersModal } from "@/components/team/TeamMembersModal";
import { TeamInvitationModal } from "@/components/team/TeamInvitationModal";
import { ProjectCreateWizard } from "@/components/project/ProjectCreateWizard";
import { format } from "date-fns";

export default function Projects() {
  const navigate = useNavigate();
  const { projects, loading: projectsLoading, createProject, updateProject, deleteProject } = useProjects();
  const { tasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateWizardOpen, setIsCreateWizardOpen] = useState(false);
  const [selectedProjectForTeam, setSelectedProjectForTeam] = useState<string | null>(null);
  const [isTeamMembersOpen, setIsTeamMembersOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const handleCreateProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createProject({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      visibility: (formData.get('visibility') as any) || 'private',
    });
    
    setIsCreateWizardOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  // Calculate project stats from tasks
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project_id === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'completed');
    const progress = projectTasks.length > 0 ? (completedTasks.length / projectTasks.length) * 100 : 0;
    
    return {
      tasksTotal: projectTasks.length,
      tasksComplete: completedTasks.length,
      progress: Math.round(progress)
    };
  };

  if (projectsLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-secondary">
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track all your projects in one place.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="animate-pulse">
                  <div className="h-4 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-muted rounded animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getVisibilityColor = (visibility: string) => {
    switch (visibility) {
      case "public": return "bg-success text-success-foreground";
      case "internal": return "bg-warning text-warning-foreground";
      case "private": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getProjectColor = (index: number) => {
    const colors = [
      "bg-gradient-primary",
      "bg-gradient-secondary", 
      "bg-gradient-ai",
      "bg-gradient-accent"
    ];
    return colors[index % colors.length];
  };

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (project.description?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="glass-morphism-card p-6 rounded-xl border-0">
            <h1 className="text-3xl font-bold text-primary-readable">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and track all your projects in one place.
            </p>
          </div>
          
          <Button 
            className="glass-morphism-button bg-gradient-primary hover:shadow-glow transition-smooth border-0"
            onClick={() => setIsCreateWizardOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="glass-morphism-card p-4 rounded-xl border-0">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Search projects..." 
                className="pl-10 glass-input border-0 bg-white/5"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Button variant="outline" size="sm" className="glass-morphism-button border-0 bg-white/5">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </Button>
            
            <Button variant="outline" size="sm" className="glass-morphism-button border-0 bg-white/5">
              <Calendar className="w-4 h-4 mr-2" />
              Due Date
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {filteredProjects.map((project, index) => {
            const stats = getProjectStats(project.id);
            return (
              <Card 
                key={project.id} 
                className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10 hover:shadow-glow light:hover:shadow-md transition-smooth group hover-scale cursor-pointer"
                onClick={() => navigate(`/dashboard/projects/${project.id}`)}
              >
                <CardHeader className="pb-3 p-4 sm:p-6">
                  <div className="flex items-start justify-between">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 ${getProjectColor(index)} rounded-lg flex items-center justify-center mb-3 flex-shrink-0`}>
                      <Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity glass-morphism-button border-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="glass-morphism-card border-0 light:bg-white/95 light:border-primary/20">
                        <DropdownMenuItem>Edit Project</DropdownMenuItem>
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProjectForTeam(project.id);
                            setIsTeamMembersOpen(true);
                          }}
                        >
                          <Users className="w-4 h-4 mr-2" />
                          Manage Team
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProjectForTeam(project.id);
                            setIsInviteModalOpen(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Invite Members
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProject(project.id);
                          }}
                        >
                          Delete Project
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  <div>
                    <CardTitle className="text-base sm:text-lg mb-1 line-clamp-1">{project.name}</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                      {project.description || "No description provided"}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  {/* Progress */}
                  <div>
                    <div className="flex justify-between text-xs sm:text-sm mb-2">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{stats.progress}%</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-1.5 sm:h-2">
                      <div 
                        className="bg-gradient-primary h-1.5 sm:h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${stats.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{project.member_count || 1} members</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                      <span className="truncate">{format(new Date(project.created_at), 'MMM d')}</span>
                    </div>
                  </div>

                  {/* Tasks */}
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="text-muted-foreground">Tasks</span>
                    <span className="font-medium">
                      {stats.tasksComplete}/{stats.tasksTotal}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1 sm:-space-x-2">
                      <Avatar className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-background">
                        <AvatarFallback className="text-xs">
                          You
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getVisibilityColor(project.visibility)} text-xs`}>
                        {project.visibility}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try adjusting your search terms." : "Get started by creating your first project."}
            </p>
            <Button 
              className="bg-gradient-primary"
              onClick={() => setIsCreateWizardOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}

        {/* Project Creation Wizard */}
        <ProjectCreateWizard 
          isOpen={isCreateWizardOpen}
          onClose={() => setIsCreateWizardOpen(false)}
        />

        {/* Team Management Modals */}
        {selectedProjectForTeam && (
          <>
            <TeamMembersModal 
              projectId={selectedProjectForTeam}
              isOpen={isTeamMembersOpen}
              onClose={() => {
                setIsTeamMembersOpen(false);
                setSelectedProjectForTeam(null);
              }}
            />
            <TeamInvitationModal 
              projectId={selectedProjectForTeam}
              isOpen={isInviteModalOpen}
              onClose={() => {
                setIsInviteModalOpen(false);
                setSelectedProjectForTeam(null);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}