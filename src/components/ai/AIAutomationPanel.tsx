import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Zap, 
  Settings, 
  Clock, 
  Users, 
  Target, 
  Bell,
  CheckCircle,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface AutomationRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: 'task' | 'notification' | 'assignment' | 'scheduling';
  icon: React.ReactNode;
}

export function AIAutomationPanel() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([
    {
      id: 'auto-priority',
      name: 'Smart Task Prioritization',
      description: 'Automatically adjust task priorities based on deadlines and dependencies',
      enabled: true,
      type: 'task',
      icon: <Target className="w-4 h-4" />
    },
    {
      id: 'overdue-alerts',
      name: 'Overdue Task Alerts',
      description: 'Send notifications when tasks become overdue',
      enabled: true,
      type: 'notification',
      icon: <Bell className="w-4 h-4" />
    },
    {
      id: 'smart-assignment',
      name: 'Intelligent Task Assignment',
      description: 'Suggest optimal team member assignments based on workload and skills',
      enabled: false,
      type: 'assignment',
      icon: <Users className="w-4 h-4" />
    },
    {
      id: 'deadline-estimation',
      name: 'AI Deadline Estimation',
      description: 'Predict realistic completion dates based on historical data',
      enabled: false,
      type: 'scheduling',
      icon: <Calendar className="w-4 h-4" />
    },
    {
      id: 'daily-standup',
      name: 'Daily Standup Reminders',
      description: 'Automated daily progress summaries and team check-ins',
      enabled: true,
      type: 'notification',
      icon: <Clock className="w-4 h-4" />
    }
  ]);

  const toggleAutomation = (ruleId: string) => {
    setAutomationRules(prev => 
      prev.map(rule => 
        rule.id === ruleId 
          ? { ...rule, enabled: !rule.enabled }
          : rule
      )
    );
    
    const rule = automationRules.find(r => r.id === ruleId);
    if (rule) {
      toast.success(`${rule.name} ${rule.enabled ? 'disabled' : 'enabled'}`);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'task': return 'bg-primary text-primary-foreground';
      case 'notification': return 'bg-warning text-warning-foreground';
      case 'assignment': return 'bg-success text-success-foreground';
      case 'scheduling': return 'bg-info text-info-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const activeRules = automationRules.filter(rule => rule.enabled).length;

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            AI Automation
          </CardTitle>
          <Badge variant="outline">
            {activeRules}/{automationRules.length} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Automation Status */}
          <div className="p-3 bg-primary/10 border border-primary/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm font-medium">Automation Status</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {activeRules > 0 
                ? `${activeRules} automation rules are currently active and working in the background.`
                : 'No automation rules are currently active. Enable rules below to get started.'
              }
            </p>
          </div>

          {/* Automation Rules */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Automation Rules
            </h4>
            
            <div className="space-y-2">
              {automationRules.map((rule) => (
                <div 
                  key={rule.id} 
                  className="flex items-center gap-3 p-3 bg-card/30 rounded-lg border border-border/30"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-1.5 bg-muted rounded">
                      {rule.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="text-sm font-medium">{rule.name}</h5>
                        <Badge className={getTypeColor(rule.type)} variant="outline">
                          {rule.type}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {rule.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={rule.enabled}
                    onCheckedChange={() => toggleAutomation(rule.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="pt-2 border-t border-border/50">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setAutomationRules(prev => prev.map(rule => ({ ...rule, enabled: true })));
                  toast.success("All automation rules enabled");
                }}
                className="flex-1"
              >
                Enable All
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setAutomationRules(prev => prev.map(rule => ({ ...rule, enabled: false })));
                  toast.success("All automation rules disabled");
                }}
                className="flex-1"
              >
                Disable All
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 p-2 bg-warning/10 border border-warning/20 rounded text-xs">
            <AlertTriangle className="w-3 h-3 text-warning mt-0.5 flex-shrink-0" />
            <p className="text-muted-foreground">
              Automation rules help streamline your workflow but can be disabled at any time. 
              Some features require premium subscription.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}