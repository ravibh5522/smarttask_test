import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, UserPlus, UserMinus } from "lucide-react";
import { useProjectMembers } from "@/hooks/useProjectMembers";
import { Task } from "@/hooks/useTasks";

interface TaskAssignmentProps {
  task: Task;
  onAssignmentChange?: () => void;
}

export function TaskAssignment({ task, onAssignmentChange }: TaskAssignmentProps) {
  const { members, loading, assignTaskToMember, unassignTask } = useProjectMembers(task.project_id);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async (userId: string) => {
    await assignTaskToMember(task.id, userId);
    setIsAssigning(false);
    onAssignmentChange?.();
  };

  const handleUnassign = async () => {
    await unassignTask(task.id);
    onAssignmentChange?.();
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return 'U';
  };

  const assignedMember = members.find(member => member.user_id === task.assignee_id);

  if (loading) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Assignment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Assignment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Assignment */}
        {assignedMember ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="text-xs">
                  {getInitials(assignedMember.user_profile?.full_name, assignedMember.user_profile?.email)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">
                  {assignedMember.user_profile?.full_name || assignedMember.user_profile?.email || 'Unknown User'}
                </p>
                <Badge variant="outline" className="text-xs">
                  {assignedMember.role}
                </Badge>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUnassign}
            >
              <UserMinus className="w-4 h-4 mr-2" />
              Unassign
            </Button>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No one assigned to this task</p>
          </div>
        )}

        {/* Assignment Actions */}
        {isAssigning ? (
          <div className="space-y-3">
            <Select onValueChange={handleAssign}>
              <SelectTrigger>
                <SelectValue placeholder="Select team member" />
              </SelectTrigger>
              <SelectContent>
                {members.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {getInitials(member.user_profile?.full_name, member.user_profile?.email)}
                        </AvatarFallback>
                      </Avatar>
                      <span>
                        {member.user_profile?.full_name || member.user_profile?.email || 'Unknown User'}
                      </span>
                      <Badge variant="outline" className="text-xs ml-auto">
                        {member.role}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsAssigning(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAssigning(true)}
            disabled={members.length === 0}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {assignedMember ? 'Reassign Task' : 'Assign Task'}
          </Button>
        )}

        {/* Team Members List */}
        {members.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Team Members ({members.length})</h4>
            <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
              {members.map((member) => (
                <div key={member.user_id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-lg">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {getInitials(member.user_profile?.full_name, member.user_profile?.email)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">
                      {member.user_profile?.full_name || member.user_profile?.email || 'Unknown User'}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}