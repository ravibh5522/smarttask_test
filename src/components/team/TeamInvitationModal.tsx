import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useTeamInvitations } from "@/hooks/useTeamInvitations";
import { UserPlus, Mail, Send, Crown, Shield, Eye, X, Clock } from "lucide-react";
import { toast } from "sonner";

interface TeamInvitationModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function TeamInvitationModal({ projectId, isOpen, onClose }: TeamInvitationModalProps) {
  const { invitations, loading, sendInvitation, cancelInvitation } = useTeamInvitations(projectId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("viewer");
  const [sending, setSending] = useState(false);

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setSending(true);
    try {
      await sendInvitation(email.trim(), role as any);
      setEmail("");
      setRole("viewer");
      toast.success("Invitation sent successfully");
    } catch (error) {
      toast.error("Failed to send invitation");
    } finally {
      setSending(false);
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId);
      toast.success("Invitation cancelled");
    } catch (error) {
      toast.error("Failed to cancel invitation");
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin": return <Crown className="w-4 h-4" />;
      case "editor": return <Shield className="w-4 h-4" />;
      case "viewer": return <Eye className="w-4 h-4" />;
      default: return <UserPlus className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-warning text-warning-foreground";
      case "accepted": return "bg-success text-success-foreground";
      case "rejected": return "bg-destructive text-destructive-foreground";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" />
            Invite Team Members
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Invitation Form */}
          <form onSubmit={handleSendInvitation} className="space-y-4 p-4 bg-card/30 rounded-lg">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="colleague@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-card"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="bg-card">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(role)}
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Admin - Full access
                    </div>
                  </SelectItem>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Editor - Can edit and manage
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Viewer - Read-only access
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-primary"
              disabled={sending || !email.trim()}
            >
              <Send className="w-4 h-4 mr-2" />
              {sending ? "Sending..." : "Send Invitation"}
            </Button>
          </form>

          {/* Pending Invitations */}
          <div>
            <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending Invitations
            </h3>

            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-muted/20 rounded-lg animate-pulse">
                    <div className="w-8 h-8 bg-muted rounded-full"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-muted rounded w-1/2 mb-1"></div>
                      <div className="h-2 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : invitations.length > 0 ? (
              <div className="space-y-2">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center gap-3 p-3 bg-card/30 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-secondary rounded-full flex items-center justify-center">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{invitation.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {getRoleIcon(invitation.role)}
                        <span className="text-xs text-muted-foreground capitalize">{invitation.role}</span>
                        <Badge className={getStatusColor(invitation.status)}>
                          {invitation.status}
                        </Badge>
                      </div>
                    </div>

                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleCancelInvitation(invitation.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-sm text-muted-foreground bg-card/20 rounded-lg">
                No pending invitations
              </div>
            )}
          </div>

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