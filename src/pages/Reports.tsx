import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIReportGenerator } from '@/components/ai/AIReportGenerator';
import { useProjects } from '@/hooks/useProjects';
import { FileText, TrendingUp, Shield, Users, Target } from 'lucide-react';

export default function Reports() {
  const { projects } = useProjects();
  const currentProjectId = projects?.[0]?.id;

  const reportCategories = [
    {
      icon: FileText,
      title: 'Project Summary',
      description: 'Comprehensive overview of project status, progress, and health metrics',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10'
    },
    {
      icon: TrendingUp,
      title: 'Performance Analysis',
      description: 'Team productivity metrics, task completion rates, and efficiency insights',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10'
    },
    {
      icon: Shield,
      title: 'Risk Assessment',
      description: 'Identify potential project risks and recommended mitigation strategies',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10'
    },
    {
      icon: Users,
      title: 'Team Productivity',
      description: 'Individual and team performance analysis with actionable recommendations',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10'
    },
    {
      icon: Target,
      title: 'Milestone Review',
      description: 'Progress tracking against project milestones and delivery timelines',
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10'
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gradient-secondary">
      <div className="flex-1 p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center gap-2">
              AI-Powered Reports 📊
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate comprehensive project insights and analytics with artificial intelligence
            </p>
          </div>
          
          <Badge variant="outline" className="px-3 py-1">
            Powered by Gemini AI
          </Badge>
        </div>

        {/* Report Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {reportCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-all duration-200">
                <CardContent className="p-4">
                  <div className={`w-12 h-12 rounded-lg ${category.bgColor} flex items-center justify-center mb-3`}>
                    <Icon className={`h-6 w-6 ${category.color}`} />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{category.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {category.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Report Generator */}
        {currentProjectId ? (
          <AIReportGenerator projectId={currentProjectId} />
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Project Selected</h3>
              <p className="text-muted-foreground">
                Please create or select a project to generate reports and insights.
              </p>
            </CardContent>
          </Card>
        )}

        {/* AI Features Notice */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-2">AI-Enhanced Analytics</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Our AI system analyzes your project data to provide intelligent insights, identify patterns, 
                  predict potential issues, and suggest optimization strategies. All reports are generated 
                  in real-time based on your current project status.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-xs">Real-time Analysis</Badge>
                  <Badge variant="secondary" className="text-xs">Predictive Insights</Badge>
                  <Badge variant="secondary" className="text-xs">Actionable Recommendations</Badge>
                  <Badge variant="secondary" className="text-xs">Risk Identification</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}