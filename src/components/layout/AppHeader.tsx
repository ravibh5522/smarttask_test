import { Bell, Search, User, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  return (
    <header className="h-16 border-b border-border/50 bg-card/30 backdrop-blur-sm flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 sm:gap-4">
        <SidebarTrigger className={`hover:bg-muted/50 transition-smooth ${isMobile ? 'h-9 w-9' : 'h-7 w-7'}`} />
        
        {/* Search */}
        <div className={`relative ${isMobile ? 'w-full max-w-xs' : 'w-96 max-w-sm'}`}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder={isMobile ? "Search..." : "Search tasks, projects, or ask AI..."} 
            className="pl-10 bg-muted/30 border-border/50 focus:border-primary/50 transition-smooth"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Actions - Hide on small mobile */}
        {!isMobile && (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-gradient-primary hover:shadow-medium transition-smooth"
            onClick={() => navigate('/dashboard/projects')}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}

        {/* Mobile Quick Action */}
        {isMobile && (
          <Button 
            variant="default" 
            size="sm" 
            className="bg-gradient-primary hover:shadow-medium transition-smooth p-2"
            onClick={() => navigate('/dashboard/projects')}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="relative hover:bg-muted/50 transition-smooth">
              <Bell className="w-4 h-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">Task deadline approaching</p>
                <p className="text-xs text-muted-foreground">Design review due in 2 hours</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">New comment from Sarah</p>
                <p className="text-xs text-muted-foreground">On "Mobile app prototype"</p>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <div className="flex flex-col gap-1">
                <p className="text-sm font-medium">AI suggestion available</p>
                <p className="text-xs text-muted-foreground">Task optimization for Project Alpha</p>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2 hover:bg-muted/50 transition-smooth">
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              {!isMobile && (
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium">{user?.user_metadata?.full_name || user?.email || 'User'}</p>
                  <p className="text-xs text-muted-foreground">Project Admin</p>
                </div>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/dashboard/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem>Help</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}