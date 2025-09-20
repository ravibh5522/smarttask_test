import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAITaskSuggestions, TaskSuggestion } from "@/hooks/useAITaskSuggestions";
import { useTasks } from "@/hooks/useTasks";
import { 
  Lightbulb, 
  Plus, 
  Clock, 
  Target, 
  CheckCircle,
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

interface AITaskSuggestionsProps {
  projectId: string;
}

export function AITaskSuggestions({ projectId }: AITaskSuggestionsProps) {
  const { generateSuggestions, loading, error } = useAITaskSuggestions();
  const { createTask } = useTasks(projectId);
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [insights, setInsights] = useState<string>("");
  const [userContext, setUserContext] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creatingTasks, setCreatingTasks] = useState<Set<number>>(new Set());

  const handleGenerateSuggestions = async () => {
    const result = await generateSuggestions(projectId, userContext);
    if (result) {
      setSuggestions(result.suggestions);
      setInsights(result.insights);
      toast.success("AI task suggestions generated!");
    } else {
      toast.error(error || "Failed to generate suggestions");
    }
  };

  const handleCreateTask = async (suggestion: TaskSuggestion, index: number) => {
    setCreatingTasks(prev => new Set(prev).add(index));
    
    try {
      await createTask({
        title: suggestion.title,
        description: suggestion.description,
        priority: suggestion.priority,
        project_id: projectId
      });
      
      toast.success("Task created successfully!");
      
      // Remove the suggestion after creating
      setSuggestions(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      toast.error("Failed to create task");
    } finally {
      setCreatingTasks(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'low': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Task Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Context Input */}
          <div className="space-y-2">
            <Textarea
              placeholder="Describe what you're working on or what help you need... (optional)"
              value={userContext}
              onChange={(e) => setUserContext(e.target.value)}
              className="min-h-[80px] bg-card/30"
            />
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateSuggestions}
            disabled={loading}
            className="w-full bg-gradient-primary"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Suggestions...
              </>
            ) : (
              <>
                <Lightbulb className="w-4 h-4 mr-2" />
                Generate AI Suggestions
              </>
            )}
          </Button>

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
              {error}
            </div>
          )}

          {/* Insights */}
          {insights && (
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-md">
              <h4 className="font-medium text-primary mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                AI Insights
              </h4>
              <p className="text-sm text-muted-foreground">{insights}</p>
            </div>
          )}

          {/* Suggestions List */}
          {suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-success" />
                Suggested Tasks ({suggestions.length})
              </h4>
              
              <div className="space-y-3">
                {suggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-card/30 rounded-lg border border-border/50">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h5 className="font-medium text-sm">{suggestion.title}</h5>
                          <p className="text-xs text-muted-foreground mt-1">
                            {suggestion.description}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleCreateTask(suggestion, index)}
                          disabled={creatingTasks.has(index)}
                          className="ml-3"
                        >
                          {creatingTasks.has(index) ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Plus className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={getPriorityColor(suggestion.priority)}>
                          {suggestion.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {suggestion.estimatedHours}h
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground bg-muted/20 p-2 rounded">
                        <strong>Why:</strong> {suggestion.reasoning}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No suggestions placeholder */}
          {!loading && suggestions.length === 0 && !insights && (
            <div className="text-center py-6 text-muted-foreground">
              <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Click "Generate AI Suggestions" to get intelligent task recommendations</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}