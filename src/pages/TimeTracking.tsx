import { useState } from "react";
import { Calendar, Clock, DollarSign, Filter, Download, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { useProjects } from "@/hooks/useProjects";
import { formatDistanceToNow, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";

const TimeTracking = () => {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("week");
  
  const { 
    timeEntries, 
    activeTimer, 
    getTotalHours, 
    getBillableHours,
    stopTimer,
    loading 
  } = useTimeTracking(selectedProject === "all" ? undefined : selectedProject);

  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.start_time);
    const now = new Date();
    
    switch (dateRange) {
      case "today":
        return entryDate.toDateString() === now.toDateString();
      case "week":
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        return entryDate >= weekStart && entryDate <= weekEnd;
      case "month":
        const monthStart = startOfMonth(now);
        const monthEnd = endOfMonth(now);
        return entryDate >= monthStart && entryDate <= monthEnd;
      default:
        return true;
    }
  });

  const totalHours = getTotalHours(filteredEntries);
  const billableHours = getBillableHours(filteredEntries);
  const totalEarnings = filteredEntries
    .filter(entry => entry.billable && entry.hourly_rate)
    .reduce((total, entry) => {
      const hours = (entry.duration_minutes || 0) / 60;
      return total + (hours * (entry.hourly_rate || 0));
    }, 0);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatElapsedTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / 60000);
    return formatDuration(elapsed);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="glass-morphism-card p-6 rounded-xl border-0">
            <h1 className="text-3xl font-bold text-primary-readable">Time Tracking</h1>
            <p className="text-muted-foreground">
              Track your time and manage your productivity
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="glass-morphism-button border-0 bg-white/5">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
      </div>

        {/* Active Timer Alert */}
        {activeTimer && (
          <Card className="glass-morphism-card border-primary/20 bg-gradient-primary/10">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse"></div>
                <div>
                  <div className="font-medium">Timer Active</div>
                  <div className="text-sm text-muted-foreground">
                    Running for {formatElapsedTime(activeTimer.start_time)}
                  </div>
                </div>
              </div>
              <Button onClick={() => stopTimer(activeTimer.id)} size="sm">
                <Pause className="w-4 h-4 mr-2" />
                Stop Timer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

        </div>
        {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Select value={selectedProject} onValueChange={setSelectedProject}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map(project => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-morphism-card border-0 hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {filteredEntries.length} time entries
            </p>
          </CardContent>
        </Card>

          <Card className="glass-morphism-card border-0 hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{billableHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">
              {totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}% of total
            </p>
          </CardContent>
        </Card>

          <Card className="glass-morphism-card border-0 hover-scale">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Earnings</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalEarnings.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              From billable hours
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries */}
      <Tabs defaultValue="entries" className="w-full">
        <TabsList>
          <TabsTrigger value="entries">Time Entries</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

          <TabsContent value="entries" className="mt-6">
            <Card className="glass-morphism-card border-0">
            <CardHeader>
              <CardTitle>Time Entries</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredEntries.length === 0 ? (
                <div className="text-center py-12">
                  <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium mb-2">No time entries found</h3>
                  <p className="text-muted-foreground">
                    Start tracking time on your tasks to see entries here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredEntries.map((entry, index) => (
                    <div key={entry.id} className="glass-morphism-card p-6 rounded-xl border-0 hover-scale transition-all duration-200">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex flex-wrap items-center gap-3">
                                                        <div className="text-xl font-bold text-primary-readable">
                              {totalHours}h
                            </div>
                            <div className="flex gap-2">
                              {entry.billable && (
                                <Badge variant="default" className="glass-morphism-badge bg-green-500/20 text-green-400 border-green-500/30">
                                  Billable
                                </Badge>
                              )}
                              {entry.hourly_rate && (
                                <Badge variant="outline" className="glass-morphism-badge border-primary/30 text-primary">
                                  ${entry.hourly_rate}/hr
                                </Badge>
                              )}
                            </div>
                          </div>
                          
                          {entry.description && (
                            <div className="text-sm text-muted-foreground p-3 bg-white/5 rounded-lg border border-white/10">
                              {entry.description}
                            </div>
                          )}
                          
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {format(new Date(entry.start_time), 'MMM d, yyyy • h:mm a')}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          {entry.billable && entry.hourly_rate && entry.duration_minutes && (
                            <div className="text-2xl font-bold text-green-400">
                              ${((entry.duration_minutes / 60) * entry.hourly_rate).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Subtle separator line for visual separation */}
                      {index < filteredEntries.length - 1 && (
                        <div className="mt-6 h-px w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Daily breakdown chart would go here
                </div>
              </CardContent>
            </Card>
            
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle>Project Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  Project time distribution would go here
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="mt-6">
          <Card className="glass-morphism-card border-0">
            <CardHeader>
              <CardTitle>Time Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                Detailed reports and analytics coming soon
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TimeTracking;