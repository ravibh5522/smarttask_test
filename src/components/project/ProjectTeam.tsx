import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  MoreVertical,
  UserMinus,
  Crown,
  Shield,
  User
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { TeamInvitationModal } from "@/components/team/TeamInvitationModal";
import { format } from "date-fns";

interface ProjectTeamProps {
  projectId: string;
}

export function ProjectTeam({ projectId }: ProjectTeamProps) {
  const { members, loading } = useTeamMembers(projectId);
  const [searchTerm, setSearchTerm] = useState("");
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const filteredMembers = members.filter(member =>
    member.user_profile?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.user_profile?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'admin':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'moderator':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (loading) {
    return (
      <Card className="glass-morphism-card border-0">
        <CardContent className="p-6">
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-10 h-10 bg-muted rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded w-32" />
                  <div className="h-3 bg-muted rounded w-24" />
                </div>
                <div className="h-6 bg-muted rounded w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Management Header */}
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              Team Members ({members.length})
            </CardTitle>
            <Button 
              className="glass-morphism-button bg-gradient-primary hover:shadow-glow transition-smooth border-0"
              onClick={() => setIsInviteModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 glass-input border-0 bg-white/5"
            />
          </div>

          {/* Members List */}
          <div className="space-y-3">
            {filteredMembers.map((member) => (
              <div
                key={member.user_id}
                className="flex items-center gap-4 p-4 glass-morphism-card rounded-lg border-0 hover:shadow-glow transition-smooth"
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback>
                    {member.user_profile?.full_name?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">
                      {member.user_profile?.full_name || 'Team Member'}
                    </h3>
                    {getRoleIcon(member.role)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {member.user_profile?.email || 'member@example.com'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Joined {format(new Date(member.created_at), 'MMM d, yyyy')}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Badge className={`${getRoleBadgeColor(member.role)} glass-badge border-0`}>
                    {member.role}
                  </Badge>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 glass-morphism-button border-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="glass-morphism-card border-0">
                      <DropdownMenuItem>
                        View Profile
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        Send Message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <UserMinus className="w-4 h-4 mr-2" />
                        Remove from Project
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}

            {filteredMembers.length === 0 && (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">
                  {searchTerm ? 'No members found' : 'No team members yet'}
                </h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm 
                    ? 'Try adjusting your search terms.'
                    : 'Invite team members to collaborate on this project.'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    className="bg-gradient-primary"
                    onClick={() => setIsInviteModalOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Invite First Member
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Guide */}
      <Card className="glass-morphism-card border-0">
        <CardHeader>
          <CardTitle>Role Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 glass-morphism-card rounded-lg border-0">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-4 h-4 text-yellow-500" />
                <span className="font-medium text-yellow-500">Owner</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Full project access</li>
                <li>• Manage team members</li>
                <li>• Delete project</li>
                <li>• Billing & settings</li>
              </ul>
            </div>

            <div className="p-4 glass-morphism-card rounded-lg border-0">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-blue-500" />
                <span className="font-medium text-blue-500">Admin</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Manage tasks & milestones</li>
                <li>• Invite team members</li>
                <li>• Project settings</li>
                <li>• View all data</li>
              </ul>
            </div>

            <div className="p-4 glass-morphism-card rounded-lg border-0">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="font-medium">Member</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Create & edit tasks</li>
                <li>• Comment & collaborate</li>
                <li>• View project data</li>
                <li>• Update time tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team Invitation Modal */}
      <TeamInvitationModal 
        projectId={projectId}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}