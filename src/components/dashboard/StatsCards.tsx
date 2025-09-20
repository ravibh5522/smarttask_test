import { Clock, CheckCircle, AlertTriangle, BarChart3, Plus, Filter, Users, TrendingUp, Target, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function StatsCards() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tasks, loading: tasksLoading, createTask } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const { members } = useTeamMembers(projects[0]?.id);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (tasksLoading || projectsLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i} className="glass-morphism-card border-0">
            <CardHeader className="animate-pulse p-3 sm:p-4">
              <div className="h-3 sm:h-4 bg-muted rounded"></div>
            </CardHeader>
            <CardContent className="p-3 sm:p-4 pt-0">
              <div className="h-6 sm:h-8 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const completedTasks = tasks.filter(task => task.status === 'completed');
  const overdueTasks = tasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );
  const inProgressTasks = tasks.filter(task => task.status === 'in_progress');
  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;

  const handleCreateTask = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await createTask({
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      priority: (formData.get('priority') as any) || 'medium',
    });
    
    setIsCreateDialogOpen(false);
    (e.target as HTMLFormElement).reset();
  };

  const handleCardClick = (cardType: string) => {
    switch (cardType) {
      case 'tasks':
        navigate('/dashboard/focus');
        break;
      case 'overdue':
        navigate('/dashboard/focus');
        break;
      case 'team':
        navigate('/dashboard/team');
        break;
      case 'completion':
        navigate('/dashboard/reports');
        break;
      case 'projects':
        navigate('/dashboard/projects');
        break;
      case 'ai':
        navigate('/dashboard/ai');
        break;
      default:
        break;
    }
  };

  const stats = [
    {
      id: 'tasks',
      title: "Active Tasks",
      value: tasks.length.toString(),
      change: `${inProgressTasks.length} in progress`,
      changeType: "positive" as const,
      icon: CheckCircle,
      description: "Total tasks",
      clickable: true
    },
    {
      id: 'overdue',
      title: "Due Today", 
      value: overdueTasks.length.toString(),
      change: overdueTasks.length > 0 ? "Need attention" : "All caught up",
      changeType: overdueTasks.length > 0 ? "negative" as const : "positive" as const,
      icon: Clock,
      description: "Overdue tasks",
      clickable: true
    },
    {
      id: 'team',
      title: "Team Members",
      value: members.length.toString(),
      change: "Active members",
      changeType: "positive" as const, 
      icon: Users,
      description: "Active contributors",
      clickable: true
    },
    {
      id: 'completion',
      title: "Completion Rate",
      value: `${Math.round(completionRate)}%`,
      change: completionRate > 75 ? "Excellent" : completionRate > 50 ? "Good" : "Needs focus",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "This week's performance",
      clickable: true
    },
    {
      id: 'projects',
      title: "Projects",
      value: projects.length.toString(),
      change: "Active projects",
      changeType: "positive" as const,
      icon: Target, 
      description: "Total projects",
      clickable: true
    },
    {
      id: 'ai',
      title: "AI Assistant",
      value: "💡 Ready",
      change: "✨ Ask me anything",
      changeType: "highlight" as const,
      icon: Brain,
      description: "AI-powered insights & assistance",
      clickable: true
    }
  ];

  const getChangeColor = (type: string) => {
    switch (type) {
      case "positive": return "text-success";
      case "negative": return "text-destructive";
      case "highlight": return "text-primary";
      default: return "text-muted-foreground";
    }
  };

  const getCardStyle = (index: number) => {
    if (index === 5) { // AI Assistant card
      return "glass-morphism-card ai-card-highlight border-0 shadow-glow hover-scale cursor-pointer transition-all duration-300";
    }
    return "glass-morphism-card border-0 hover:shadow-glow transition-smooth hover-scale cursor-pointer";
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4 mb-8">
      {stats.map((stat, index) => (
        <Card 
          key={stat.title} 
          className={getCardStyle(index)}
          onClick={() => stat.clickable && handleCardClick(stat.id)}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 sm:p-4">
            <CardTitle className={`text-xs sm:text-sm font-medium ${index === 5 ? 'text-white font-semibold' : ''} line-clamp-1`}>
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 ${index === 5 ? 'text-white' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-1">
              <div className={`text-lg sm:text-2xl font-bold ${index === 5 ? 'text-white' : ''}`}>
                {stat.value}
              </div>
              <div className="flex items-center justify-between">
                <Badge 
                  variant={stat.changeType === "highlight" ? "secondary" : "outline"}
                  className={`text-xs ${getChangeColor(stat.changeType)} ${
                    index === 5 ? 'bg-white/20 text-white border-white/30 font-medium' : ''
                  } truncate max-w-full`}
                >
                  {stat.change}
                </Badge>
              </div>
              <p className={`text-xs ${index === 5 ? 'text-white/90' : 'text-muted-foreground'} line-clamp-1`}>
                {stat.description}
              </p>
              {stat.title === "Completion Rate" && (
                <Progress value={completionRate} className="mt-2 h-1 sm:h-2" />
              )}
            </div>
          </CardContent>
        </Card>
      ))}
      
      {/* Quick Add Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            className="fixed bottom-6 right-6 h-14 w-14 rounded-full glass-morphism-button bg-gradient-primary hover:shadow-glow transition-smooth border-0 z-50"
            size="icon"
          >
            <Plus className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        <DialogContent className="glass-morphism-card border-0">
          <DialogHeader>
            <DialogTitle className="text-primary-readable font-semibold text-xl">Create New Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" />
            </div>
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select name="priority" defaultValue="medium">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1 glass-morphism-button bg-gradient-primary border-0">Create Task</Button>
              <Button type="button" variant="outline" className="glass-morphism-button border-0 bg-white/5" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}