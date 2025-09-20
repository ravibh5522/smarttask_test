import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb, Clock, Users, CheckCircle, X } from "lucide-react";

interface AiSuggestion {
  id: string;
  type: "task-optimization" | "workload-balance" | "deadline-adjustment" | "automation";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  confidence: number;
  reasoning: string;
}

const mockSuggestions: AiSuggestion[] = [
  {
    id: "1",
    type: "task-optimization",
    title: "Split complex task into subtasks",
    description: "The 'Design user onboarding flow' task could be broken down into 3 smaller tasks for better tracking",
    impact: "high",
    confidence: 92,
    reasoning: "Historical data shows similar tasks complete 40% faster when decomposed"
  },
  {
    id: "2", 
    type: "workload-balance",
    title: "Reassign overdue tasks",
    description: "Mike Johnson has 3 overdue tasks. Consider redistributing to available team members",
    impact: "high", 
    confidence: 87,
    reasoning: "Current workload is 180% of capacity, team has available bandwidth"
  },
  {
    id: "3",
    type: "deadline-adjustment", 
    title: "Adjust project milestone",
    description: "Based on current velocity, consider extending Project Alpha deadline by 3 days",
    impact: "medium",
    confidence: 78,
    reasoning: "Current completion rate suggests 15% risk of missing deadline"
  },
  {
    id: "4",
    type: "automation",
    title: "Automate status updates",
    description: "Set up automatic status changes when code review is approved",
    impact: "low",
    confidence: 95,
    reasoning: "Will save 2 hours/week of manual updates across the team"
  }
];

export function AiAssistant() {
  const [suggestions, setSuggestions] = useState(mockSuggestions);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);

  const getImpactColor = (impact: AiSuggestion["impact"]) => {
    switch (impact) {
      case "high": return "bg-destructive text-destructive-foreground";
      case "medium": return "bg-warning text-warning-foreground"; 
      case "low": return "bg-primary/20 text-primary";
    }
  };

  const getTypeIcon = (type: AiSuggestion["type"]) => {
    switch (type) {
      case "task-optimization": return <Lightbulb className="w-4 h-4" />;
      case "workload-balance": return <Users className="w-4 h-4" />;
      case "deadline-adjustment": return <Clock className="w-4 h-4" />;
      case "automation": return <CheckCircle className="w-4 h-4" />;
    }
  };

  const applySuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
    // In a real app, this would trigger the actual suggestion implementation
  };

  const dismissSuggestion = (id: string) => {
    setSuggestions(suggestions.filter(s => s.id !== id));
  };

  return (
    <Card className="bg-gradient-ai text-white border-primary/20 shadow-ai-glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Brain className="w-5 h-5 ai-pulse" />
          AI Assistant
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30 ml-auto">
            {suggestions.length} suggestions
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-white/70">
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>All caught up! No new suggestions at the moment.</p>
          </div>
        ) : (
          suggestions.slice(0, 3).map((suggestion) => (
            <div key={suggestion.id} className="bg-white/10 rounded-lg p-4 backdrop-blur-sm border border-white/20">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <div className="bg-white/20 p-2 rounded-lg">
                    {getTypeIcon(suggestion.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-white">{suggestion.title}</h4>
                      <Badge 
                        variant="outline" 
                        className="bg-white/20 text-white border-white/30 text-xs"
                      >
                        {suggestion.confidence}% confident
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-white/80 mb-2">
                      {suggestion.description}
                    </p>
                    
                    {expandedSuggestion === suggestion.id && (
                      <div className="bg-white/5 rounded p-3 mb-3">
                        <p className="text-xs text-white/70">
                          <strong>Why:</strong> {suggestion.reasoning}
                        </p>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Badge className={`${getImpactColor(suggestion.impact)} text-xs`}>
                        {suggestion.impact} impact
                      </Badge>
                      
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-white/80 hover:text-white p-0 h-auto text-xs"
                        onClick={() => setExpandedSuggestion(
                          expandedSuggestion === suggestion.id ? null : suggestion.id
                        )}
                      >
                        {expandedSuggestion === suggestion.id ? "Hide details" : "Why?"}
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <Button 
                    variant="secondary"
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                    onClick={() => applySuggestion(suggestion.id)}
                  >
                    Apply
                  </Button>
                  <Button 
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white/80 hover:bg-white/10 p-1 h-6 w-6"
                    onClick={() => dismissSuggestion(suggestion.id)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
        
        {suggestions.length > 3 && (
          <Button 
            variant="secondary" 
            className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
          >
            View All Suggestions ({suggestions.length - 3} more)
          </Button>
        )}
      </CardContent>
    </Card>
  );
}