import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAIProjectInsights, ProjectInsight, ProjectRecommendation } from "@/hooks/useAIProjectInsights";
import { 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  Zap,
  Target,
  Calendar,
  AlertCircle,
  Loader2,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface AIProjectInsightsProps {
  projectId: string;
}

export function AIProjectInsights({ projectId }: AIProjectInsightsProps) {
  const { generateInsights, loading, error } = useAIProjectInsights();
  const [insights, setInsights] = useState<any>(null);

  useEffect(() => {
    if (projectId) {
      handleGenerateInsights();
    }
  }, [projectId]);

  const handleGenerateInsights = async () => {
    const result = await generateInsights(projectId);
    if (result) {
      setInsights(result);
      toast.success("Project insights updated!");
    } else {
      toast.error(error || "Failed to generate insights");
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'fair': return 'text-warning';
      case 'poor': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-warning" />;
      case 'critical': return <AlertCircle className="w-4 h-4 text-destructive" />;
      case 'info': return <Info className="w-4 h-4 text-primary" />;
      default: return <Info className="w-4 h-4 text-muted-foreground" />;
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            AI Project Insights
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleGenerateInsights}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading && !insights && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground">Analyzing project data...</p>
          </div>
        )}

        {error && !insights && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-destructive text-sm">
            {error}
          </div>
        )}

        {insights && (
          <div className="space-y-6">
            {/* Health Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Project Health</h3>
                <Badge className={getHealthColor(insights.overallHealth)}>
                  {insights.overallHealth.toUpperCase()}
                </Badge>
              </div>
              <Progress value={insights.healthScore} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Health Score: {insights.healthScore}/100
              </p>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-card/30 rounded-lg">
                <div className="text-lg font-semibold text-primary">
                  {insights.keyMetrics.completionRate}
                </div>
                <div className="text-xs text-muted-foreground">Completion</div>
              </div>
              <div className="text-center p-3 bg-card/30 rounded-lg">
                <div className="text-lg font-semibold text-success">
                  {insights.keyMetrics.productivity}
                </div>
                <div className="text-xs text-muted-foreground">Productivity</div>
              </div>
              <div className="text-center p-3 bg-card/30 rounded-lg">
                <div className="text-lg font-semibold text-warning">
                  {insights.keyMetrics.riskLevel}
                </div>
                <div className="text-xs text-muted-foreground">Risk Level</div>
              </div>
            </div>

            {/* Insights */}
            {insights.insights && insights.insights.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Key Insights
                </h3>
                <div className="space-y-2">
                  {insights.insights.map((insight: ProjectInsight, index: number) => (
                    <div key={index} className="p-3 bg-card/20 rounded-lg border border-border/30">
                      <div className="flex items-start gap-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium">{insight.title}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {insight.description}
                          </p>
                          <div className="text-xs text-primary mt-2 font-medium">
                            Action: {insight.actionItem}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {insights.recommendations && insights.recommendations.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {insights.recommendations.map((rec: ProjectRecommendation, index: number) => (
                    <div key={index} className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="flex items-start gap-3">
                        <Badge className={getPriorityColor(rec.priority)}>
                          {rec.priority}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{rec.action}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Expected Impact: {rec.impact}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Predictions */}
            {insights.predictions && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Predictions
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-card/20 rounded">
                    <strong>Completion Date:</strong> {insights.predictions.completionDate}
                  </div>
                  
                  {insights.predictions.risksIdentified.length > 0 && (
                    <div className="p-2 bg-warning/10 rounded">
                      <strong>Risks Identified:</strong>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        {insights.predictions.risksIdentified.map((risk: string, index: number) => (
                          <li key={index}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {insights.predictions.bottlenecks.length > 0 && (
                    <div className="p-2 bg-destructive/10 rounded">
                      <strong>Bottlenecks:</strong>
                      <ul className="list-disc list-inside mt-1 text-muted-foreground">
                        {insights.predictions.bottlenecks.map((bottleneck: string, index: number) => (
                          <li key={index}>{bottleneck}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {!loading && !insights && !error && (
          <div className="text-center py-6 text-muted-foreground">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">AI insights will appear here</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}