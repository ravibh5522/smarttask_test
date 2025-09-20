import { useEffect, useState, useRef } from 'react';

interface DayAnimationProps {
  mountainOffset: number;
  className?: string;
}

// Generate seamless scrolling mountains for day
const generateDayMountains = (width: number, height: number, offset: number, layer: number = 0, seed: number = 0) => {
  const numPeaks = 7 + Math.floor(Math.sin(seed + layer) * 2);
  const peaks = [];
  
  peaks.push({ x: 0, y: height });
  
  for (let i = 1; i < numPeaks - 1; i++) {
    const x = (i / (numPeaks - 1)) * width;
    const randomHeight = Math.sin(seed * i + layer * 2) * 0.4 + 0.6;
    const baseHeight = height * (0.3 + randomHeight * 0.5); // Varied day mountains
    
    peaks.push({ x, y: baseHeight });
  }
  
  peaks.push({ x: width, y: height });
  
  let path = `M0,${height}`;
  for (let i = 0; i < peaks.length; i++) {
    path += ` L${peaks[i].x},${peaks[i].y}`;
  }
  path += ` Z`;
  return path;
};

export function DayAnimation({ mountainOffset, className = '' }: DayAnimationProps) {
  const [clouds, setClouds] = useState<Array<{id: number, x: number, y: number, size: number, speed: number, opacity: number}>>([]);
  const [butterflies, setButterflies] = useState<Array<{id: number, x: number, y: number, speed: number, direction: number}>>([]);
  const animationTimeRef = useRef(0);

  // Initialize clouds and butterflies
  useEffect(() => {
    // Generate fluffy day clouds
    const initialClouds = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 120,
      y: 5 + Math.random() * 30,
      size: 50 + Math.random() * 40,
      speed: 0.03 + Math.random() * 0.04,
      opacity: 0.6 + Math.random() * 0.3
    }));
    setClouds(initialClouds);

    // Generate butterflies
    const initialButterflies = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 40 + Math.random() * 40,
      speed: 0.2 + Math.random() * 0.1,
      direction: Math.random() * Math.PI * 2
    }));
    setButterflies(initialButterflies);
  }, []);

  // Animate elements
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      animationTimeRef.current += 1;
      
      // Move clouds slowly
      setClouds(prev => prev.map(cloud => ({
        ...cloud,
        x: (cloud.x + cloud.speed) % 120
      })));

      // Animate butterflies with random flight patterns
      setButterflies(prev => prev.map(butterfly => {
        const newDirection = butterfly.direction + (Math.random() - 0.5) * 0.1;
        const newX = butterfly.x + Math.cos(newDirection) * butterfly.speed;
        const newY = butterfly.y + Math.sin(newDirection) * butterfly.speed * 0.5;
        
        return {
          ...butterfly,
          x: ((newX % 100) + 100) % 100, // Keep in bounds
          y: Math.max(30, Math.min(80, newY)), // Keep in middle area
          direction: newDirection
        };
      }));
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Create scrolling mountain offset for seamless effect
  const scrollOffset1 = -(mountainOffset * 0.02) % 400;
  const scrollOffset2 = -(mountainOffset * 0.05) % 400;
  const scrollOffset3 = -(mountainOffset * 0.08) % 400;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Day Mountains */}
      <div className="absolute bottom-0 left-0 right-0 h-40">
        <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
          {/* Background mountains */}
          <g transform={`translate(${scrollOffset1}, 0)`}>
            <path 
              d={generateDayMountains(400, 160, Math.floor(mountainOffset / 10000) * 10000, 2)}
              fill="currentColor" 
              className="text-green-300/25 dark:text-green-700/35"
            />
            <path 
              d={generateDayMountains(400, 160, Math.floor(mountainOffset / 10000) * 10000, 2)}
              fill="currentColor" 
              className="text-green-300/25 dark:text-green-700/35"
              transform="translate(400, 0)"
            />
          </g>
          
          {/* Middle mountains */}
          <g transform={`translate(${scrollOffset2}, 0)`}>
            <path 
              d={generateDayMountains(400, 160, Math.floor(mountainOffset / 8000) * 8000, 1)}
              fill="currentColor" 
              className="text-emerald-400/30 dark:text-emerald-600/45"
            />
            <path 
              d={generateDayMountains(400, 160, Math.floor(mountainOffset / 8000) * 8000, 1)}
              fill="currentColor" 
              className="text-emerald-400/30 dark:text-emerald-600/45"
              transform="translate(400, 0)"
            />
          </g>
          
          {/* Foreground mountains */}
          <g transform={`translate(${scrollOffset3}, 0)`}>
            <path 
              d={generateDayMountains(400, 160, Math.floor(mountainOffset / 6000) * 6000, 0)}
              fill="currentColor" 
              className="text-teal-500/35 dark:text-teal-700/55"
            />
            <path 
              d={generateDayMountains(400, 160, Math.floor(mountainOffset / 6000) * 6000, 0)}
              fill="currentColor" 
              className="text-teal-500/35 dark:text-teal-700/55"
              transform="translate(400, 0)"
            />
          </g>
        </svg>
      </div>

      {/* Bright Sun */}
      <div className="absolute top-12 right-20">
        <div 
          className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-200 to-yellow-400 dark:from-yellow-300 dark:to-yellow-500 relative"
          style={{
            transform: `scale(${1 + Math.sin(animationTimeRef.current * 0.008) * 0.05})`,
            boxShadow: '0 0 60px rgba(251, 191, 36, 0.6), 0 0 120px rgba(251, 191, 36, 0.3)'
          }}
        >
          {/* Bright sun rays */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 bg-gradient-to-t from-yellow-300 to-transparent"
              style={{
                height: `${25 + Math.sin(animationTimeRef.current * 0.015 + i) * 8}px`,
                left: '50%',
                top: '50%',
                transformOrigin: 'bottom center',
                transform: `translate(-50%, -100%) rotate(${i * 30}deg)`
              }}
            />
          ))}
        </div>
      </div>

      {/* Fluffy Day Clouds */}
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className="absolute"
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.7}px`,
            opacity: cloud.opacity
          }}
        >
          <div className="w-full h-full bg-white/80 dark:bg-gray-200/60 rounded-full relative">
            <div className="absolute top-1/5 left-1/5 w-4/5 h-3/5 bg-white/70 dark:bg-gray-100/50 rounded-full" />
            <div className="absolute top-1/4 right-1/5 w-3/5 h-4/5 bg-white/70 dark:bg-gray-100/50 rounded-full" />
            <div className="absolute top-0 left-1/3 w-2/5 h-3/5 bg-white/60 dark:bg-gray-100/40 rounded-full" />
          </div>
        </div>
      ))}

      {/* Butterflies */}
      {butterflies.map((butterfly) => (
        <div
          key={butterfly.id}
          className="absolute text-pink-400 dark:text-pink-300"
          style={{
            left: `${butterfly.x}%`,
            top: `${butterfly.y}%`,
            transform: `rotate(${butterfly.direction}rad) scale(${1 + Math.sin(animationTimeRef.current * 0.05 + butterfly.id) * 0.2})`
          }}
        >
          <svg width="12" height="8" viewBox="0 0 12 8" fill="currentColor">
            <ellipse cx="3" cy="2" rx="2.5" ry="1.5" opacity="0.8" />
            <ellipse cx="9" cy="2" rx="2.5" ry="1.5" opacity="0.8" />
            <ellipse cx="3" cy="6" rx="2" ry="1" opacity="0.6" />
            <ellipse cx="9" cy="6" rx="2" ry="1" opacity="0.6" />
            <line x1="6" y1="0" x2="6" y2="8" stroke="currentColor" strokeWidth="0.5" />
          </svg>
        </div>
      ))}

      {/* Floating Pollen/Sparkles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => {
          const time = animationTimeRef.current * 0.001;
          const x = (i * 19.3) % 100;
          const y = (i * 13.7) % 100;
          const offsetX = Math.sin(time * 0.7 + i) * 10;
          const offsetY = Math.cos(time * 0.5 + i) * 8;
          
          return (
            <div
              key={i}
              className="absolute w-1.5 h-1.5 bg-yellow-400/50 dark:bg-yellow-300/40 rounded-full"
              style={{
                left: `${x + offsetX}%`,
                top: `${y + offsetY}%`,
                transform: `scale(${0.6 + Math.sin(time * 3 + i) * 0.4})`,
                boxShadow: '0 0 4px rgba(251, 191, 36, 0.3)'
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
