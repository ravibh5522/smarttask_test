import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface GreetingData {
  greeting: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  userName: string;
  emoji: string;
}

export const useTimeBasedGreeting = (): GreetingData => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute for better performance
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getTimeOfDay = useCallback((date: Date): 'morning' | 'afternoon' | 'evening' | 'night' => {
    const hour = date.getHours();
    
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }, []);

  const getGreetingMessage = useCallback((timeOfDay: string): { greeting: string; emoji: string } => {
    switch (timeOfDay) {
      case 'morning':
        return {
          greeting: 'Good morning',
          emoji: '🌅'
        };
      case 'afternoon':
        return {
          greeting: 'Good afternoon',
          emoji: '☀️'
        };
      case 'evening':
        return {
          greeting: 'Good evening',
          emoji: '🌆'
        };
      case 'night':
        return {
          greeting: 'Good night',
          emoji: '🌙'
        };
      default:
        return {
          greeting: 'Hello',
          emoji: '👋'
        };
    }
  }, []);

  const getUserDisplayName = useCallback((): string => {
    if (!user) return 'there';
    
    // Try to get the full name from user metadata
    const fullName = user.user_metadata?.full_name || user.user_metadata?.fullName;
    if (fullName) {
      // Return first name only
      return fullName.split(' ')[0];
    }
    
    // Fallback to email username
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      // Capitalize first letter
      return emailUsername.charAt(0).toUpperCase() + emailUsername.slice(1);
    }
    
    return 'there';
  }, [user]);

  // Memoize expensive computations
  const greetingData = useMemo(() => {
    const timeOfDay = getTimeOfDay(currentTime);
    const { greeting, emoji } = getGreetingMessage(timeOfDay);
    const userName = getUserDisplayName();

    return {
      greeting,
      timeOfDay,
      userName,
      emoji
    };
  }, [currentTime, getTimeOfDay, getGreetingMessage, getUserDisplayName]);

  return greetingData;
};

// Additional hook for extended greetings with context
export const useContextualGreeting = () => {
  const greetingData = useTimeBasedGreeting();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Update time every minute for better performance
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const getContextualMessage = useCallback((): string => {
    const hour = currentTime.getHours();
    const dayOfWeek = currentTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (greetingData.timeOfDay === 'morning') {
      if (isWeekend) {
        return "Hope you're having a relaxing weekend! ☕";
      }
      if (hour < 9) {
        return "You're starting early today! Ready to be productive? ⚡";
      }
      return "Ready to tackle your goals today? 🎯";
    }

    if (greetingData.timeOfDay === 'afternoon') {
      if (hour < 14) {
        return "Hope your morning was productive! Let's keep the momentum going. 🚀";
      }
      return "Making great progress today! Keep up the excellent work. 💪";
    }

    if (greetingData.timeOfDay === 'evening') {
      return "Wrapping up for the day? Let's see what you accomplished! ✨";
    }

    if (greetingData.timeOfDay === 'night') {
      if (hour > 22) {
        return "Working late? Don't forget to take care of yourself! 🌟";
      }
      return "Planning for tomorrow? Great habit for success! 📋";
    }

    return "AI-powered insights and automation are ready to boost your productivity.";
  }, [currentTime, greetingData.timeOfDay]);

  const getCurrentDateTime = useCallback((): string => {
    return currentTime.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, [currentTime]);

  const getFormattedTime = useCallback((): string => {
    return currentTime.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }, [currentTime]);

  // Memoize the final result for better performance
  const contextualData = useMemo(() => ({
    ...greetingData,
    contextualMessage: getContextualMessage(),
    currentDateTime: getCurrentDateTime(),
    formattedTime: getFormattedTime()
  }), [greetingData, getContextualMessage, getCurrentDateTime, getFormattedTime]);

  return contextualData;
};
