import { useState } from "react";
import { Calendar, CheckCircle2, Circle, Plus, Target, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProjectMilestones } from "@/hooks/useProjectMilestones";
import { format, parseISO, isAfter, isBefore } from "date-fns";

interface ProjectRoadmapProps {
  projectId: string;
}

export const ProjectRoadmap = ({ projectId }: ProjectRoadmapProps) => {
  const { 
    milestones, 
    loading, 
    createMilestone, 
    completeMilestone, 
    getProgressPercentage,
    getOverdueMilestones 
  } = useProjectMilestones(projectId);
  
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateMilestone = async () => {
    await createMilestone(newMilestone);
    setNewMilestone({ title: "", description: "", due_date: "" });
    setIsDialogOpen(false);
  };

  const getStatusIcon = (milestone: any) => {
    if (milestone.status === 'completed') {
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    }
    if (milestone.due_date && isAfter(new Date(), parseISO(milestone.due_date))) {
      return <AlertTriangle className="w-5 h-5 text-destructive" />;
    }
    return <Circle className="w-5 h-5 text-muted-foreground" />;
  };

  const getStatusColor = (milestone: any) => {
    if (milestone.status === 'completed') return 'border-success bg-success/10';
    if (milestone.due_date && isAfter(new Date(), parseISO(milestone.due_date))) {
      return 'border-destructive bg-destructive/10';
    }
    return 'border-border bg-card';
  };

  if (loading) return <div>Loading roadmap...</div>;

  const progressPercentage = getProgressPercentage();
  const overdueMilestones = getOverdueMilestones();

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <CardTitle>Project Roadmap</CardTitle>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Milestone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={newMilestone.title}
                      onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                      placeholder="Milestone title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newMilestone.description}
                      onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                      placeholder="Milestone description"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Due Date</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={newMilestone.due_date}
                      onChange={(e) => setNewMilestone({ ...newMilestone, due_date: e.target.value })}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateMilestone} disabled={!newMilestone.title}>
                      Create Milestone
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">{progressPercentage}%</span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            
            {overdueMilestones.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4" />
                {overdueMilestones.length} milestone{overdueMilestones.length > 1 ? 's' : ''} overdue
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">No milestones yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first milestone to start tracking project progress
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add First Milestone
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border"></div>
            
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="relative pl-16 pb-8">
                {/* Timeline dot */}
                <div className="absolute left-4 w-4 h-4 bg-background border-2 border-primary rounded-full"></div>
                
                {/* Milestone card */}
                <Card className={getStatusColor(milestone)}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(milestone)}
                        <div>
                          <CardTitle className="text-lg">{milestone.title}</CardTitle>
                          {milestone.due_date && (
                            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                              <Calendar className="w-3 h-3" />
                              Due {format(parseISO(milestone.due_date), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={milestone.status === 'completed' ? 'default' : 'secondary'}>
                          {milestone.status}
                        </Badge>
                        {milestone.status !== 'completed' && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => completeMilestone(milestone.id)}
                          >
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  {milestone.description && (
                    <CardContent className="pt-0">
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </CardContent>
                  )}
                </Card>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};