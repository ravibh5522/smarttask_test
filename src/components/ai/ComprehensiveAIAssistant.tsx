import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, FileText, Zap, Brain, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import { useAIComprehensiveAssistant, AIReport, AIAnalysis } from '@/hooks/useAIComprehensiveAssistant';
import { toast } from 'sonner';

interface ComprehensiveAIAssistantProps {
  projectId: string;
}

// Apply glass morphism to the AI assistant
export function ComprehensiveAIAssistant({ projectId }: ComprehensiveAIAssistantProps) {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReportType, setSelectedReportType] = useState<string>('project_summary');
  const [analysisQuery, setAnalysisQuery] = useState('');
  const [report, setReport] = useState<AIReport | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  const { generateReport, executeAction, analyzeProject, loading, error } = useAIComprehensiveAssistant();

  const handleGenerateReport = async () => {
    const result = await generateReport(projectId, selectedReportType as any);
    if (result) {
      setReport(result);
      toast.success('Report generated successfully!');
    }
  };

  const handleAnalyzeProject = async () => {
    if (!analysisQuery.trim()) {
      toast.error('Please enter a query for analysis');
      return;
    }
    
    const result = await analyzeProject(projectId, analysisQuery);
    if (result) {
      setAnalysis(result);
      toast.success('Analysis completed!');
    }
  };

  const handleExecuteAction = async (actionType: string, params: any) => {
    const result = await executeAction(projectId, actionType, params);
    if (result?.success) {
      toast.success('Action executed successfully!');
      // Refresh analysis if needed
      if (analysisQuery) {
        handleAnalyzeProject();
      }
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'medium': return 'bg-warning/10 text-warning border-warning/20';
      case 'low': return 'bg-success/10 text-success border-success/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      <Card className="glass-morphism-card border-0 shadow-glow">
        <CardHeader className="bg-gradient-ai/10 border-b border-white/10">
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary ai-pulse" />
            <span className="text-primary-readable font-semibold">AI Project Assistant</span>
            <Badge variant="secondary" className="ml-2 glass-badge">Powered by Gemini</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="glass-morphism-card border-0 bg-background/80">
              <TabsTrigger value="reports" className="glass-morphism-button border-0 data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">
                <FileText className="h-4 w-4 mr-2" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="analysis" className="glass-morphism-button border-0 data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analysis
              </TabsTrigger>
              <TabsTrigger value="actions" className="glass-morphism-button border-0 data-[state=active]:bg-primary/20 data-[state=active]:text-primary-foreground">
                <Zap className="h-4 w-4 mr-2" />
                Smart Actions
              </TabsTrigger>
            </TabsList>

            {/* Reports Tab */}
            <TabsContent value="reports" className="space-y-4">
              <div className="flex items-center gap-4">
                <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                  <SelectTrigger className="w-[300px] glass-input">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent className="glass-morphism-card border-0">
                    <SelectItem value="project_summary">Project Summary</SelectItem>
                    <SelectItem value="performance_analysis">Performance Analysis</SelectItem>
                    <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                    <SelectItem value="team_productivity">Team Productivity</SelectItem>
                    <SelectItem value="milestone_review">Milestone Review</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={handleGenerateReport} 
                  disabled={loading}
                  className="glass-morphism-button bg-gradient-primary hover:shadow-glow border-0 text-primary-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  Generate Report
                </Button>
              </div>

              {report && (
                <Card className="mt-4 glass-morphism-card border-0">
                  <CardHeader>
                    <CardTitle className="text-2xl text-primary-readable font-semibold">{report.reportTitle}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Executive Summary */}
                    <div>
                      <h3 className="text-lg font-semibold mb-2 text-foreground">Executive Summary</h3>
                      <p className="text-muted-foreground">{report.executiveSummary}</p>
                    </div>

                    {/* Key Metrics */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-foreground">Key Metrics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {Object.entries(report.keyMetrics).map(([key, value]) => (
                          <Card key={key} className="p-4 glass-morphism-card border-0 min-h-[80px] flex flex-col justify-center">
                            <div className="text-sm text-muted-foreground capitalize mb-1">
                              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                            </div>
                            <div className="text-xl font-bold text-foreground">{value}</div>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Findings */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-foreground">Key Findings</h3>
                      <div className="space-y-3">
                        {report.findings.map((finding, index) => (
                            <Card key={index} className="p-4 glass-morphism-card border-0">
                              <div className="flex items-start justify-between mb-2">
                                <h4 className="font-medium text-foreground">{finding.category}</h4>
                                <Badge className={`${getImpactColor(finding.impact)} border`}>
                                  {finding.impact} impact
                                </Badge>
                              </div>
                            <p className="text-sm text-muted-foreground mb-2">{finding.finding}</p>
                            <p className="text-sm text-primary-readable font-medium">{finding.recommendation}</p>
                          </Card>
                        ))}
                      </div>
                    </div>

                    {/* Recommendations */}
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-foreground">Recommendations</h3>
                      <div className="space-y-3">
                        {report.recommendations.map((rec, index) => (
                          <Card key={index} className="p-4 glass-morphism-card border-0">
                            <div className="flex items-start justify-between mb-2">
                              <Badge variant={getPriorityColor(rec.priority)}>
                                {rec.priority} priority
                              </Badge>
                              <span className="text-sm text-muted-foreground">{rec.timeline}</span>
                            </div>
                            <h4 className="font-medium mb-1 text-foreground">{rec.action}</h4>
                            <p className="text-sm text-muted-foreground">{rec.expectedOutcome}</p>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Analysis Tab */}
            <TabsContent value="analysis" className="space-y-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Ask me anything about your project... 
                  
Examples:
- What tasks are blocking our progress?
- How can we improve team productivity?
- What are the biggest risks to our timeline?
- Which tasks should we prioritize this week?"
                  value={analysisQuery}
                  onChange={(e) => setAnalysisQuery(e.target.value)}
                  rows={4}
                  className="glass-input light:bg-white/95 light:border-primary/20"
                />
                
                <Button 
                  onClick={handleAnalyzeProject} 
                  disabled={loading || !analysisQuery.trim()}
                  className="glass-morphism-button bg-gradient-primary hover:shadow-glow border-0 text-primary-foreground"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Brain className="h-4 w-4 mr-2" />}
                  Analyze Project
                </Button>
              </div>

              {analysis && (
                <div className="space-y-4">
                  {/* Analysis Result */}
                    <Card className="glass-morphism-card border-0">
                      <CardHeader>
                        <CardTitle className="text-foreground">AI Analysis</CardTitle>
                      </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">{analysis.analysis}</p>
                      
                      {/* Insights */}
                      <div className="mb-4">
                        <h4 className="font-medium mb-2 text-foreground">Key Insights</h4>
                        <ul className="space-y-1">
                          {analysis.insights.map((insight, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">{insight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Recommendations */}
                      <div>
                        <h4 className="font-medium mb-2 text-foreground">Recommendations</h4>
                        <ul className="space-y-1">
                          {analysis.recommendations.map((rec, index) => (
                            <li key={index} className="flex items-start gap-2 text-sm">
                              <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                              <span className="text-foreground">{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Suggested Actions */}
                  {analysis.suggestedActions.length > 0 && (
                      <Card className="glass-morphism-card border-0">
                        <CardHeader>
                          <CardTitle className="text-foreground">Suggested Actions</CardTitle>
                        </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analysis.suggestedActions.map((action, index) => (
                              <Card key={index} className="p-4 border-l-4 border-l-primary glass-morphism-card">
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className="font-medium text-foreground">{action.description}</h4>
                                  <Button
                                    size="sm"
                                    onClick={() => handleExecuteAction(action.type, action.params)}
                                    disabled={loading}
                                    className="glass-morphism-button bg-gradient-primary hover:shadow-glow border-0 text-primary-foreground"
                                  >
                                    Execute
                                  </Button>
                                </div>
                              <p className="text-sm text-muted-foreground">{action.reasoning}</p>
                            </Card>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            {/* Smart Actions Tab */}
            <TabsContent value="actions" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Quick Actions */}
                <Card className="p-6 glass-morphism-card border-0 min-h-[200px] flex flex-col">
                  <h3 className="font-medium mb-4 text-foreground text-lg">Quick Task Actions</h3>
                  <div className="space-y-3 flex-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start glass-morphism-button border-0 h-10"
                      onClick={() => handleExecuteAction('create_task', {
                        title: 'Weekly Team Sync',
                        description: 'Schedule and conduct weekly team synchronization meeting',
                        priority: 'medium'
                      })}
                    >
                      Create Weekly Sync Task
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start glass-morphism-button border-0 h-10"
                      onClick={() => handleExecuteAction('create_task', {
                        title: 'Project Status Review',
                        description: 'Review project progress and identify blockers',
                        priority: 'high'
                      })}
                    >
                      Create Status Review
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 glass-morphism-card border-0 min-h-[200px] flex flex-col">
                  <h3 className="font-medium mb-4 text-foreground text-lg">Milestone Actions</h3>
                  <div className="space-y-3 flex-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start glass-morphism-button border-0 h-10"
                      onClick={() => handleExecuteAction('create_milestone', {
                        title: 'Sprint Planning Complete',
                        description: 'All tasks planned and assigned for current sprint',
                        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                      })}
                    >
                      Add Sprint Milestone
                    </Button>
                  </div>
                </Card>

                <Card className="p-6 glass-morphism-card border-0 min-h-[200px] flex flex-col">
                  <h3 className="font-medium mb-4 text-foreground text-lg">Team Actions</h3>
                  <div className="space-y-3 flex-1">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start glass-morphism-button border-0 h-10"
                      onClick={() => handleExecuteAction('schedule_meeting', {
                        title: 'Team Retrospective',
                        description: 'Review team performance and identify improvements',
                        duration: 60
                      })}
                    >
                      Schedule Retrospective
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="w-full justify-start glass-morphism-button border-0 h-10"
                      onClick={() => handleExecuteAction('send_reminder', {
                        type: 'deadline_reminder',
                        message: 'Reminder: Project deadlines approaching'
                      })}
                    >
                      Send Deadline Reminder
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-destructive glass-morphism-card bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}