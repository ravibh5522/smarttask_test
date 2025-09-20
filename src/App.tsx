import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { SidebarLayout } from "@/components/layout/SidebarLayout";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Projects from "./pages/Projects";
import ProjectDetail from "./pages/ProjectDetail";
import Team from "./pages/Team";
import TimeTracking from "./pages/TimeTracking";
import Templates from "./pages/Templates";
import Reports from "./pages/Reports";
import Roadmap from "./pages/Roadmap";
import FocusMode from "./pages/FocusMode";
import AIAssistant from "./pages/AIAssistant";
import Tasks from "./pages/Tasks";
import TasksAdvanced from "./pages/TasksAdvanced";
import Settings from "./pages/Settings";
import Analytics from "./pages/Analytics";
import Calendar from "./pages/Calendar";
import NotFound from "./pages/NotFound";
import IconShowcase from "./pages/IconShowcase";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="taskflow-theme">
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/icons" element={<IconShowcase />} />
              
              {/* Protected dashboard routes */}
              <Route path="/dashboard/*" element={
                <ProtectedRoute>
                  <SidebarProvider>
                    <SidebarLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/ai" element={<AIAssistant />} />
                        <Route path="/focus" element={<FocusMode />} />
                        <Route path="/projects" element={<Projects />} />
                        <Route path="/projects/:projectId" element={<ProjectDetail />} />
                        <Route path="/tasks" element={<Tasks />} />
                        <Route path="/tasks/advanced" element={<TasksAdvanced />} />
                        <Route path="/calendar" element={<Calendar />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/time-tracking" element={<TimeTracking />} />
                        <Route path="/templates" element={<Templates />} />
                        <Route path="/reports" element={<Reports />} />
                        <Route path="/roadmap" element={<Roadmap />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<Settings />} />
                      </Routes>
                    </SidebarLayout>
                  </SidebarProvider>
                </ProtectedRoute>
              } />
              
              {/* Redirect old routes */}
              <Route path="/tasks" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/projects" replace />
                </ProtectedRoute>
              } />
              <Route path="/focus" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/focus" replace />
                </ProtectedRoute>
              } />
              <Route path="/projects" element={
                <ProtectedRoute>
                  <Navigate to="/dashboard/projects" replace />
                </ProtectedRoute>
              } />
              
              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;