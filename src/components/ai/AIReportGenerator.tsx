import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Eye, Calendar } from 'lucide-react';
import { useAIComprehensiveAssistant, AIReport } from '@/hooks/useAIComprehensiveAssistant';
import { toast } from 'sonner';

interface AIReportGeneratorProps {
  projectId: string;
}

export function AIReportGenerator({ projectId }: AIReportGeneratorProps) {
  const [selectedReportType, setSelectedReportType] = useState<string>('project_summary');
  const [generatedReport, setGeneratedReport] = useState<AIReport | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { generateReport, loading } = useAIComprehensiveAssistant();

  const reportTypes = [
    { value: 'project_summary', label: 'Project Summary', description: 'Overall project status and health' },
    { value: 'performance_analysis', label: 'Performance Analysis', description: 'Team productivity and efficiency metrics' },
    { value: 'risk_assessment', label: 'Risk Assessment', description: 'Identify potential risks and mitigation strategies' },
    { value: 'team_productivity', label: 'Team Productivity', description: 'Individual and team performance insights' },
    { value: 'milestone_review', label: 'Milestone Review', description: 'Progress against project milestones' },
  ];

  const handleGenerateReport = async () => {
    setIsGenerating(true);
    const result = await generateReport(projectId, selectedReportType as any);
    if (result) {
      setGeneratedReport(result);
      toast.success('Report generated successfully!');
    }
    setIsGenerating(false);
  };

  const exportReport = () => {
    if (!generatedReport) return;
    
    const reportContent = `
# ${generatedReport.reportTitle}

## Executive Summary
${generatedReport.executiveSummary}

## Key Metrics
${Object.entries(generatedReport.keyMetrics).map(([key, value]) => 
  `- ${key}: ${value}`
).join('\n')}

## Key Findings
${generatedReport.findings.map((finding, index) => 
  `${index + 1}. **${finding.category}** (${finding.impact} impact)
   - Finding: ${finding.finding}
   - Recommendation: ${finding.recommendation}`
).join('\n\n')}

## Recommendations
${generatedReport.recommendations.map((rec, index) => 
  `${index + 1}. **${rec.action}** (${rec.priority} priority)
   - Timeline: ${rec.timeline}
   - Expected Outcome: ${rec.expectedOutcome}`
).join('\n\n')}

## Next Steps
${generatedReport.nextSteps.map((step, index) => `${index + 1}. ${step}`).join('\n')}

## Risk Assessment
### Risks Identified:
${generatedReport.riskAssessment.risks.map(risk => `- ${risk}`).join('\n')}

### Mitigation Strategies:
${generatedReport.riskAssessment.mitigation.map(strategy => `- ${strategy}`).join('\n')}

---
Generated on: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([reportContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${generatedReport.reportTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Report exported successfully!');
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
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Generation Panel */}
      <Card className="gradient-border">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            AI Report Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Report Type</label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose report type" />
                </SelectTrigger>
                <SelectContent>
                  {reportTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleGenerateReport} 
                disabled={loading || isGenerating}
                className="flex items-center gap-2"
              >
                {(loading || isGenerating) ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                Generate Report
              </Button>
              
              {generatedReport && (
                <Button 
                  variant="outline" 
                  onClick={exportReport}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Report Display */}
      {generatedReport && (
        <Card>
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl">{generatedReport.reportTitle}</CardTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date().toLocaleDateString()}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Executive Summary */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Executive Summary
              </h3>
              <p className="text-muted-foreground leading-relaxed">{generatedReport.executiveSummary}</p>
            </div>

            {/* Key Metrics Grid */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Metrics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(generatedReport.keyMetrics).map(([key, value]) => (
                  <Card key={key} className="p-4 text-center">
                    <div className="text-sm text-muted-foreground capitalize mb-1">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </div>
                    <div className="text-2xl font-bold text-primary">{value}</div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Findings */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Key Findings</h3>
              <div className="space-y-4">
                {generatedReport.findings.map((finding, index) => (
                  <Card key={index} className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-lg">{finding.category}</h4>
                      <Badge className={getImpactColor(finding.impact)}>
                        {finding.impact} impact
                      </Badge>
                    </div>
                    <p className="text-muted-foreground mb-3">{finding.finding}</p>
                    <div className="p-3 bg-primary/5 rounded border-l-2 border-l-primary">
                      <p className="text-sm font-medium text-primary">💡 Recommendation</p>
                      <p className="text-sm text-muted-foreground mt-1">{finding.recommendation}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Strategic Recommendations</h3>
              <div className="space-y-4">
                {generatedReport.recommendations.map((rec, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={getPriorityColor(rec.priority)} className="text-xs">
                        {rec.priority} priority
                      </Badge>
                      <span className="text-sm text-muted-foreground">{rec.timeline}</span>
                    </div>
                    <h4 className="font-semibold mb-2">{rec.action}</h4>
                    <p className="text-sm text-muted-foreground">{rec.expectedOutcome}</p>
                  </Card>
                ))}
              </div>
            </div>

            {/* Next Steps & Risk Assessment */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Next Steps</h4>
                <ul className="space-y-2">
                  {generatedReport.nextSteps.map((step, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 bg-primary text-primary-foreground rounded-full text-xs flex items-center justify-center font-medium mt-0.5">
                        {index + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-4">
                <h4 className="font-semibold mb-3">Risk Assessment</h4>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-destructive mb-1">🚨 Risks Identified:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {generatedReport.riskAssessment.risks.map((risk, index) => (
                        <li key={index}>• {risk}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-green-600 mb-1">🛡️ Mitigation:</p>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {generatedReport.riskAssessment.mitigation.map((strategy, index) => (
                        <li key={index}>• {strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Card>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}