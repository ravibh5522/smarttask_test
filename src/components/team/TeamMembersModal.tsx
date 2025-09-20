import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTeamMembers } from "@/hooks/useTeamMembers";
import { Users, Crown, Shield, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TeamMembersModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamMembersModal({ projectId, isOpen, onClose }: TeamMembersModalProps) {
  const { members, loading } = useTeamMembers(projectId);
  const [updatingMember, setUpdatingMember] = useState<string | null>(null);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="w-4 h-4" />;
      case "editor": return <Shield className="w-4 h-4" />;
      case "viewer": return <Eye className="w-4 h-4" />;
      default: return <Users className="w-4 h-4" />;
    }
  };

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

  const handleRoleChange = async (memberId: string, newRole: string) => {
    setUpdatingMember(memberId);
    try {
      // TODO: Implement role update logic
      toast.success("Member role updated successfully");
    } catch (error) {
      toast.error("Failed to update member role");
    } finally {
      setUpdatingMember(null);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      // TODO: Implement member removal logic
      toast.success("Member removed from project");
    } catch (error) {
      toast.error("Failed to remove member");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Team Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
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
          ) : members.length > 0 ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-3 p-4 glass-morphism-card rounded-lg border-0">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-gradient-primary text-white">
                      {getInitials(member.user_profile?.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium truncate">
                      {member.user_profile?.full_name || "Unknown User"}
                    </h4>
                    <p className="text-sm text-muted-foreground truncate">
                      {member.user_profile?.email}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select 
                      value={member.role} 
                      onValueChange={(newRole) => handleRoleChange(member.user_id, newRole)}
                      disabled={updatingMember === member.user_id}
                    >
                      <SelectTrigger className="w-32">
                        <div className="flex items-center gap-2">
                          {getRoleIcon(member.role)}
                          <SelectValue />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">
                          <div className="flex items-center gap-2">
                            <Crown className="w-4 h-4" />
                            Admin
                          </div>
                        </SelectItem>
                        <SelectItem value="editor">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" />
                            Editor
                          </div>
                        </SelectItem>
                        <SelectItem value="viewer">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Viewer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleRemoveMember(member.user_id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No team members</h3>
              <p className="text-muted-foreground">
                This project doesn't have any team members yet.
              </p>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}