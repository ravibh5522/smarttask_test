import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Target, 
  Brain, 
  Clock, 
  Zap,
  CheckCircle,
  Play,
  Pause,
  SkipForward
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";

interface FocusTask {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "urgent" | "low";
  estimatedTime: string;
  category: string;
  aiReason: string;
  completed: boolean;
}

export default function FocusMode() {
  const { tasks: realTasks, loading, updateTask } = useTasks();
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds

  // Convert real tasks to focus tasks with AI prioritization
  const focusTasks: FocusTask[] = realTasks
    .filter(task => task.status !== 'completed')
    .sort((a, b) => {
      // Sort by priority (urgent > high > medium > low) and due date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 1;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 1;
      
      if (aPriority !== bPriority) return bPriority - aPriority;
      
      // If same priority, sort by due date
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    })
    .map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || "No description provided",
      priority: task.priority,
      estimatedTime: task.estimated_hours ? `${task.estimated_hours}h` : "1h",
      category: task.category || "General",
      aiReason: getAiReason(task),
      completed: task.status === 'completed'
    }));

  // Generate AI reasoning for task prioritization
  function getAiReason(task: any): string {
    const reasons = [];
    
    if (task.priority === 'urgent') {
      reasons.push("Critical priority");
    }
    
    if (task.due_date) {
      const dueDate = new Date(task.due_date);
      const now = new Date();
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilDue < 24) {
        reasons.push("Due within 24 hours");
      } else if (hoursUntilDue < 72) {
        reasons.push("Due soon");
      }
    }
    
    if (task.status === 'in_progress') {
      reasons.push("Already in progress");
    }
    
    if (reasons.length === 0) {
      const defaultReasons = [
        "Quick win to build momentum",
        "Foundation for other tasks",
        "High impact on project progress",
        "Reduce cognitive load"
      ];
      reasons.push(defaultReasons[Math.floor(Math.random() * defaultReasons.length)]);
    }
    
    return reasons.join(" • ");
  }

  const currentTask = focusTasks[currentTaskIndex];
  const completedTasks = focusTasks.filter(t => t.completed).length;

  const toggleTaskComplete = async (taskId: string) => {
    const task = realTasks.find(t => t.id === taskId);
    if (task) {
      const newStatus = task.status === 'completed' ? 'open' : 'completed';
      await updateTask(taskId, { status: newStatus as any });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-secondary">
        <div className="flex-1 p-6 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-ai rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Focus Mode</h1>
            </div>
            <p className="text-muted-foreground">Loading your personalized focus session...</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-8">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                  <div className="h-32 bg-muted rounded-full w-32 mx-auto"></div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (focusTasks.length === 0) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-secondary">
        <div className="flex-1 p-6 space-y-6">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-ai rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">Focus Mode</h1>
            </div>
            <p className="text-muted-foreground">No tasks available for focus session</p>
          </div>
          <div className="max-w-2xl mx-auto text-center">
            <Card className="bg-card/50 backdrop-blur-sm border-border/50">
              <CardContent className="p-8">
                <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
                <h2 className="text-xl font-semibold mb-2">All caught up!</h2>
                <p className="text-muted-foreground mb-4">
                  You don't have any pending tasks. Great job on staying on top of your work!
                </p>
                <Button className="bg-gradient-primary">
                  Create New Task
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const nextTask = () => {
    if (currentTaskIndex < focusTasks.length - 1) {
      setCurrentTaskIndex(currentTaskIndex + 1);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-destructive text-destructive-foreground";
      case "high": return "bg-warning text-warning-foreground";
      case "medium": return "bg-primary/20 text-primary";
      case "low": return "bg-muted text-muted-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="glass-morphism-card p-8 rounded-2xl border-0 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-16 h-16 bg-gradient-ai rounded-full flex items-center justify-center shadow-glow">
                <Target className="w-8 h-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-primary-readable mb-2">Focus Mode</h1>
            <p className="text-muted-foreground text-lg">
              AI-curated tasks to maximize your productivity
            </p>
          </div>
        </div>

        {/* Main Focus Area */}
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Current Task - Main Panel */}
            <div className="lg:col-span-2">
              <Card className="glass-morphism-card border-0 shadow-glow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {currentTaskIndex + 1}
                      </div>
                      Current Task
                    </CardTitle>
                    <Badge className={getPriorityColor(currentTask?.priority || "medium")}>
                      {currentTask?.priority}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {currentTask && (
                    <>
                      {/* Task Details */}
                      <div className="space-y-3">
                        <h3 className="text-xl font-semibold">{currentTask.title}</h3>
                        <p className="text-muted-foreground">{currentTask.description}</p>
                        
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4 text-muted-foreground" />
                            <span>{currentTask.estimatedTime}</span>
                          </div>
                          <Badge variant="outline">{currentTask.category}</Badge>
                        </div>
                      </div>

                      {/* AI Reasoning */}
                      <div className="bg-gradient-ai/10 border border-primary/20 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                          <Brain className="w-5 h-5 text-primary ai-pulse mt-0.5" />
                          <div>
                            <p className="font-medium text-primary mb-1">Why this task now?</p>
                            <p className="text-sm text-muted-foreground">{currentTask.aiReason}</p>
                          </div>
                        </div>
                      </div>

                      {/* Pomodoro Timer */}
                      <div className="text-center space-y-4">
                        <div className="w-32 h-32 mx-auto bg-gradient-primary rounded-full flex items-center justify-center text-white">
                          <span className="text-2xl font-bold">{formatTime(timeLeft)}</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3">
                          <Button
                            variant={isActive ? "destructive" : "default"}
                            onClick={() => setIsActive(!isActive)}
                            className="px-6"
                          >
                            {isActive ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                            {isActive ? "Pause" : "Start"}
                          </Button>
                          
                          <Button variant="outline" onClick={nextTask} disabled={currentTaskIndex >= focusTasks.length - 1}>
                            <SkipForward className="w-4 h-4 mr-2" />
                            Skip
                          </Button>
                        </div>
                      </div>

                      {/* Task Actions */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          <Checkbox 
                            checked={currentTask.completed}
                            onCheckedChange={() => toggleTaskComplete(currentTask.id)}
                          />
                          <span className="text-sm">Mark as completed</span>
                        </div>
                        
                        <Button variant="outline" size="sm">
                          Need help?
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Progress Overview */}
              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Today's Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-primary">{completedTasks}</div>
                      <div className="text-sm text-muted-foreground">of {focusTasks.length} tasks completed</div>
                    </div>
                    
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-primary h-3 rounded-full transition-all duration-500"
                        style={{ width: `${focusTasks.length > 0 ? (completedTasks / focusTasks.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="font-medium">Focus Sessions</div>
                        <div className="text-muted-foreground">2 completed</div>
                      </div>
                      <div>
                        <div className="font-medium">Time Saved</div>
                        <div className="text-muted-foreground">1.2 hours</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming Tasks */}
              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="text-lg">Up Next</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {focusTasks.slice(currentTaskIndex + 1, currentTaskIndex + 4).map((task, index) => (
                      <div key={task.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                        <div className="w-6 h-6 bg-primary/20 rounded flex items-center justify-center text-xs font-medium text-primary">
                          {currentTaskIndex + index + 2}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium line-clamp-1">{task.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">{task.category}</Badge>
                            <span className="text-xs text-muted-foreground">{task.estimatedTime}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {focusTasks.length <= currentTaskIndex + 1 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-sm">All tasks completed!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}