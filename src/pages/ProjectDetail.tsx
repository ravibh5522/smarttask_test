import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  ArrowLeft,
  Settings,
  Users,
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Activity,
  MoreVertical,
  Edit,
  Archive,
  Trash2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { ProjectOverview } from "@/components/project/ProjectOverview";
import { ProjectTasks } from "@/components/project/ProjectTasks";
import { ProjectTeam } from "@/components/project/ProjectTeam";
import { ProjectActivity } from "@/components/project/ProjectActivity";
import { ProjectFiles } from "@/components/project/ProjectFiles";
import { ProjectSettings } from "@/components/project/ProjectSettings";
import { format } from "date-fns";

export default function ProjectDetail() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { projects, loading: projectsLoading, updateProject, deleteProject } = useProjects();
  const { tasks } = useTasks(projectId);
  const { members } = useTeamMembers(projectId);
  const [activeTab, setActiveTab] = useState("overview");

  // Find the current project
  const project = projects.find(p => p.id === projectId);

  useEffect(() => {
    if (!projectsLoading && !project) {
      toast.error("Project not found");
      navigate("/dashboard/projects");
    }
  }, [project, projectsLoading, navigate]);

  if (projectsLoading) {
    return (
      <div className="flex flex-col min-h-screen glass-morphism-bg">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="glass-morphism-card border-0">
                <CardContent className="p-6">
                  <Skeleton className="h-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  const handleArchiveProject = () => {
    updateProject(project.id, { archived_at: new Date().toISOString() });
    toast.success("Project archived successfully");
  };

  const handleDeleteProject = () => {
    if (window.confirm("Are you sure you want to delete this project? This action cannot be undone.")) {
      deleteProject(project.id);
      navigate("/dashboard/projects");
    }
  };

  const getStatusColor = (status?: string | null) => {
    if (!status) return 'bg-muted text-muted-foreground';
    const colors = {
      'planning': 'bg-warning text-warning-foreground',
      'active': 'bg-success text-success-foreground',
      'on_hold': 'bg-muted text-muted-foreground',
      'completed': 'bg-primary text-primary-foreground',
      'cancelled': 'bg-destructive text-destructive-foreground',
      'archived': 'bg-muted text-muted-foreground'
    };
    return colors[status as keyof typeof colors] || 'bg-muted text-muted-foreground';
  };

  const getPriorityColor = (priority?: string | null) => {
    if (!priority) return 'text-muted-foreground';
    const colors = {
      'low': 'text-success',
      'medium': 'text-warning',
      'high': 'text-destructive',
      'urgent': 'text-destructive font-semibold'
    };
    return colors[priority as keyof typeof colors] || 'text-muted-foreground';
  };

  // Calculate project stats
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const totalTasks = tasks.length;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="glass-morphism-card p-6 rounded-xl border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard/projects")}
                className="glass-morphism-button border-0 bg-white/5"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-primary-readable">
                    {project.name}
                  </h1>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge className={`${getStatusColor(project.status)}`}>
                      {project.status || 'planning'}
                    </Badge>
                    <Badge variant="outline" className="glass-badge border-0">
                      {project.category || 'other'}
                    </Badge>
                    {project.priority && (
                      <span className={`text-sm font-medium ${getPriorityColor(project.priority)}`}>
                        {project.priority} priority
                      </span>
                    )}
                    <span className="text-sm text-muted-foreground">
                      Created {format(new Date(project.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="glass-morphism-button border-0 bg-white/5">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-morphism-card border-0">
                <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab("settings")}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleArchiveProject}>
                  <Archive className="w-4 h-4 mr-2" />
                  Archive Project
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDeleteProject} className="text-destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {project.description && (
            <p className="text-muted-foreground mt-4 max-w-2xl">
              {project.description}
            </p>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-morphism-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Progress</p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold">{progressPercentage}%</span>
                    <Progress value={progressPercentage} className="w-16 h-2" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                  <p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-accent rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Team Members</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-ai rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Due Date</p>
                  <p className="text-lg font-semibold">
                    {project.due_date 
                      ? format(new Date(project.due_date), 'MMM d, yyyy')
                      : 'Not set'
                    }
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="glass-morphism-card border-0 bg-white/5">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/10">
              <TrendingUp className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-white/10">
              <FileText className="w-4 h-4 mr-2" />
              Tasks ({totalTasks})
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-white/10">
              <Users className="w-4 h-4 mr-2" />
              Team ({members.length})
            </TabsTrigger>
            <TabsTrigger value="files" className="data-[state=active]:bg-white/10">
              <FileText className="w-4 h-4 mr-2" />
              Files
            </TabsTrigger>
            <TabsTrigger value="activity" className="data-[state=active]:bg-white/10">
              <Activity className="w-4 h-4 mr-2" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-white/10">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <ProjectOverview project={project} tasks={tasks} members={members} />
          </TabsContent>

          <TabsContent value="tasks">
            <ProjectTasks projectId={projectId!} />
          </TabsContent>

          <TabsContent value="team">
            <ProjectTeam projectId={projectId!} />
          </TabsContent>

          <TabsContent value="files">
            <ProjectFiles projectId={projectId!} />
          </TabsContent>

          <TabsContent value="activity">
            <ProjectActivity projectId={projectId!} />
          </TabsContent>

          <TabsContent value="settings">
            <ProjectSettings project={project} onUpdate={updateProject} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}