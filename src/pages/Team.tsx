import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TeamMembersModal } from "@/components/team/TeamMembersModal";
import { TeamInvitationModal } from "@/components/team/TeamInvitationModal";
import { TeamActivityFeed } from "@/components/team/TeamActivityFeed";
import { useProjects } from "@/hooks/useProjects";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { 
  Users, 
  UserPlus, 
  Search, 
  Shield, 
  Calendar,
  Mail,
  MoreHorizontal
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Team() {
  const { projects } = useProjects();
  const [selectedProject, setSelectedProject] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isTeamMembersOpen, setIsTeamMembersOpen] = useState(false);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  // Use the first project if available, or allow selection
  const projectId = selectedProject || projects[0]?.id;
  const { members, loading } = useTeamMembers(projectId);

  const filteredMembers = members.filter(member => 
    member.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin": return "bg-destructive text-destructive-foreground";
      case "editor": return "bg-warning text-warning-foreground";
      case "viewer": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "U";
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="flex flex-col min-h-screen glass-morphism-bg">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="glass-morphism-card p-6 rounded-xl border-0">
            <h1 className="text-3xl font-bold text-primary-readable">Team Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage team members, roles, and collaboration across projects.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              onClick={() => setIsTeamMembersOpen(true)}
              disabled={!projectId}
              className="glass-morphism-button border-0 bg-white/5"
            >
              <Users className="w-4 h-4 mr-2" />
              Manage Team
            </Button>
            <Button 
              className="glass-morphism-button bg-gradient-primary hover:shadow-glow transition-smooth border-0"
              onClick={() => setIsInviteModalOpen(true)}
              disabled={!projectId}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Members
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column - Team Overview */}
          <div className="xl:col-span-2 space-y-6">
            {/* Project Selection */}
            <Card className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Project Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Select Project</label>
                    <select 
                      className="w-full p-2 bg-card border border-border rounded-md"
                      value={selectedProject}
                      onChange={(e) => setSelectedProject(e.target.value)}
                    >
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {members.length} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Active project
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Search and Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input 
                  placeholder="Search team members..." 
                  className="pl-10 bg-card/50 border-border/50"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Team Members List */}
            <Card className="glass-morphism-card border-0 light:shadow-sm light:bg-white/95 light:border-primary/10">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  Team Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-4 bg-muted/20 rounded-lg animate-pulse">
                        <div className="w-10 h-10 bg-muted rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-muted rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-muted rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filteredMembers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredMembers.map((member) => (
                      <div key={member.user_id} className="flex items-center gap-3 p-4 bg-card/30 light:bg-white/70 light:border light:border-primary/10 rounded-lg hover:bg-card/50 light:hover:bg-white/90 transition-colors">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-primary text-white">
                            {getInitials(member.user_profile?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium truncate">
                              {member.user_profile?.full_name || "Unknown User"}
                            </h4>
                            <Badge className={getRoleColor(member.role)}>
                              {member.role}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground truncate">
                              {member.user_profile?.email}
                            </p>
                          </div>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Change Role</DropdownMenuItem>
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Remove from Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No team members found</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchTerm ? "Try adjusting your search terms." : "Start by inviting team members to collaborate."}
                    </p>
                    <Button 
                      className="bg-gradient-primary"
                      onClick={() => setIsInviteModalOpen(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Invite Members
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Activity Feed */}
          <div className="space-y-6">
            <TeamActivityFeed />
          </div>
        </div>

        {/* Team Management Modals */}
        {projectId && (
          <>
            <TeamMembersModal 
              projectId={projectId}
              isOpen={isTeamMembersOpen}
              onClose={() => setIsTeamMembersOpen(false)}
            />
            <TeamInvitationModal 
              projectId={projectId}
              isOpen={isInviteModalOpen}
              onClose={() => setIsInviteModalOpen(false)}
            />
          </>
        )}
      </div>
    </div>
  );
}