import { useState } from "react";
import { Play, Pause, Clock, Edit3, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useTimeTracking } from "@/hooks/useTimeTracking";
import { formatDistanceToNow } from "date-fns";

interface TimeTrackerProps {
  projectId: string;
  taskId?: string;
  taskTitle?: string;
}

export const TimeTracker = ({ projectId, taskId, taskTitle }: TimeTrackerProps) => {
  const { activeTimer, timeEntries, startTimer, stopTimer, loading } = useTimeTracking(projectId, taskId);
  const [description, setDescription] = useState("");

  const handleStartTimer = async () => {
    if (!taskId) return;
    await startTimer(taskId, projectId, description);
    setDescription("");
  };

  const handleStopTimer = async () => {
    if (activeTimer) {
      await stopTimer(activeTimer.id);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatElapsedTime = (startTime: string) => {
    const start = new Date(startTime);
    const now = new Date();
    const elapsed = Math.floor((now.getTime() - start.getTime()) / 60000);
    return formatDuration(elapsed);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Time Tracking
          {taskTitle && <span className="text-sm text-muted-foreground">• {taskTitle}</span>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Timer */}
        {activeTimer && (
          <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Timer Running</div>
                <div className="text-sm text-muted-foreground">
                  Started {formatDistanceToNow(new Date(activeTimer.start_time))} ago
                </div>
                <div className="text-lg font-mono text-primary">
                  {formatElapsedTime(activeTimer.start_time)}
                </div>
              </div>
              <Button onClick={handleStopTimer} variant="outline" size="sm">
                <Pause className="w-4 h-4 mr-2" />
                Stop
              </Button>
            </div>
          </div>
        )}

        {/* Start Timer */}
        {!activeTimer && taskId && (
          <div className="space-y-3">
            <Textarea
              placeholder="What are you working on? (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
            <Button onClick={handleStartTimer} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Start Timer
            </Button>
          </div>
        )}

        {/* Recent Time Entries */}
        {timeEntries.length > 0 && (
          <div className="space-y-4">
            <h4 className="font-medium text-lg">Recent Entries</h4>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {timeEntries.slice(0, 5).map((entry, index) => (
                <div key={entry.id} className="glass-morphism-card p-4 rounded-xl border-0 hover-scale transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-primary">
                          {entry.duration_minutes ? formatDuration(entry.duration_minutes) : 'Active'}
                        </span>
                        {entry.billable && (
                          <Badge variant="secondary" className="glass-morphism-badge bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            Billable
                          </Badge>
                        )}
                      </div>
                      {entry.description && (
                        <div className="text-sm text-muted-foreground mb-2 p-2 bg-white/5 rounded-md border border-white/10">
                          {entry.description}
                        </div>
                      )}
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(entry.start_time))} ago
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="glass-morphism-button border-0 bg-white/5 hover:bg-white/10">
                        <Edit3 className="w-3 h-3" />
                      </Button>
                      <Button variant="ghost" size="sm" className="glass-morphism-button border-0 bg-white/5 hover:bg-red-500/20">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Separator line between entries */}
                  {index < timeEntries.slice(0, 5).length - 1 && (
                    <div className="mt-4 h-px w-full bg-gradient-to-r from-transparent via-border to-transparent opacity-50"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};