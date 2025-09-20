import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Eye,
  Clock,
  AlertTriangle,
  Target,
  Flag
} from "lucide-react";
import { Task } from "@/hooks/useTasks";
import { TaskDetailModal } from "./TaskDetailModal";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface TaskCalendarViewProps {
  tasks: Task[];
  selectedTasks: string[];
  onSelectTask: (taskId: string, checked: boolean) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskCreate?: (date: Date) => void;
}

export function TaskCalendarView({ 
  tasks, 
  selectedTasks, 
  onSelectTask,
  onTaskUpdate,
  onTaskCreate
}: TaskCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Generate full calendar grid (including prev/next month days)
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.due_date) {
        const dateKey = format(new Date(task.due_date), 'yyyy-MM-dd');
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500";
      case "high":
        return "bg-orange-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-gray-400";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <AlertTriangle className="w-3 h-3 text-red-500" />;
      case "high":
        return <Flag className="w-3 h-3 text-orange-500" />;
      case "medium":
        return <Clock className="w-3 h-3 text-yellow-500" />;
      case "low":
        return <Target className="w-3 h-3 text-green-500" />;
      default:
        return <Target className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "in_progress":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "blocked":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
    }
  };

  const openTaskDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
  };

  const closeTaskDetail = () => {
    setSelectedTask(null);
    setIsDetailModalOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const handleDateClick = (date: Date) => {
    if (onTaskCreate) {
      onTaskCreate(date);
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="glass-morphism-card border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                {selectedTasks.length > 0 
                  ? `${selectedTasks.length} selected`
                  : `${tasks.filter(t => t.due_date).length} tasks with due dates`
                }
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('prev')}
                  className="glass-morphism-button border-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToToday}
                  className="glass-morphism-button border-0 min-w-[120px]"
                >
                  <h2 className="text-lg font-semibold">
                    {format(currentDate, 'MMMM yyyy')}
                  </h2>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigateMonth('next')}
                  className="glass-morphism-button border-0"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                size="sm" 
                onClick={goToToday}
                className="glass-morphism-button border-0"
              >
                Today
              </Button>
              
              <div className="text-sm text-muted-foreground">
                Calendar View
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      <Card className="glass-morphism-card border-0">
        <CardContent className="p-6">
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-2 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map((day) => {
              const dateKey = format(day, 'yyyy-MM-dd');
              const dayTasks = tasksByDate[dateKey] || [];
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              const isWeekend = day.getDay() === 0 || day.getDay() === 6;
              
              return (
                <div
                  key={dateKey}
                  className={`
                    min-h-20 md:min-h-24 p-1 md:p-2 rounded-lg border transition-all cursor-pointer group
                    ${isCurrentMonth 
                      ? 'bg-background/50 border-border hover:bg-background/80' 
                      : 'bg-muted/20 border-muted/30 opacity-60 hover:opacity-80'
                    }
                    ${isCurrentDay ? 'ring-2 ring-primary shadow-lg' : ''}
                    ${isWeekend && isCurrentMonth ? 'bg-muted/30' : ''}
                    hover:shadow-md
                  `}
                  onClick={() => handleDateClick(day)}
                >
                  {/* Date number */}
                  <div className={`
                    text-xs md:text-sm font-medium mb-1 flex items-center justify-between
                    ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'}
                    ${isCurrentDay ? 'text-primary font-bold' : ''}
                  `}>
                    <span>{format(day, 'd')}</span>
                    {dayTasks.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-1 py-0 h-4 min-w-[16px]">
                        {dayTasks.length}
                      </Badge>
                    )}
                  </div>
                  
                  {/* Tasks for this day */}
                  <div className="space-y-1 flex-1 overflow-hidden">
                    {dayTasks.slice(0, isCurrentMonth ? 3 : 1).map((task) => (
                      <div
                        key={task.id}
                        className="group cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          openTaskDetail(task);
                        }}
                      >
                        <div className={`
                          text-xs p-1 rounded-md transition-all border-l-2
                          bg-card/50 hover:bg-card/80 hover:shadow-sm
                          ${getPriorityColor(task.priority).replace('bg-', 'border-l-')}
                        `}>
                          <div className="flex items-center gap-1">
                            <Checkbox 
                              checked={selectedTasks.includes(task.id)}
                              onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                              onClick={(e) => e.stopPropagation()}
                              className="flex-shrink-0 scale-75 opacity-0 group-hover:opacity-100 transition-opacity"
                            />
                            <span className="line-clamp-1 flex-1 font-medium text-xs">
                              {task.title}
                            </span>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              {getPriorityIcon(task.priority)}
                            </div>
                          </div>
                          
                          {isCurrentMonth && (
                            <div className="flex items-center gap-1 mt-1">
                              <Badge className={`${getStatusColor(task.status)} text-xs px-1 py-0 h-4`}>
                                {task.status === 'in_progress' ? 'Progress' : task.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* More tasks indicator */}
                    {dayTasks.length > (isCurrentMonth ? 3 : 1) && (
                      <div className="text-xs text-muted-foreground text-center py-1 bg-muted/20 rounded cursor-pointer hover:bg-muted/40 transition-colors"
                           onClick={(e) => {
                             e.stopPropagation();
                             // Could open a day view modal or filter tasks by this date
                           }}>
                        +{dayTasks.length - (isCurrentMonth ? 3 : 1)} more
                      </div>
                    )}
                    
                    {/* Add task hint for empty days in current month */}
                    {dayTasks.length === 0 && isCurrentMonth && (
                      <div className="text-xs text-muted-foreground/50 text-center py-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        Click to add task
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tasks without due dates */}
      {tasks.filter(t => !t.due_date).length > 0 && (
        <Card className="glass-morphism-card border-0">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Tasks without due dates ({tasks.filter(t => !t.due_date).length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {tasks.filter(t => !t.due_date).slice(0, 5).map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer transition-colors"
                onClick={() => openTaskDetail(task)}
              >
                <Checkbox 
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={(checked) => onSelectTask(task.id, checked as boolean)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0"
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon(task.priority)}
                    <span className="text-sm font-medium line-clamp-1">
                      {task.title}
                    </span>
                  </div>
                </div>
                
                <Badge className={`${getStatusColor(task.status)} text-xs`}>
                  {task.status.replace('_', ' ')}
                </Badge>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openTaskDetail(task)}
                  className="h-6 w-6 p-0"
                >
                  <Eye className="w-3 h-3" />
                </Button>
              </div>
            ))}
            
            {tasks.filter(t => !t.due_date).length > 5 && (
              <div className="text-xs text-muted-foreground text-center py-2">
                +{tasks.filter(t => !t.due_date).length - 5} more tasks without due dates
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Task Detail Modal */}
      <TaskDetailModal
        task={selectedTask}
        open={isDetailModalOpen}
        onClose={closeTaskDetail}
        onDelete={() => {}}
      />
    </div>
  );
}