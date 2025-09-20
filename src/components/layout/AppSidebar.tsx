import { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  BarChart3, 
  Settings, 
  Target,
  Calendar,
  Clock,
  FileText,
  PieChart,
  MapPin,
  Bot
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { SmartTaskLogo } from '@/components/ui/SmartTaskIcon';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar"
import { useIsMobile } from "@/hooks/use-mobile";

const mainItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Projects", url: "/dashboard/projects", icon: FolderOpen },
  { title: "Calendar", url: "/dashboard/calendar", icon: Calendar },
  { title: "Focus Mode", url: "/dashboard/focus", icon: Target },
];

const workspaceItems = [
  { title: "Time Tracking", url: "/dashboard/time-tracking", icon: Clock },
  { title: "Task Creation", url: "/dashboard/templates", icon: FileText },
  { title: "Reports", url: "/dashboard/reports", icon: PieChart },
  { title: "Roadmap", url: "/dashboard/roadmap", icon: MapPin },
];

const teamItems = [
  { title: "Team", url: "/dashboard/team", icon: Users },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
];

const aiItems = [
  { title: "AI Assistant", url: "/dashboard/ai", icon: Bot },
];

export function AppSidebar() {
  const { state, setOpenMobile, openMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const isMobile = useIsMobile();
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-hide sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobile &&
        openMobile &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node)
      ) {
        setOpenMobile(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isMobile && openMobile) {
        setOpenMobile(false);
      }
    };

    // Handle touch events for swipe-to-close
    let touchStartX = 0;
    const handleTouchStart = (event: TouchEvent) => {
      touchStartX = event.touches[0].clientX;
    };

    const handleTouchEnd = (event: TouchEvent) => {
      const touchEndX = event.changedTouches[0].clientX;
      const swipeDistance = touchStartX - touchEndX;
      
      // If swiped left more than 100px, close sidebar
      if (swipeDistance > 100 && isMobile && openMobile) {
        setOpenMobile(false);
      }
    };

    if (isMobile && openMobile) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('touchstart', handleTouchStart, { passive: true });
      document.addEventListener('touchend', handleTouchEnd, { passive: true });
      // Prevent body scroll when sidebar is open on mobile
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscapeKey);
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, openMobile, setOpenMobile]);

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? `flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'} text-sm font-medium text-primary bg-primary/10 rounded-lg transition-all duration-200` 
      : `flex items-center ${isCollapsed ? 'justify-center p-3' : 'gap-3 px-3 py-3'} text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/30 rounded-lg transition-all duration-200`;

  return (
    <Sidebar
      ref={sidebarRef}
      className={`bg-background/95 backdrop-blur-xl border-r border-border/50 transition-all duration-300 ${
        isMobile ? 'fixed z-50' : ''
      }`}
      style={{
        '--sidebar-width-icon': isCollapsed ? '4.5rem' : undefined,
        '--sidebar-width': !isCollapsed ? '16rem' : undefined,
      } as React.CSSProperties}
      collapsible="icon"
    >
      <SidebarContent className="h-full flex flex-col bg-background/95 backdrop-blur-xl">
        {/* Header */}
        <div className="p-4 border-b border-border/30">
          <div className="flex items-center gap-3">
            <SmartTaskLogo 
              size="sm" 
              variant="auto"
              showText={!isCollapsed}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-4">
          {/* Main Navigation */}
          <div className="space-y-1 mb-6">
            {!isCollapsed && (
              <h3 className="px-3 mb-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
                Main
              </h3>
            )}
            {mainItems.map((item) => (
              <NavLink 
                key={item.title}
                to={item.url} 
                end 
                className={getNavCls}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} flex-shrink-0`} />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>

          {/* Workspace */}
          <div className="space-y-1 mb-6">
            {!isCollapsed && (
              <h3 className="px-3 mb-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
                Workspace
              </h3>
            )}
            {workspaceItems.map((item) => (
              <NavLink 
                key={item.title}
                to={item.url} 
                className={getNavCls}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} flex-shrink-0`} />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>

          {/* AI Tools */}
          <div className="space-y-1 mb-6">
            {!isCollapsed && (
              <h3 className="px-3 mb-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
                AI Tools
              </h3>
            )}
            {aiItems.map((item) => (
              <NavLink 
                key={item.title}
                to={item.url} 
                className={getNavCls}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} flex-shrink-0`} />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>

          {/* Team */}
          <div className="space-y-1">
            {!isCollapsed && (
              <h3 className="px-3 mb-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wide">
                Team
              </h3>
            )}
            {teamItems.map((item) => (
              <NavLink 
                key={item.title}
                to={item.url} 
                className={getNavCls}
                onClick={() => isMobile && setOpenMobile(false)}
              >
                <item.icon className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} flex-shrink-0`} />
                {!isCollapsed && <span>{item.title}</span>}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Settings - Fixed at bottom */}
        <div className="px-3 py-2 border-t border-border/30 flex-shrink-0">
          <NavLink 
            to="/dashboard/settings" 
            className={getNavCls}
            onClick={() => isMobile && setOpenMobile(false)}
          >
            <Settings className={`${isCollapsed ? 'w-6 h-6' : 'w-4 h-4'} flex-shrink-0`} />
            {!isCollapsed && <span>Settings</span>}
          </NavLink>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}