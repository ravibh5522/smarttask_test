import React, { useState, useMemo } from "react";
import { format, startOfWeek, addDays, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, addWeeks, subWeeks, getDay } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, List, Grid3x3, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useTasks } from "@/hooks/useTasks";
import { useProjects } from "@/hooks/useProjects";
import { TaskCreateWizard } from "@/components/tasks/TaskCreateWizard";
import { TaskDetailModal } from "@/components/tasks/TaskDetailModal";

type CalendarView = "month" | "week" | "day";

interface TimeSlot {
  hour: number;
  minute: number;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  const { tasks, createTask, updateTask, deleteTask } = useTasks();
  const { projects } = useProjects();

  // Generate time slots for day/week view
  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      slots.push({ hour, minute: 0 });
      slots.push({ hour, minute: 30 });
    }
    return slots;
  }, []);

  // Filter tasks by date
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => 
      task.due_date && isSameDay(new Date(task.due_date), date)
    );
  };

  // Get tasks for time slot
  const getTasksForTimeSlot = (date: Date, hour: number) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return isSameDay(taskDate, date) && taskDate.getHours() === hour;
    });
  };

  // Navigation functions
  const navigatePrevious = () => {
    if (view === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, -1));
    }
  };

  const navigateNext = () => {
    if (view === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (view === "week") {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addDays(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Handle time slot click
  const handleTimeSlotClick = (date: Date, hour?: number, minute?: number) => {
    setSelectedDate(date);
    if (hour !== undefined && minute !== undefined) {
      setSelectedTimeSlot({ hour, minute });
    } else {
      setSelectedTimeSlot(null);
    }
    setIsCreateModalOpen(true);
  };

  // Handle task click
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-blue-500";
    }
  };

  // Render month view
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = addDays(startOfWeek(monthEnd), 41);
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <div className="grid grid-cols-7 gap-1 h-full">
        {/* Day headers */}
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border-b">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((day, index) => {
          const dayTasks = getTasksForDate(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());
          
          return (
            <div
              key={index}
              className={`min-h-24 p-1 border border-border/50 cursor-pointer hover:bg-accent/50 transition-colors ${
                !isCurrentMonth ? "bg-muted/30 text-muted-foreground" : ""
              } ${isToday ? "bg-primary/10 ring-1 ring-primary" : ""}`}
              onClick={() => handleTimeSlotClick(day)}
            >
              <div className="text-sm font-medium mb-1">{day.getDate()}</div>
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task, idx) => (
                  <div
                    key={task.id}
                    className={`text-xs p-1 rounded truncate cursor-pointer hover:opacity-80 ${getPriorityColor(task.priority)} text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  >
                    {task.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground">
                    +{dayTasks.length - 3} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render week view
  const renderWeekView = () => {
    const weekStart = startOfWeek(currentDate);
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
    
    return (
      <div className="flex h-full">
        {/* Time column */}
        <div className="w-16 border-r border-border/50">
          <div className="h-12 border-b border-border/50"></div>
          {timeSlots.map((slot) => (
            <div key={`${slot.hour}-${slot.minute}`} className="h-12 text-xs p-1 border-b border-border/50 text-right">
              {slot.minute === 0 ? format(new Date().setHours(slot.hour, 0), "ha") : ""}
            </div>
          ))}
        </div>
        
        {/* Days columns */}
        {weekDays.map((day) => {
          const isToday = isSameDay(day, new Date());
          return (
            <div key={day.toString()} className="flex-1 border-r border-border/50 last:border-r-0">
              {/* Day header */}
              <div className={`h-12 p-2 border-b border-border/50 text-center ${isToday ? "bg-primary/10" : ""}`}>
                <div className="text-xs text-muted-foreground">{format(day, "EEE")}</div>
                <div className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>{day.getDate()}</div>
              </div>
              
              {/* Time slots */}
              {timeSlots.map((slot) => {
                const slotTasks = getTasksForTimeSlot(day, slot.hour);
                return (
                  <div
                    key={`${slot.hour}-${slot.minute}`}
                    className="h-12 border-b border-border/50 p-1 cursor-pointer hover:bg-accent/50 transition-colors relative"
                    onClick={() => handleTimeSlotClick(day, slot.hour, slot.minute)}
                  >
                    {slotTasks.map((task) => (
                      <div
                        key={task.id}
                        className={`absolute inset-1 rounded text-xs p-1 truncate cursor-pointer hover:opacity-80 ${getPriorityColor(task.priority)} text-white`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTaskClick(task);
                        }}
                      >
                        {task.title}
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  // Render day view
  const renderDayView = () => {
    const isToday = isSameDay(currentDate, new Date());
    
    return (
      <div className="flex h-full">
        {/* Time column */}
        <div className="w-16 border-r border-border/50">
          <div className="h-16 border-b border-border/50 flex items-center justify-center">
            <Clock className="w-4 h-4 text-muted-foreground" />
          </div>
          {timeSlots.map((slot) => (
            <div key={`${slot.hour}-${slot.minute}`} className="h-16 text-xs p-1 border-b border-border/50 text-right">
              {slot.minute === 0 ? format(new Date().setHours(slot.hour, 0), "h:mm a") : ""}
            </div>
          ))}
        </div>
        
        {/* Day column */}
        <div className="flex-1">
          {/* Day header */}
          <div className={`h-16 p-4 border-b border-border/50 ${isToday ? "bg-primary/10" : ""}`}>
            <div className="text-sm text-muted-foreground">{format(currentDate, "EEEE")}</div>
            <div className={`text-lg font-semibold ${isToday ? "text-primary" : ""}`}>
              {format(currentDate, "MMMM d, yyyy")}
            </div>
          </div>
          
          {/* Time slots */}
          {timeSlots.map((slot) => {
            const slotTasks = getTasksForTimeSlot(currentDate, slot.hour);
            return (
              <div
                key={`${slot.hour}-${slot.minute}`}
                className="h-16 border-b border-border/50 p-2 cursor-pointer hover:bg-accent/50 transition-colors relative"
                onClick={() => handleTimeSlotClick(currentDate, slot.hour, slot.minute)}
              >
                <div className="text-xs text-muted-foreground mb-1">
                  {format(new Date().setHours(slot.hour, slot.minute), "h:mm a")}
                </div>
                {slotTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`mb-1 rounded p-2 cursor-pointer hover:opacity-80 ${getPriorityColor(task.priority)} text-white`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTaskClick(task);
                    }}
                  >
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-xs opacity-90 truncate">{task.description}</div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getViewTitle = () => {
    switch (view) {
      case "month":
        return format(currentDate, "MMMM yyyy");
      case "week":
        const weekStart = startOfWeek(currentDate);
        const weekEnd = addDays(weekStart, 6);
        return `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`;
      case "day":
        return format(currentDate, "EEEE, MMMM d, yyyy");
      default:
        return "";
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="p-6 border-b border-border/50 bg-card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-primary-readable">Calendar</h1>
            <p className="text-muted-foreground">Manage your tasks and schedule</p>
          </div>
          <Button 
            onClick={() => handleTimeSlotClick(new Date())}
            className="bg-gradient-primary hover:bg-gradient-primary/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={navigatePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={navigateNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Today
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <h2 className="text-lg font-semibold">{getViewTitle()}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant={view === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("month")}
            >
              <Grid3x3 className="w-4 h-4 mr-1" />
              Month
            </Button>
            <Button
              variant={view === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("week")}
            >
              <List className="w-4 h-4 mr-1" />
              Week
            </Button>
            <Button
              variant={view === "day" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("day")}
            >
              <CalendarIcon className="w-4 h-4 mr-1" />
              Day
            </Button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {view === "month" && renderMonthView()}
        {view === "week" && renderWeekView()}
        {view === "day" && renderDayView()}
      </div>

      {/* Task Creation Modal */}
      {isCreateModalOpen && (
        <TaskCreateWizard
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setSelectedDate(null);
            setSelectedTimeSlot(null);
          }}
          projectId={projects[0]?.id || ""}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={isTaskDetailOpen}
          onClose={() => {
            setIsTaskDetailOpen(false);
            setSelectedTask(null);
          }}
          onEdit={(task) => updateTask(task.id, task)}
          onDelete={(taskId) => deleteTask(taskId)}
        />
      )}
    </div>
  );
}