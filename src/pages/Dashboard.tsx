import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { TaskList } from "@/components/tasks/TaskList";
import { TeamActivityFeed } from "@/components/team/TeamActivityFeed";
import { TimeBasedAnimation } from "@/components/ui/TimeBasedAnimation";
import { useProjects } from "@/hooks/useProjects";
import { useContextualGreeting } from "@/hooks/useTimeBasedGreeting";
import { useNavigate } from "react-router-dom";
import { 
  Plus, 
  Filter, 
  Calendar as CalendarIcon, 
  Users,
  TrendingUp,
  Clock,
  Target,
  Sparkles
} from "lucide-react";

export default function Dashboard() {
  const { projects } = useProjects();
  const navigate = useNavigate();
  const { 
    greeting, 
    userName, 
    emoji, 
    contextualMessage, 
    formattedTime,
    currentDateTime 
  } = useContextualGreeting();
  const currentProjectId = projects[0]?.id;

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6 space-y-6">
        {/* Welcome Header */}
        <div className="glass-morphism-card p-8 rounded-2xl border-0 relative overflow-hidden">
          {/* Animated Background */}
          <TimeBasedAnimation />
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-foreground">
                  {greeting}, {userName}! {emoji}
                </h1>
                <Sparkles className="w-8 h-8 text-primary ai-pulse" />
              </div>
              <p className="text-muted-foreground text-lg mb-1">
                {contextualMessage}
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formattedTime}
                </span>
                <span className="text-xs opacity-70">
                  {currentDateTime.split(',')[0]} • {currentDateTime.split(', ')[1].split(' at')[0]}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-3 relative z-10">
              <Button variant="outline" size="sm" className="glass-morphism-button border-0 bg-white/5">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm" className="glass-morphism-button border-0 bg-white/5">
                <CalendarIcon className="w-4 h-4 mr-2" />
                This Week
              </Button>
              <Button 
                className="glass-morphism-button bg-gradient-primary hover:shadow-glow border-0"
                onClick={() => navigate('/dashboard/projects')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <StatsCards />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Tasks & Projects */}
          <div className="xl:col-span-2 space-y-6">
            {/* Task List */}
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  <span className="text-primary-readable font-semibold">Active Tasks</span>
                  <Badge variant="secondary" className="glass-badge">
                    12 Active
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TaskList />
              </CardContent>
            </Card>

            {/* Project Overview */}
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <span className="text-primary-readable font-semibold">Project Progress</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Overall Completion</span>
                    <span className="text-sm text-muted-foreground">78%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-gradient-primary h-2 rounded-full w-3/4"></div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Great progress! You're ahead of schedule for this sprint.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity & Insights */}
          <div className="space-y-6">
            <TeamActivityFeed />
            
            {/* Quick Actions */}
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  <span className="text-primary-readable font-semibold">Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start glass-morphism-button border-0 bg-white/5">
                  <Users className="w-4 h-4 mr-2" />
                  Schedule Team Meeting
                </Button>
                <Button variant="outline" className="w-full justify-start glass-morphism-button border-0 bg-white/5">
                  <Target className="w-4 h-4 mr-2" />
                  Create Sprint Goal
                </Button>
                <Button variant="outline" className="w-full justify-start glass-morphism-button border-0 bg-white/5">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}