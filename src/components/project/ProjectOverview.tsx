import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Users,
  Calendar as CalendarIcon,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Circle,
  Timer,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format, differenceInDays, isAfter, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from "date-fns";

interface ProjectOverviewProps {
  project: any;
  tasks: any[];
  members: any[];
}

export function ProjectOverview({ project, tasks, members }: ProjectOverviewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Calculate task statistics
  const tasksByStatus = {
    completed: tasks.filter(task => task.status === 'completed'),
    in_progress: tasks.filter(task => task.status === 'in_progress'),
    todo: tasks.filter(task => task.status === 'todo'),
    blocked: tasks.filter(task => task.status === 'blocked')
  };

  const overdueTasks = tasks.filter(task => 
    task.due_date && isAfter(new Date(), new Date(task.due_date)) && task.status !== 'completed'
  );

  const upcomingTasks = tasks.filter(task => 
    task.due_date && 
    differenceInDays(new Date(task.due_date), new Date()) <= 7 &&
    differenceInDays(new Date(task.due_date), new Date()) >= 0 &&
    task.status !== 'completed'
  );

  // Calculate progress
  const completionRate = tasks.length > 0 ? Math.round((tasksByStatus.completed.length / tasks.length) * 100) : 0;

  // Calculate estimated vs actual hours
  const totalEstimatedHours = tasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
  const totalActualHours = tasks.reduce((sum, task) => sum + (task.actual_hours || 0), 0);

  // Calculate days until due date
  const daysUntilDue = project.due_date ? differenceInDays(new Date(project.due_date), new Date()) : null;
  const isOverdue = daysUntilDue !== null && daysUntilDue < 0;

  // Calendar functionality
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  const getDateClass = (date: Date) => {
    const tasksForDate = getTasksForDate(date);
    if (tasksForDate.length === 0) return "";
    
    const hasOverdueTask = tasksForDate.some(task => 
      isAfter(new Date(), new Date(task.due_date)) && task.status !== 'completed'
    );
    const hasCompletedTask = tasksForDate.some(task => task.status === 'completed');
    const hasInProgressTask = tasksForDate.some(task => task.status === 'in_progress');
    
    if (hasOverdueTask) return "bg-destructive/20 text-destructive hover:bg-destructive/30";
    if (hasCompletedTask) return "bg-success/20 text-success hover:bg-success/30";
    if (hasInProgressTask) return "bg-primary/20 text-primary hover:bg-primary/30";
    return "bg-warning/20 text-warning hover:bg-warning/30";
  };

  const isProjectDueDate = (date: Date) => {
    return project.due_date && isSameDay(new Date(project.due_date), date);
  };

  const selectedDateTasks = selectedDate ? getTasksForDate(selectedDate) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Stats */}
      <div className="lg:col-span-2 space-y-6">
        {/* Progress Overview */}
        <Card className="glass-morphism-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Project Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Overall Completion</span>
                <span className="text-lg font-semibold">{completionRate}%</span>
              </div>
              <Progress value={completionRate} className="h-3" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 glass-morphism-card rounded-lg border-0">
                <div className="w-8 h-8 bg-success rounded-full mx-auto mb-2 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-success">{tasksByStatus.completed.length}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>

              <div className="text-center p-4 glass-morphism-card rounded-lg border-0">
                <div className="w-8 h-8 bg-primary rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Timer className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-primary">{tasksByStatus.in_progress.length}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>

              <div className="text-center p-4 glass-morphism-card rounded-lg border-0">
                <div className="w-8 h-8 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center">
                  <Circle className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-2xl font-bold text-muted-foreground">{tasksByStatus.todo.length}</p>
                <p className="text-xs text-muted-foreground">To Do</p>
              </div>

              <div className="text-center p-4 glass-morphism-card rounded-lg border-0">
                <div className="w-8 h-8 bg-destructive rounded-full mx-auto mb-2 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                <p className="text-2xl font-bold text-destructive">{tasksByStatus.blocked.length}</p>
                <p className="text-xs text-muted-foreground">Blocked</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Tracking */}
        <Card className="glass-morphism-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Time Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Hours</p>
                <p className="text-2xl font-bold">{totalEstimatedHours}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Actual Hours</p>
                <p className="text-2xl font-bold">{totalActualHours}h</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Variance</p>
                <p className={`text-2xl font-bold ${
                  totalActualHours <= totalEstimatedHours ? 'text-success' : 'text-destructive'
                }`}>
                  {totalEstimatedHours > 0 
                    ? `${totalActualHours > totalEstimatedHours ? '+' : ''}${totalActualHours - totalEstimatedHours}h`
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="glass-morphism-card border-0">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {tasks
                .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
                .slice(0, 5)
                .map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 glass-morphism-card rounded-lg border-0">
                    <div className={`w-3 h-3 rounded-full ${
                      task.status === 'completed' ? 'bg-success' :
                      task.status === 'in_progress' ? 'bg-primary' :
                      task.status === 'blocked' ? 'bg-destructive' : 'bg-muted'
                    }`} />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Updated {format(new Date(task.updated_at), 'MMM d, h:mm a')}
                      </p>
                    </div>
                    <Badge variant="outline" className="glass-badge border-0">
                      {task.status}
                    </Badge>
                  </div>
                ))}
              {tasks.length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  No tasks yet. Create your first task to get started.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column - Sidebar */}
      <div className="space-y-6">
        {/* Project Calendar */}
        <Card className="glass-morphism-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Project Calendar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="glass-button border-0 bg-white/5"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h3 className="text-sm font-medium">
                {format(currentMonth, 'MMMM yyyy')}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="glass-button border-0 bg-white/5"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Mini Calendar */}
            <div className="space-y-2">
              <div className="grid grid-cols-7 gap-1 text-xs text-muted-foreground text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
                  <div key={day} className="p-1">{day}</div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {eachDayOfInterval({
                  start: startOfMonth(currentMonth),
                  end: endOfMonth(currentMonth)
                }).map((date) => {
                  const tasksForDate = getTasksForDate(date);
                  const isSelected = selectedDate && isSameDay(date, selectedDate);
                  const isDueDate = isProjectDueDate(date);
                  
                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date)}
                      className={`
                        relative p-1 text-xs rounded transition-colors
                        ${isSelected ? 'bg-primary text-primary-foreground' : 'hover:bg-white/10'}
                        ${getDateClass(date)}
                        ${isDueDate ? 'ring-2 ring-primary' : ''}
                      `}
                    >
                      {format(date, 'd')}
                      {tasksForDate.length > 0 && (
                        <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-current rounded-full opacity-60" />
                      )}
                      {isDueDate && (
                        <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-success/20 rounded"></div>
                  <span className="text-muted-foreground">Completed</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-primary/20 rounded"></div>
                  <span className="text-muted-foreground">In Progress</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 bg-destructive/20 rounded"></div>
                  <span className="text-muted-foreground">Overdue</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 border-2 border-primary rounded"></div>
                  <span className="text-muted-foreground">Project Due</span>
                </div>
              </div>
            </div>

            {/* Selected Date Info */}
            {selectedDate && (
              <div className="pt-4 border-t border-white/10">
                <h4 className="text-sm font-medium mb-2">
                  {format(selectedDate, 'MMM d, yyyy')}
                </h4>
                {selectedDateTasks.length > 0 ? (
                  <div className="space-y-2">
                    {selectedDateTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          task.status === 'completed' ? 'bg-success' :
                          task.status === 'in_progress' ? 'bg-primary' :
                          task.status === 'blocked' ? 'bg-destructive' : 'bg-muted'
                        }`} />
                        <span className="text-xs truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No tasks for this date</p>
                )}
                {isProjectDueDate(selectedDate) && (
                  <div className="mt-2 p-2 bg-primary/10 rounded text-xs">
                    🎯 Project due date
                  </div>
                )}
              </div>
            )}

            {/* Quick Stats */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Project Created</span>
                <span>{format(new Date(project.created_at), 'MMM d, yyyy')}</span>
              </div>
              {project.due_date && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className={isOverdue ? 'text-destructive' : ''}>
                    {format(new Date(project.due_date), 'MMM d, yyyy')}
                  </span>
                </div>
              )}
              {daysUntilDue !== null && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Days {isOverdue ? 'Overdue' : 'Remaining'}</span>
                  <span className={isOverdue ? 'text-destructive font-medium' : 'text-success font-medium'}>
                    {Math.abs(daysUntilDue)}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Team Overview */}
        <Card className="glass-morphism-card border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Team ({members.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.slice(0, 5).map((member) => (
                <div key={member.user_id} className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs">
                      {member.user_profile?.full_name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="text-sm font-medium">
                      {member.user_profile?.full_name || 'Team Member'}
                    </p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
              ))}
              {members.length > 5 && (
                <p className="text-sm text-muted-foreground">+{members.length - 5} more members</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {(overdueTasks.length > 0 || upcomingTasks.length > 0) && (
          <Card className="glass-morphism-card border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-warning">
                <AlertTriangle className="w-5 h-5" />
                Attention Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {overdueTasks.length > 0 && (
                <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">
                    {overdueTasks.length} Overdue Tasks
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Review and update task deadlines
                  </p>
                </div>
              )}
              
              {upcomingTasks.length > 0 && (
                <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
                  <p className="text-sm font-medium text-warning">
                    {upcomingTasks.length} Due This Week
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Tasks need attention soon
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}