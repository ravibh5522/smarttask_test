import React from 'react';

interface EnhancedTimeBasedAnimationProps {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  className?: string;
}

export const EnhancedTimeBasedAnimation: React.FC<EnhancedTimeBasedAnimationProps> = ({ 
  timeOfDay, 
  className = "" 
}) => {
  const getAnimationContent = () => {
    switch (timeOfDay) {
      case 'morning':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Sunrise gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200/30 via-yellow-200/20 to-blue-100/10 animate-pulse" />
            
            {/* Floating particles */}
            <div className="absolute inset-0">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-yellow-300/40 rounded-full animate-bounce"
                  style={{
                    left: `${15 + i * 10}%`,
                    top: `${20 + Math.sin(i) * 15}%`,
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: '3s'
                  }}
                />
              ))}
            </div>

            {/* Sun rays */}
            <div className="absolute top-4 right-6">
              <div className="relative">
                <div className="w-8 h-8 bg-yellow-400/30 rounded-full animate-spin" style={{ animationDuration: '8s' }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-300/40 to-orange-300/40 rounded-full" />
                </div>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-0.5 h-4 bg-yellow-300/50 origin-bottom"
                    style={{
                      transform: `rotate(${i * 60}deg) translateY(-12px)`,
                      transformOrigin: 'bottom center'
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'afternoon':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Bright day gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-white/10 to-yellow-100/15 animate-pulse" style={{ animationDuration: '4s' }} />
            
            {/* Floating clouds */}
            <div className="absolute inset-0">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${20 + i * 20}%`,
                    top: `${10 + i * 8}%`,
                    animationDelay: `${i * 0.5}s`,
                    animationDuration: `${3 + i}s`
                  }}
                >
                  <div className="w-6 h-3 bg-white/20 rounded-full" />
                  <div className="w-4 h-2 bg-white/15 rounded-full ml-2 -mt-1" />
                </div>
              ))}
            </div>

            {/* Bright sun */}
            <div className="absolute top-2 right-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-200/40 to-orange-200/30 rounded-full animate-pulse" />
            </div>
          </div>
        );

      case 'evening':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Sunset gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300/30 via-red-200/20 to-purple-200/15 animate-pulse" style={{ animationDuration: '5s' }} />
            
            {/* Twinkling stars starting to appear */}
            <div className="absolute inset-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-yellow-200/60 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 90 + 5}%`,
                    top: `${Math.random() * 60 + 10}%`,
                    animationDelay: `${Math.random() * 3}s`,
                    animationDuration: `${2 + Math.random() * 2}s`
                  }}
                />
              ))}
            </div>

            {/* Setting sun */}
            <div className="absolute top-6 right-8">
              <div className="relative">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-400/40 to-red-400/30 rounded-full" />
                <div className="absolute inset-0 bg-gradient-to-t from-orange-500/20 to-transparent rounded-full animate-pulse" />
              </div>
            </div>

            {/* Evening glow effect */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-orange-200/20 to-transparent" />
          </div>
        );

      case 'night':
        return (
          <div className={`absolute inset-0 overflow-hidden ${className}`}>
            {/* Night gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-purple-900/15 to-indigo-900/10 animate-pulse" style={{ animationDuration: '6s' }} />
            
            {/* Stars */}
            <div className="absolute inset-0">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute w-1 h-1 bg-white/80 rounded-full animate-pulse"
                  style={{
                    left: `${Math.random() * 95 + 2}%`,
                    top: `${Math.random() * 70 + 5}%`,
                    animationDelay: `${Math.random() * 4}s`,
                    animationDuration: `${1.5 + Math.random() * 2.5}s`
                  }}
                />
              ))}
            </div>

            {/* Moon */}
            <div className="absolute top-4 right-6">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100/40 to-blue-100/30 rounded-full" />
                <div className="absolute top-1 left-2 w-2 h-2 bg-gray-200/30 rounded-full" />
                <div className="absolute top-3 left-1 w-1 h-1 bg-gray-300/40 rounded-full" />
                <div className="absolute top-5 left-3 w-1.5 h-1.5 bg-gray-200/30 rounded-full" />
              </div>
            </div>

            {/* Shooting star occasionally */}
            <div className="absolute top-8 left-10">
              <div 
                className="w-16 h-0.5 bg-gradient-to-r from-transparent via-white/60 to-transparent transform rotate-45 animate-pulse"
                style={{ animationDuration: '8s' }}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {getAnimationContent()}
    </>
  );
};

export default EnhancedTimeBasedAnimation;