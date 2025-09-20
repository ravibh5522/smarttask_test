import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContextualGreeting } from "@/hooks/useTimeBasedGreeting";
import { useAuth } from "@/contexts/AuthContext";
import { EnhancedTimeBasedAnimation } from "@/components/ui/EnhancedTimeBasedAnimation";
import { 
  Clock, 
  Calendar, 
  User, 
  Sparkles,
  Sun,
  Moon,
  Sunset,
  Sunrise
} from "lucide-react";

export const DynamicGreetingCard: React.FC = () => {
  const { 
    greeting, 
    userName, 
    emoji, 
    timeOfDay,
    contextualMessage, 
    formattedTime,
    currentDateTime 
  } = useContextualGreeting();
  
  const { user } = useAuth();

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning':
        return <Sunrise className="w-5 h-5 text-orange-500" />;
      case 'afternoon':
        return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'evening':
        return <Sunset className="w-5 h-5 text-orange-600" />;
      case 'night':
        return <Moon className="w-5 h-5 text-blue-400" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getTimeTheme = () => {
    switch (timeOfDay) {
      case 'morning':
        return 'from-orange-500/20 to-yellow-500/20';
      case 'afternoon':
        return 'from-yellow-500/20 to-orange-500/20';
      case 'evening':
        return 'from-orange-600/20 to-red-500/20';
      case 'night':
        return 'from-blue-600/20 to-purple-600/20';
      default:
        return 'from-primary/20 to-accent/20';
    }
  };

  return (
    <Card className={`relative bg-gradient-to-br ${getTimeTheme()} border-border/50 backdrop-blur-sm overflow-hidden`}>
      {/* Enhanced Time-based Animation Background */}
      <EnhancedTimeBasedAnimation timeOfDay={timeOfDay} className="opacity-70" />
      
      <CardHeader className="pb-3 relative z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {getTimeIcon()}
              {/* Pulsing glow effect for icons */}
              <div className={`absolute inset-0 ${timeOfDay === 'morning' ? 'animate-pulse' : timeOfDay === 'afternoon' ? 'animate-bounce' : timeOfDay === 'evening' ? 'animate-pulse' : 'animate-pulse'} opacity-30`}>
                {getTimeIcon()}
              </div>
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-foreground animate-fade-in">
                {greeting}, {userName}! <span className="animate-bounce inline-block">{emoji}</span>
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {contextualMessage}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-background/50 animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <Sparkles className="w-3 h-3 mr-1 animate-spin" style={{ animationDuration: '3s' }} />
            AI Ready
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.6s' }}>
            <Clock className="w-4 h-4 animate-pulse" />
            <span>{formattedTime}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '0.8s' }}>
            <Calendar className="w-4 h-4" />
            <span>{currentDateTime.split(',')[0]}</span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground animate-fade-in" style={{ animationDelay: '1s' }}>
            <User className="w-4 h-4" />
            <span>{user?.email || 'Anonymous'}</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 rounded-lg bg-background/30 border border-border/30 backdrop-blur-sm animate-fade-in" style={{ animationDelay: '1.2s' }}>
          <p className="text-xs text-muted-foreground">
            <strong>Today's Focus:</strong> Stay organized, prioritize tasks, and leverage AI insights for maximum productivity.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DynamicGreetingCard;
