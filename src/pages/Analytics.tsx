import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DateRange } from "react-day-picker";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area } from "recharts";
import { 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Target,
  Calendar as CalendarIcon,
  Filter,
  Download,
  RefreshCw,
  Brain,
  Zap,
  CheckCircle,
  AlertTriangle,
  Timer,
  Activity
} from "lucide-react";
import { format, subDays } from "date-fns";
import { useProjects } from "@/hooks/useProjects";
import { useTasks } from "@/hooks/useTasks";
import { useTeamMembers } from "@/hooks/useTeamMembers";

const chartConfig = {
  tasks: {
    label: "Tasks",
    color: "hsl(var(--primary))",
  },
  completed: {
    label: "Completed",
    color: "hsl(var(--success))",
  },
  inProgress: {
    label: "In Progress",
    color: "hsl(var(--warning))",
  },
  todo: {
    label: "To Do",
    color: "hsl(var(--muted))",
  },
  hours: {
    label: "Hours",
    color: "hsl(var(--accent))",
  },
};

// Mock analytics data - in real app, this would come from APIs
const generateMockData = () => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'MM/dd'),
      tasks: Math.floor(Math.random() * 15) + 5,
      completed: Math.floor(Math.random() * 12) + 3,
      hours: Math.floor(Math.random() * 8) + 2,
      productivity: Math.floor(Math.random() * 30) + 70,
    };
  });

  const projectData = [
    { name: 'Project Alpha', tasks: 45, completed: 38, efficiency: 84 },
    { name: 'Project Beta', tasks: 32, completed: 28, efficiency: 88 },
    { name: 'Project Gamma', tasks: 28, completed: 15, efficiency: 54 },
    { name: 'Project Delta', tasks: 52, completed: 48, efficiency: 92 },
  ];

  const teamData = [
    { member: 'John Doe', tasks: 23, completed: 20, hours: 38 },
    { member: 'Jane Smith', tasks: 18, completed: 16, hours: 32 },
    { member: 'Mike Johnson', tasks: 15, completed: 12, hours: 28 },
    { member: 'Sarah Wilson', tasks: 21, completed: 19, hours: 35 },
  ];

  const taskDistribution = [
    { name: 'Completed', value: 45, color: 'hsl(var(--success))' },
    { name: 'In Progress', value: 28, color: 'hsl(var(--warning))' },
    { name: 'To Do', value: 18, color: 'hsl(var(--muted))' },
    { name: 'Blocked', value: 9, color: 'hsl(var(--destructive))' },
  ];

  return { last7Days, projectData, teamData, taskDistribution };
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedMember, setSelectedMember] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  const { projects } = useProjects();
  const { tasks } = useTasks(selectedProject === "all" ? undefined : selectedProject);
  const { members } = useTeamMembers();

  const { last7Days, projectData, teamData, taskDistribution } = useMemo(() => generateMockData(), [dateRange, selectedProject, selectedMember]);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const avgProductivity = 78; // Mock calculation

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="glass-morphism-card p-6 rounded-2xl border-0">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-ai rounded-xl flex items-center justify-center shadow-glow">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                                <h1 className="text-3xl font-bold text-primary-readable">
                  Analytics & Insights
                </h1>
                <p className="text-muted-foreground">
                  AI-powered insights and performance metrics
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline" 
                size="sm" 
                className="glass-morphism-button border-0"
                onClick={handleRefresh}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" className="glass-morphism-button border-0">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="glass-morphism-button border-0 justify-start">
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "LLL dd")} - {format(dateRange.to, "LLL dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    "Pick a date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 glass-morphism-card border-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="glass-morphism-button border-0">
                <SelectValue placeholder="Select project" />
              </SelectTrigger>
              <SelectContent className="glass-morphism-card border-0">
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMember} onValueChange={setSelectedMember}>
              <SelectTrigger className="glass-morphism-button border-0">
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent className="glass-morphism-card border-0">
                <SelectItem value="all">All Members</SelectItem>
                {members.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.user_profile?.full_name || member.user_profile?.email || 'Team Member'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button className="glass-morphism-button bg-gradient-primary border-0">
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="glass-morphism-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +12% from last month
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +5% from last week
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Productivity</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgProductivity}%</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-warning flex items-center">
                  <TrendingDown className="w-3 h-3 mr-1" />
                  -2% from last week
                </span>
              </p>
            </CardContent>
          </Card>

          <Card className="glass-morphism-card border-0">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Logged</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">247h</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-success flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +18% from last month
                </span>
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="glass-morphism-button border-0 bg-white/10">
            <TabsTrigger value="overview" className="glass-morphism-button border-0">Overview</TabsTrigger>
            <TabsTrigger value="productivity" className="glass-morphism-button border-0">Productivity</TabsTrigger>
            <TabsTrigger value="projects" className="glass-morphism-button border-0">Projects</TabsTrigger>
            <TabsTrigger value="team" className="glass-morphism-button border-0">Team</TabsTrigger>
            <TabsTrigger value="ai-insights" className="glass-morphism-button border-0">
              <Brain className="w-4 h-4 mr-2" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Completion Trend */}
              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    Task Completion Trend
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={last7Days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area 
                          type="monotone" 
                          dataKey="completed" 
                          stackId="1" 
                          stroke="hsl(var(--primary))" 
                          fill="hsl(var(--primary)/0.3)" 
                        />
                        <Area 
                          type="monotone" 
                          dataKey="tasks" 
                          stackId="1" 
                          stroke="hsl(var(--muted))" 
                          fill="hsl(var(--muted)/0.3)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Task Distribution */}
              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Task Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskDistribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {taskDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="flex flex-wrap gap-4 mt-4">
                    {taskDistribution.map((item, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm text-muted-foreground">{item.name}: {item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="productivity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Productivity Over Time */}
              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Productivity Score
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={last7Days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line 
                          type="monotone" 
                          dataKey="productivity" 
                          stroke="hsl(var(--primary))" 
                          strokeWidth={3}
                          dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              {/* Time Tracking */}
              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Timer className="w-5 h-5 text-primary" />
                    Time Tracking
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={last7Days}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                        <YAxis stroke="hsl(var(--muted-foreground))" />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar 
                          dataKey="hours" 
                          fill="hsl(var(--accent))" 
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="projects" className="space-y-6">
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Project Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projectData.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 glass-morphism-button rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{project.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {project.completed} / {project.tasks} tasks completed
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="glass-badge">
                          {project.efficiency}% efficiency
                        </Badge>
                        <div className="w-32 bg-muted rounded-full h-2 mt-2">
                          <div 
                            className="bg-gradient-primary h-2 rounded-full" 
                            style={{ width: `${(project.completed / project.tasks) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-6">
            <Card className="glass-morphism-card border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Team Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamData.map((member, index) => (
                    <div key={index} className="flex items-center justify-between p-4 glass-morphism-button rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-ai rounded-full flex items-center justify-center">
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-medium">{member.member}</h3>
                          <p className="text-sm text-muted-foreground">
                            {member.completed} / {member.tasks} tasks • {member.hours}h logged
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="glass-badge">
                          {Math.round((member.completed / member.tasks) * 100)}% completion
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ai-insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary ai-pulse" />
                    AI Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-primary/10 rounded-lg border border-primary/20">
                    <div className="flex items-start gap-3">
                      <Zap className="w-5 h-5 text-primary mt-1 ai-pulse" />
                      <div>
                        <h4 className="font-medium text-primary">Productivity Boost</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Consider scheduling focused work blocks on Tuesday afternoons for 23% higher completion rates.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-warning/10 rounded-lg border border-warning/20">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-warning mt-1" />
                      <div>
                        <h4 className="font-medium text-warning">Bottleneck Detected</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Code review tasks are taking 2.3x longer than estimated. Consider additional reviewers.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-success/10 rounded-lg border border-success/20">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-success mt-1" />
                      <div>
                        <h4 className="font-medium text-success">Team Strength</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          Your team excels at frontend tasks with 94% on-time completion rate.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-morphism-card border-0">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Performance Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Sprint Velocity</span>
                        <span className="text-sm text-success">+15%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-primary h-2 rounded-full w-4/5"></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Code Quality Score</span>
                        <span className="text-sm text-success">92%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-ai h-2 rounded-full" style={{ width: '92%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium">Team Satisfaction</span>
                        <span className="text-sm text-warning">-3%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-gradient-secondary h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}