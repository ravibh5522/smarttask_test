import { useEffect, useState, useRef } from 'react';

interface TimeBasedAnimationProps {
  className?: string;
}

// Mathematical helper functions
const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor;
const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
const generatePerlinNoise = (x: number, y: number, time: number) => {
  const noise = Math.sin(x * 0.01 + time * 0.0001) * Math.cos(y * 0.01 + time * 0.0002);
  return (noise + 1) / 2; // Normalize to 0-1
};

// Generate sharp, realistic mountains with random peaks
const generateSharpMountains = (width: number, height: number, offset: number, layer: number = 0, seed: number = 0) => {
  // Generate random but consistent peaks based on seed and layer
  const numPeaks = 6 + Math.floor(Math.sin(seed + layer) * 3); // 4-8 peaks randomly
  const peaks = [];
  
  // Always start and end at ground level
  peaks.push({ x: 0, y: height });
  
  for (let i = 1; i < numPeaks - 1; i++) {
    const x = (i / (numPeaks - 1)) * width;
    // Create random peak heights with some variation
    const randomHeight = Math.sin(seed * i + layer * 2) * 0.3 + 0.5; // 0.2 to 0.8
    const baseHeight = height * (0.3 + randomHeight * 0.5); // 30% to 80% height
    
    // Add gentle movement offset
    const movementOffset = Math.sin(offset * 0.01 + i + layer) * height * 0.05;
    const y = baseHeight + movementOffset;
    
    peaks.push({ x, y });
  }
  
  // Always end at ground level
  peaks.push({ x: width, y: height });
  
  // Create sharp mountain paths with linear segments
  let path = `M0,${height}`;
  
  for (let i = 0; i < peaks.length; i++) {
    const peak = peaks[i];
    
    if (i === 0) {
      path += ` L${peak.x},${peak.y}`;
    } else {
      // Create sharp peaks by going directly to peak points
      path += ` L${peak.x},${peak.y}`;
    }
  }
  
  path += ` L${width},${height} Z`;
  return path;
};

// Generate completely random mountain ranges
const generateRandomMountains = (width: number, height: number, time: number, layer: number = 0) => {
  const seed = Math.floor(time / 10000) + layer * 100; // Change mountains every 10 seconds
  const randomSeed = Math.sin(seed) * 10000;
  
  const numPeaks = 5 + Math.floor(Math.abs(Math.sin(randomSeed)) * 4); // 5-8 peaks
  const peaks = [];
  
  // Start at ground
  peaks.push({ x: 0, y: height });
  
  for (let i = 1; i < numPeaks - 1; i++) {
    const x = (i / (numPeaks - 1)) * width;
    const randomFactor = Math.sin(randomSeed * i + layer);
    const peakHeight = height * (0.2 + Math.abs(randomFactor) * 0.6); // 20% to 80%
    
    peaks.push({ x, y: peakHeight });
  }
  
  // End at ground
  peaks.push({ x: width, y: height });
  
  // Create sharp mountain silhouette
  let path = `M0,${height}`;
  
  for (let i = 0; i < peaks.length; i++) {
    path += ` L${peaks[i].x},${peaks[i].y}`;
  }
  
  path += ` Z`;
  return path;
};

// Function to calculate moon phase based on current date
function getMoonPhase(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Simplified lunar cycle calculation (29.53 days)
  const knownNewMoon = new Date(2025, 8, 3); // September 3, 2025 was a new moon
  const diffTime = date.getTime() - knownNewMoon.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const lunarDay = diffDays % 29.53;
  
  if (lunarDay < 1) return 'new';
  if (lunarDay < 7.4) return 'waxing-crescent';
  if (lunarDay < 8.4) return 'first-quarter';
  if (lunarDay < 14.8) return 'waxing-gibbous';
  if (lunarDay < 15.8) return 'full';
  if (lunarDay < 22.1) return 'waning-gibbous';
  if (lunarDay < 23.1) return 'third-quarter';
  if (lunarDay < 29.5) return 'waning-crescent';
  return 'new';
}

export function TimeBasedAnimation({ className = '' }: TimeBasedAnimationProps) {
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day');
  const [moonPhase, setMoonPhase] = useState<string>('full');
  const [shootingStars, setShootingStars] = useState<Array<{id: number, startX: number, startY: number, angle: number, speed: number}>>([]);
  const [mountainOffset, setMountainOffset] = useState(0);
  const [debugMode, setDebugMode] = useState(false);
  const [debugTimeOfDay, setDebugTimeOfDay] = useState<'morning' | 'day' | 'evening' | 'night'>('day');
  
  // Debug controls for individual elements
  const [debugControls, setDebugControls] = useState({
    sun: true,
    sunRays: true,
    butterflies: true,
    dragonflies: true,
    flowers: true,
    birds: true,
    clouds: true,
    mist: true,
    mountains: true,
    moon: true,
    stars: true,
    shootingStars: true,
    fireflies: true,
    eveningOrbs: true,
    dayClouds: true,
    // New morning elements
    bees: true,
    dewDrops: true,
    leaves: true,
    grass: true,
    sunbeams: true,
    rainbow: true,
    windEffects: true,
    morningDew: true
  });
  
  const animationTimeRef = useRef(0);
  
  useEffect(() => {
    const updateTimeOfDay = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 12) {
        setTimeOfDay('morning');
      } else if (hour >= 12 && hour < 17) {
        setTimeOfDay('day');
      } else if (hour >= 17 && hour < 21) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
        setMoonPhase(getMoonPhase(new Date()));
      }
    };

    updateTimeOfDay();
    const interval = setInterval(updateTimeOfDay, 60000);

    return () => clearInterval(interval);
  }, []);

  // Animation loop for continuous movement
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      animationTimeRef.current += 8; // Reduced from 16 to slow down by 50%
      
      // Linear mountain movement - continuously increasing
      setMountainOffset(animationTimeRef.current * 0.1); // Linear movement instead of sine wave
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Generate shooting stars with mathematical trajectories
  useEffect(() => {
    const currentTime = debugMode ? debugTimeOfDay : timeOfDay;
    if (currentTime === 'night') {
      const generateShootingStar = () => {
        const angle = Math.random() * Math.PI / 3 + Math.PI / 6; // 30-60 degrees
        const speed = 2 + Math.random() * 3; // Variable speed
        const startX = Math.random() * 120 + 80; // Start from right side
        const startY = Math.random() * 30 + 10; // Start from top area
        
        const newStar = {
          id: Math.random(),
          startX,
          startY,
          angle,
          speed
        };
        
        setShootingStars(prev => [...prev, newStar]);
        
        setTimeout(() => {
          setShootingStars(prev => prev.filter(star => star.id !== newStar.id));
        }, 3000);
      };

      const starInterval = setInterval(() => {
        if (Math.random() < 0.08) { // Reduced from 15% to 8% chance
          generateShootingStar();
        }
      }, 8000); // Increased from 3s to 8s

      return () => clearInterval(starInterval);
    }
  }, [timeOfDay, debugMode, debugTimeOfDay]);

  const renderMoon = () => {
    if (moonPhase === 'new') return null;
    
    const time = animationTimeRef.current;
    const moonX = 70 + Math.sin(time * 0.00008) * 12; // Much slower horizontal drift
    const moonY = 15 + Math.cos(time * 0.00006) * 6; // Slower vertical float
    const moonSize = 64 + Math.sin(time * 0.00005) * 3; // Slower size pulsing
    
    return (
      <div 
        className="absolute transition-all duration-1000 ease-out"
        style={{ 
          right: `${moonX}px`,
          top: `${moonY}px`,
          width: `${moonSize}px`,
          height: `${moonSize}px`
        }}
      >
        <div className="relative w-full h-full">
          <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-100/40 to-indigo-200/40 dark:from-blue-200/25 dark:to-indigo-300/25 relative overflow-hidden">
            {/* Dynamic moon craters */}
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full bg-blue-200/30 dark:bg-blue-300/20"
                style={{
                  width: `${Math.random() * 8 + 4}px`,
                  height: `${Math.random() * 8 + 4}px`,
                  top: `${Math.random() * 70 + 10}%`,
                  left: `${Math.random() * 70 + 10}%`,
                }}
              />
            ))}
            
            {/* Moon phase shadow with smooth transitions */}
            {moonPhase.includes('crescent') && (
              <div 
                className={`absolute top-0 w-full h-full rounded-full transition-all duration-2000 ${
                  moonPhase.includes('waxing') 
                    ? 'bg-gradient-to-r from-transparent via-black/30 to-black/60 dark:to-black/80' 
                    : 'bg-gradient-to-r from-black/60 dark:from-black/80 via-black/30 to-transparent'
                }`} 
              />
            )}
            {moonPhase.includes('quarter') && (
              <div 
                className={`absolute top-0 w-1/2 h-full transition-all duration-2000 ${
                  moonPhase === 'first-quarter' 
                    ? 'right-0 bg-black/50 dark:bg-black/70 rounded-r-full' 
                    : 'left-0 bg-black/50 dark:bg-black/70 rounded-l-full'
                }`} 
              />
            )}
            {moonPhase.includes('gibbous') && (
              <div 
                className={`absolute top-0 w-1/4 h-full transition-all duration-2000 ${
                  moonPhase.includes('waxing')
                    ? 'right-0 bg-black/30 dark:bg-black/50 rounded-r-full'
                    : 'left-0 bg-black/30 dark:bg-black/50 rounded-l-full'
                }`} 
              />
            )}
          </div>
          
          {/* Dynamic moon glow */}
          <div 
            className="absolute inset-0 rounded-full bg-blue-100/20 dark:bg-blue-200/15 blur-sm"
            style={{
              transform: `scale(${1.1 + Math.sin(time * 0.0003) * 0.05})`, // Slower glow pulse
            }}
          />
        </div>
      </div>
    );
  };

  // Use debug time or real time
  const currentTimeOfDay = debugMode ? debugTimeOfDay : timeOfDay;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none rounded-2xl ${className}`}>
      {/* Debug Toggle Controls */}
      <div className="absolute top-2 right-2 z-50 pointer-events-auto">
        <div className="bg-black/20 dark:bg-white/10 backdrop-blur-sm rounded-lg p-3 space-y-2 w-80 max-w-[90vw] max-h-96 overflow-y-auto">
          <button
            onClick={() => setDebugMode(!debugMode)}
            className={`w-full px-3 py-1 rounded text-xs font-medium transition-colors ${
              debugMode 
                ? 'bg-green-500 text-white' 
                : 'bg-gray-500 text-white hover:bg-gray-600'
            }`}
          >
            {debugMode ? 'Debug ON' : 'Debug OFF'}
          </button>
          
          {debugMode && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600 dark:text-gray-300 font-medium">Test Animations:</div>
              <div className="grid grid-cols-2 gap-1">
                {(['morning', 'day', 'evening', 'night'] as const).map((time) => (
                  <button
                    key={time}
                    onClick={() => setDebugTimeOfDay(time)}
                    className={`px-2 py-1 rounded text-xs capitalize transition-colors ${
                      debugTimeOfDay === time
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-400 text-white hover:bg-gray-500'
                    }`}
                  >
                    {time}
                  </button>
                ))}
              </div>
              
              <div className="text-xs text-gray-600 dark:text-gray-300 font-medium mt-3">Element Controls:</div>
              <div className="grid grid-cols-1 gap-1 max-h-64 overflow-y-auto pr-1">
                {Object.entries(debugControls).map(([key, value]) => (
                  <button
                    key={key}
                    onClick={() => setDebugControls(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
                    className={`px-2 py-1 rounded text-xs transition-colors text-left ${
                      value
                        ? 'bg-green-500 text-white'
                        : 'bg-red-500 text-white'
                    }`}
                  >
                    {key.charAt(0).toUpperCase() + key.slice(1)}: {value ? 'ON' : 'OFF'}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Sky Background */}
      <div className={`absolute inset-0 transition-all duration-2000 ease-in-out ${
        currentTimeOfDay === 'morning' 
          ? 'bg-gradient-to-br from-orange-200/30 via-yellow-100/20 to-blue-200/30 dark:from-orange-900/20 dark:via-amber-800/15 dark:to-blue-900/25'
          : currentTimeOfDay === 'day'
          ? 'bg-gradient-to-br from-blue-200/30 via-sky-100/20 to-cyan-200/30 dark:from-blue-900/20 dark:via-sky-800/15 dark:to-cyan-900/25'
          : currentTimeOfDay === 'evening'
          ? 'bg-gradient-to-br from-purple-200/30 via-pink-100/20 to-orange-200/30 dark:from-purple-900/20 dark:via-pink-800/15 dark:to-orange-900/25'
          : 'bg-gradient-to-br from-indigo-900/40 via-purple-900/30 to-blue-900/40 dark:from-indigo-950/50 dark:via-purple-950/40 dark:to-blue-950/50'
      }`} />

      {/* Animated Mountain Silhouettes (Night only) */}
      {currentTimeOfDay === 'night' && debugControls.mountains && (
        <div className="absolute bottom-0 left-0 right-0 h-40">
          <svg viewBox="0 0 400 160" className="w-full h-full" preserveAspectRatio="none">
            {/* Create seamless scrolling with multiple mountain ranges */}
            {/* Background mountains - most distant, slowest movement */}
            <g>
              <path 
                d={generateRandomMountains(400, 160, Math.floor(mountainOffset / 10000) * 10000, 2)}
                fill="currentColor" 
                className="text-black/15 dark:text-black/25"
                transform={`translate(${-400 + ((mountainOffset * 0.02) % 400)}, 0)`}
              />
              <path 
                d={generateRandomMountains(400, 160, Math.floor(mountainOffset / 10000) * 10000 + 10000, 2)}
                fill="currentColor" 
                className="text-black/15 dark:text-black/25"
                transform={`translate(${((mountainOffset * 0.02) % 400)}, 0)`}
              />
              <path 
                d={generateRandomMountains(400, 160, Math.floor(mountainOffset / 10000) * 10000 + 20000, 2)}
                fill="currentColor" 
                className="text-black/15 dark:text-black/25"
                transform={`translate(${400 + ((mountainOffset * 0.02) % 400)}, 0)`}
              />
            </g>
            
            {/* Middle mountains - medium distance and movement */}
            <g>
              <path 
                d={generateSharpMountains(400, 160, Math.floor(mountainOffset / 8000) * 8000, 1, Math.floor(mountainOffset / 5000) * 5000)}
                fill="currentColor" 
                className="text-black/25 dark:text-black/40"
                transform={`translate(${-400 + ((mountainOffset * 0.05) % 400)}, 0)`}
              />
              <path 
                d={generateSharpMountains(400, 160, Math.floor(mountainOffset / 8000) * 8000 + 8000, 1, Math.floor(mountainOffset / 5000) * 5000 + 5000)}
                fill="currentColor" 
                className="text-black/25 dark:text-black/40"
                transform={`translate(${((mountainOffset * 0.05) % 400)}, 0)`}
              />
              <path 
                d={generateSharpMountains(400, 160, Math.floor(mountainOffset / 8000) * 8000 + 16000, 1, Math.floor(mountainOffset / 5000) * 5000 + 10000)}
                fill="currentColor" 
                className="text-black/25 dark:text-black/40"
                transform={`translate(${400 + ((mountainOffset * 0.05) % 400)}, 0)`}
              />
            </g>
            
            {/* Foreground mountains - closest, most movement */}
            <g>
              <path 
                d={generateSharpMountains(400, 160, Math.floor(mountainOffset / 6000) * 6000, 0, Math.floor(mountainOffset / 3000) * 3000)}
                fill="currentColor" 
                className="text-black/35 dark:text-black/55"
                transform={`translate(${-400 + ((mountainOffset * 0.08) % 400)}, 0)`}
              />
              <path 
                d={generateSharpMountains(400, 160, Math.floor(mountainOffset / 6000) * 6000 + 6000, 0, Math.floor(mountainOffset / 3000) * 3000 + 3000)}
                fill="currentColor" 
                className="text-black/35 dark:text-black/55"
                transform={`translate(${((mountainOffset * 0.08) % 400)}, 0)`}
              />
              <path 
                d={generateSharpMountains(400, 160, Math.floor(mountainOffset / 6000) * 6000 + 12000, 0, Math.floor(mountainOffset / 3000) * 3000 + 6000)}
                fill="currentColor" 
                className="text-black/35 dark:text-black/55"
                transform={`translate(${400 + ((mountainOffset * 0.08) % 400)}, 0)`}
              />
            </g>
          </svg>
        </div>
      )}

      {/* Dynamic Floating Elements */}
      <div className="absolute inset-0">
        {/* Morning: Enhanced Mountain Scene with Wildlife */}
        {(currentTimeOfDay === 'morning' || (debugMode && debugTimeOfDay === 'morning')) && (
          <>
            {/* Mountain Ranges with Parallax */}
            <div className="absolute bottom-0 left-0 right-0 h-48">
              <svg viewBox="0 0 400 192" className="w-full h-full" preserveAspectRatio="none">
                {/* Background mountains */}
                <g>
                  <path 
                    d={generateRandomMountains(400, 192, Math.floor(mountainOffset / 10000) * 10000, 2)}
                    fill="currentColor" 
                    className="text-emerald-200/20 dark:text-emerald-800/30"
                    transform={`translate(${-400 + ((mountainOffset * 0.01) % 400)}, 0)`}
                  />
                  <path 
                    d={generateRandomMountains(400, 192, Math.floor(mountainOffset / 10000) * 10000 + 10000, 2)}
                    fill="currentColor" 
                    className="text-emerald-200/20 dark:text-emerald-800/30"
                    transform={`translate(${((mountainOffset * 0.01) % 400)}, 0)`}
                  />
                </g>
                
                {/* Foreground mountains */}
                <g>
                  <path 
                    d={generateSharpMountains(400, 192, Math.floor(mountainOffset / 6000) * 6000, 0, Math.floor(mountainOffset / 3000) * 3000)}
                    fill="currentColor" 
                    className="text-emerald-300/30 dark:text-emerald-700/40"
                    transform={`translate(${-400 + ((mountainOffset * 0.03) % 400)}, 0)`}
                  />
                  <path 
                    d={generateSharpMountains(400, 192, Math.floor(mountainOffset / 6000) * 6000 + 6000, 0, Math.floor(mountainOffset / 3000) * 3000 + 3000)}
                    fill="currentColor" 
                    className="text-emerald-300/30 dark:text-emerald-700/40"
                    transform={`translate(${((mountainOffset * 0.03) % 400)}, 0)`}
                  />
                </g>
              </svg>
            </div>

            {/* Beautiful Morning Sun */}
            {debugControls.sun && (
              <div 
                className="absolute"
                style={{
                  top: `${10 + Math.sin(animationTimeRef.current * 0.00003) * 4}px`, // Very slow gentle movement
                  right: `${40 + Math.cos(animationTimeRef.current * 0.00002) * 8}px`, // Subtle drift
                  width: '100px',
                  height: '100px'
                }}
              >
                {/* Main sun body with warm morning glow */}
                <div 
                  className="w-full h-full rounded-full bg-gradient-radial from-yellow-200/80 via-orange-300/70 to-orange-400/60 dark:from-yellow-400/70 dark:via-orange-400/60 dark:to-orange-500/50"
                  style={{
                    transform: `rotate(${animationTimeRef.current * 0.001}deg)`, // Very slow rotation
                    boxShadow: `
                      0 0 30px rgba(255, 200, 50, 0.5),
                      0 0 60px rgba(255, 150, 0, 0.3),
                      0 0 90px rgba(255, 100, 0, 0.2)
                    `,
                    background: `radial-gradient(circle at 30% 30%, 
                      rgba(255, 255, 150, 0.9) 0%, 
                      rgba(255, 200, 100, 0.8) 30%, 
                      rgba(255, 150, 50, 0.7) 70%, 
                      rgba(255, 100, 0, 0.6) 100%)`
                  }}
                />
                
                {/* Inner bright core */}
                <div 
                  className="absolute inset-4 rounded-full bg-gradient-radial from-yellow-100/90 to-yellow-300/80 dark:from-yellow-300/80 dark:to-yellow-400/70"
                  style={{
                    boxShadow: `0 0 20px rgba(255, 255, 200, 0.6)`,
                  }}
                />
                
                {/* Tiny inner highlight */}
                <div 
                  className="absolute inset-8 rounded-full bg-white/60 dark:bg-yellow-100/50"
                  style={{
                    transform: `scale(${0.8 + Math.sin(animationTimeRef.current * 0.002) * 0.2})`, // Gentle pulsing
                  }}
                />
                
                {/* Random sun surface details */}
                {[...Array(6)].map((_, i) => (
                  <div
                    key={`sunspot-${i}`}
                    className="absolute bg-orange-400/40 dark:bg-orange-500/50 rounded-full"
                    style={{
                      width: `${2 + (i % 3)}px`,
                      height: `${2 + (i % 3)}px`,
                      top: `${25 + (i * 17.3) % 30}%`,
                      left: `${20 + (i * 23.7) % 40}%`,
                      opacity: 0.4 + Math.sin(animationTimeRef.current * 0.0005 + i) * 0.2, // Very slow opacity change
                    }}
                  />
                ))}
              </div>
            )}

            {/* Enhanced sun rays with slower movement */}
            {debugControls.sunRays && [...Array(24)].map((_, i) => {
              const rayLength = 20 + (i % 5) * 6 + Math.sin(animationTimeRef.current * 0.0001 + i) * 4; // Slower variation
              const rayOpacity = 0.25 + Math.sin(animationTimeRef.current * 0.0003 + i) * 0.2; // Slower opacity
              const rayWidth = i % 3 === 0 ? 'w-0.5' : 'w-px'; // Varied ray thickness
              
              return (
                <div
                  key={i}
                  className={`absolute ${rayWidth} bg-gradient-to-r from-yellow-300/60 via-orange-300/40 to-transparent dark:from-yellow-400/50 dark:via-orange-400/30`}
                  style={{
                    top: `${30 + Math.sin(animationTimeRef.current * 0.00003) * 4}px`,
                    right: `${90 + Math.cos(animationTimeRef.current * 0.00002) * 8}px`,
                    height: `${rayLength}px`,
                    transform: `rotate(${i * 15 + animationTimeRef.current * 0.0008}deg)`, // Much slower rotation
                    transformOrigin: 'bottom center',
                    opacity: rayOpacity,
                  }}
                />
              );
            })}

            {/* Random Morning Clouds - Slower Movement */}
            {debugControls.clouds && [...Array(6)].map((_, i) => {
              const time = animationTimeRef.current * 0.000008; // Much slower movement
              const seed = i * 73.8 + 300;
              const x = (seed % 80) + 10;
              const y = ((i * 47.2) % 20) + 5;
              
              const drift = Math.sin(time * (0.1 + i * 0.02) + i) * 3; // Slower and smaller drift
              const opacity = 0.12 + Math.sin(time * (0.3 + i * 0.05) + i) * 0.08; // Slower opacity change
              const width = 45 + (i % 4) * 20; // Larger clouds
              const height = 15 + (i % 3) * 8;
              
              return (
                <div
                  key={`cloud-${i}`}
                  className="absolute bg-white/25 dark:bg-white/12 rounded-full blur-sm"
                  style={{
                    left: `${Math.max(5, Math.min(90, x + drift))}%`,
                    top: `${y}%`,
                    width: `${width}px`,
                    height: `${height}px`,
                    opacity: opacity,
                    transform: `scale(${0.95 + Math.sin(time * 0.4 + i) * 0.1})`, // Slower scaling
                  }}
                />
              );
            })}

            {/* Flying Butterflies with Random Distribution */}
            {debugControls.butterflies && [...Array(8)].map((_, i) => {
              const time = animationTimeRef.current * 0.0002;
              const seed = i * 137.5; // Golden ratio for better distribution
              const baseX = (seed % 100);
              const baseY = ((i * 73.2) % 40) + 20; // Random Y between 20-60%
              
              const x = baseX + Math.sin(time * (0.6 + i * 0.1) + i * 3) * (15 + i * 2) + Math.cos(time * (0.4 + i * 0.05) + i) * (8 + i);
              const y = baseY + Math.sin(time * (1.0 + i * 0.15) + i * 2.5) * (12 + i) + Math.cos(time * (0.3 + i * 0.08) + i) * (6 + i * 0.5);
              const wingBeat = Math.sin(time * (12 + i * 2) + i) * 0.3 + 0.7;
              const size = 16 + (i % 3) * 4; // Varied sizes: 16, 20, 24
              
              const colors = [
                'text-pink-400/70 dark:text-pink-300/60',
                'text-purple-400/70 dark:text-purple-300/60', 
                'text-orange-400/70 dark:text-orange-300/60',
                'text-red-400/70 dark:text-red-300/60',
                'text-yellow-400/70 dark:text-yellow-300/60'
              ];
              
              return (
                <div
                  key={`butterfly-${i}`}
                  className="absolute transition-all duration-100 ease-out"
                  style={{
                    left: `${Math.max(5, Math.min(95, x))}%`,
                    top: `${Math.max(15, Math.min(70, y))}%`,
                    transform: `scale(${0.7 + wingBeat * 0.5}) rotate(${Math.sin(time + i) * 10}deg)`,
                  }}
                >
                  <svg width={size} height={size * 0.8} viewBox="0 0 20 16" className={colors[i % colors.length]}>
                    <g transform={`scale(${wingBeat})`} style={{ transformOrigin: 'center' }}>
                      <ellipse cx="4" cy="4" rx="3" ry="4" fill="currentColor" opacity="0.8" />
                      <ellipse cx="16" cy="4" rx="3" ry="4" fill="currentColor" opacity="0.8" />
                      <ellipse cx="4" cy="12" rx="2" ry="3" fill="currentColor" opacity="0.7" />
                      <ellipse cx="16" cy="12" rx="2" ry="3" fill="currentColor" opacity="0.7" />
                    </g>
                    <line x1="10" y1="2" x2="10" y2="14" stroke="currentColor" strokeWidth="1" opacity="0.9" />
                  </svg>
                </div>
              );
            })}

            {/* Fast Dragonflies with Random Paths */}
            {debugControls.dragonflies && [...Array(6)].map((_, i) => {
              const time = animationTimeRef.current * 0.0003;
              const seed = i * 97.3 + 50; // Different seed for dragonflies
              const speed = 1.5 + (i % 4) * 0.4; // Varied speeds
              
              // More complex random flight patterns
              const baseX = (seed % 100);
              const baseY = ((i * 89.7) % 30) + 15; // Random Y between 15-45%
              
              const x = (baseX + 
                Math.sin(time * speed + i * 4) * (25 + i * 3) + 
                Math.cos(time * speed * 0.7 + i * 2) * (15 + i * 2) +
                Math.sin(time * speed * 1.3 + i) * (8 + i)) % 100;
              
              const y = baseY + 
                Math.sin(time * speed * 1.5 + i * 3) * (10 + i * 1.5) + 
                Math.cos(time * speed * 0.9 + i * 1.5) * (6 + i);
              
              const wingBeat = Math.sin(time * (20 + i * 3) + i) * 0.2 + 0.8;
              const angle = Math.sin(time * speed + i) * (20 + i * 2);
              const size = 20 + (i % 3) * 6; // Varied sizes
              
              const colors = [
                'text-blue-400/60 dark:text-blue-300/50',
                'text-cyan-400/60 dark:text-cyan-300/50',
                'text-teal-400/60 dark:text-teal-300/50',
                'text-emerald-400/60 dark:text-emerald-300/50'
              ];
              
              return (
                <div
                  key={`dragonfly-${i}`}
                  className="absolute transition-all duration-75 ease-linear"
                  style={{
                    left: `${Math.max(5, Math.min(95, x))}%`,
                    top: `${Math.max(10, Math.min(60, y))}%`,
                    transform: `rotate(${angle}deg) scale(${0.8 + (i % 2) * 0.3})`,
                  }}
                >
                  <svg width={size} height={size * 0.4} viewBox="0 0 24 8" className={colors[i % colors.length]}>
                    <g transform={`scale(${wingBeat}, 1)`} style={{ transformOrigin: 'center' }}>
                      <ellipse cx="6" cy="2" rx="5" ry="1.5" fill="currentColor" opacity="0.7" />
                      <ellipse cx="18" cy="2" rx="5" ry="1.5" fill="currentColor" opacity="0.7" />
                      <ellipse cx="6" cy="6" rx="4" ry="1.2" fill="currentColor" opacity="0.6" />
                      <ellipse cx="18" cy="6" rx="4" ry="1.2" fill="currentColor" opacity="0.6" />
                    </g>
                    <line x1="2" y1="4" x2="22" y2="4" stroke="currentColor" strokeWidth="1.5" opacity="0.8" />
                  </svg>
                </div>
              );
            })}

            {/* Randomly Distributed Swaying Flowers */}
            {debugControls.flowers && [...Array(20)].map((_, i) => {
              const time = animationTimeRef.current * 0.0001;
              const seed = i * 61.8; // Golden ratio distribution
              const x = (seed % 85) + 5; // Random X between 5-90%
              const baseHeight = ((i * 43.7) % 25) + 8; // Random height between 8-33
              
              const sway = Math.sin(time * (1.5 + i * 0.2) + i * 0.8) * (2 + i * 0.3);
              const bounce = Math.sin(time * (3 + i * 0.4) + i) * 0.5;
              
              const flowerTypes = [
                { color: 'text-red-400/70 dark:text-red-300/60', size: 6 + (i % 3) },
                { color: 'text-yellow-400/70 dark:text-yellow-300/60', size: 5 + (i % 4) },
                { color: 'text-pink-400/70 dark:text-pink-300/60', size: 7 + (i % 3) },
                { color: 'text-purple-400/70 dark:text-purple-300/60', size: 8 + (i % 2) },
                { color: 'text-orange-400/70 dark:text-orange-300/60', size: 6 + (i % 4) },
                { color: 'text-blue-400/70 dark:text-blue-300/60', size: 5 + (i % 3) },
                { color: 'text-emerald-400/70 dark:text-emerald-300/60', size: 7 + (i % 2) }
              ];
              const flower = flowerTypes[i % flowerTypes.length];
              const stemHeight = baseHeight + bounce;
              
              return (
                <div
                  key={`flower-${i}`}
                  className="absolute bottom-12"
                  style={{
                    left: `${x}%`,
                    transform: `translateX(${sway}px) rotate(${sway * 0.4}deg)`,
                    transformOrigin: 'bottom center',
                    zIndex: Math.floor(Math.random() * 3) + 1,
                  }}
                >
                  {/* Thin Stem */}
                  <div 
                    className="w-0.5 bg-green-400/60 dark:bg-green-500/50 rounded-full"
                    style={{ 
                      height: `${stemHeight}px`,
                      transform: `rotate(${sway * 0.2}deg)`,
                      background: `linear-gradient(to top, rgb(34 197 94 / 0.6), rgb(34 197 94 / 0.3))`
                    }}
                  />
                  {/* Flower Head at Top */}
                  <div 
                    className={`${flower.color} rounded-full absolute top-0 left-1/2`}
                    style={{
                      width: `${flower.size}px`,
                      height: `${flower.size}px`,
                      background: `radial-gradient(circle, currentColor 40%, transparent 80%)`,
                      transform: `translateX(-50%) scale(${1 + bounce * 0.1}) rotate(${time * 10 + i}deg)`,
                    }}
                  >
                    {/* Flower petals */}
                    {[...Array(5)].map((_, petalIndex) => (
                      <div
                        key={petalIndex}
                        className="absolute w-1 h-1 rounded-full bg-current opacity-80"
                        style={{
                          top: '10%',
                          left: '50%',
                          transform: `rotate(${petalIndex * 72}deg) translateY(-${flower.size * 0.2}px) translateX(-50%)`,
                          transformOrigin: 'bottom center',
                        }}
                      />
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Random Flying Birds */}
            {debugControls.birds && [...Array(5)].map((_, i) => {
              const time = animationTimeRef.current * 0.0001;
              const seed = i * 127.4 + 200;
              const speed = 0.3 + (i % 3) * 0.2;
              
              // Random flight paths
              const baseX = (seed % 100);
              const baseY = ((i * 67.9) % 25) + 10; // Random Y between 10-35%
              
              const x = (baseX + Math.sin(time * speed + i * 2.5) * (40 + i * 5)) % 100;
              const y = baseY + Math.sin(time * speed * 1.3 + i) * (8 + i * 2);
              const wingFlap = Math.sin(time * (15 + i * 3) + i) * 0.4 + 0.6;
              const direction = Math.sin(time * speed + i) > 0 ? 1 : -1;
              
              const birdTypes = [
                { color: 'text-gray-700/60 dark:text-gray-400/50', size: 12 },
                { color: 'text-slate-600/60 dark:text-slate-400/50', size: 16 },
                { color: 'text-stone-600/60 dark:text-stone-400/50', size: 14 },
                { color: 'text-neutral-600/60 dark:text-neutral-400/50', size: 18 }
              ];
              const bird = birdTypes[i % birdTypes.length];
              
              return (
                <div
                  key={`bird-${i}`}
                  className="absolute"
                  style={{
                    left: `${Math.max(5, Math.min(95, x))}%`,
                    top: `${Math.max(5, Math.min(50, y))}%`,
                    transform: `scaleX(${direction}) scale(${0.8 + (i % 2) * 0.4})`,
                  }}
                >
                  <svg width={bird.size} height={bird.size * 0.75} viewBox="0 0 16 12" className={bird.color}>
                    <path 
                      d={`M2,6 Q8,${4 - wingFlap * 2.5} 14,6 Q8,${8 + wingFlap * 2.5} 2,6`}
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.5"
                      opacity="0.8"
                    />
                    <circle cx="3" cy="6" r="0.8" fill="currentColor" opacity="0.9" />
                  </svg>
                </div>
              );
            })}

            {/* Random Morning Mist/Fog */}
            {debugControls.mist && [...Array(12)].map((_, i) => {
              const time = animationTimeRef.current * 0.00005;
              const seed = i * 83.2 + 100;
              const x = (seed % 90) + 5; // Random X between 5-95%
              const baseY = ((i * 51.6) % 30) + 40; // Random Y between 40-70%
              
              const driftX = Math.sin(time * (0.8 + i * 0.1) + i) * (8 + i * 2);
              const driftY = Math.sin(time * (0.6 + i * 0.08) + i * 1.5) * (4 + i);
              const opacity = (0.08 + Math.sin(time * (1.5 + i * 0.2) + i) * 0.06) * (0.5 + (i % 3) * 0.3);
              
              const width = 30 + (i % 5) * 15 + Math.sin(time + i) * 10;
              const height = 10 + (i % 3) * 6 + Math.sin(time * 1.2 + i) * 4;
              
              return (
                <div
                  key={`mist-${i}`}
                  className="absolute bg-white/20 dark:bg-gray-300/10 rounded-full blur-sm"
                  style={{
                    left: `${Math.max(0, Math.min(100, x + driftX))}%`,
                    bottom: `${Math.max(10, Math.min(80, baseY + driftY - 60))}%`,
                    width: `${width}px`,
                    height: `${height}px`,
                    opacity: opacity,
                    transform: `translateY(${Math.sin(time * 0.6 + i) * 6}px) rotate(${Math.sin(time + i) * 5}deg)`,
                  }}
                />
              );
            })}

            {/* Buzzing Bees */}
            {debugControls.bees && [...Array(4)].map((_, i) => {
              const time = animationTimeRef.current * 0.0004;
              const seed = i * 211.7 + 500;
              const speed = 2 + (i % 3) * 0.8;
              
              // Complex zigzag flight patterns
              const baseX = (seed % 80) + 10;
              const baseY = ((i * 91.3) % 25) + 25;
              
              const x = (baseX + 
                Math.sin(time * speed + i * 5) * (20 + i * 4) + 
                Math.cos(time * speed * 1.4 + i * 3) * (12 + i * 2) +
                Math.sin(time * speed * 2.1 + i) * (6 + i)) % 90 + 5;
              
              const y = baseY + 
                Math.sin(time * speed * 1.8 + i * 4) * (8 + i * 2) + 
                Math.cos(time * speed * 1.2 + i * 2) * (5 + i);
              
              const wingBeat = Math.sin(time * (30 + i * 5) + i) * 0.3 + 0.7;
              const buzzing = Math.sin(time * 25 + i) * 2;
              
              return (
                <div
                  key={`bee-${i}`}
                  className="absolute transition-all duration-50 ease-linear"
                  style={{
                    left: `${Math.max(5, Math.min(95, x))}%`,
                    top: `${Math.max(15, Math.min(65, y + buzzing))}%`,
                    transform: `rotate(${Math.sin(time * speed + i) * 25}deg) scale(${0.7 + (i % 2) * 0.2})`,
                  }}
                >
                  <svg width="12" height="8" viewBox="0 0 12 8" className="text-yellow-600/80 dark:text-yellow-500/70">
                    {/* Bee body */}
                    <ellipse cx="6" cy="4" rx="3" ry="1.5" fill="currentColor" opacity="0.9" />
                    <rect x="4" y="3" width="4" height="2" fill="rgba(0,0,0,0.3)" rx="1" />
                    
                    {/* Wings */}
                    <g transform={`scale(${wingBeat})`} style={{ transformOrigin: 'center' }}>
                      <ellipse cx="4" cy="2" rx="2" ry="1" fill="rgba(255,255,255,0.6)" opacity="0.8" />
                      <ellipse cx="8" cy="2" rx="2" ry="1" fill="rgba(255,255,255,0.6)" opacity="0.8" />
                    </g>
                  </svg>
                </div>
              );
            })}

            {/* Sparkling Dew Drops */}
            {debugControls.dewDrops && [...Array(15)].map((_, i) => {
              const time = animationTimeRef.current * 0.0002;
              const seed = i * 163.4;
              const x = (seed % 90) + 5;
              const y = ((i * 127.8) % 30) + 50;
              
              const sparkle = Math.sin(time * (8 + i * 2) + i) * 0.5 + 0.5;
              const sway = Math.sin(time * (1 + i * 0.3) + i) * 2;
              
              return (
                <div
                  key={`dewdrop-${i}`}
                  className="absolute"
                  style={{
                    left: `${x + sway}%`,
                    top: `${y}%`,
                    transform: `scale(${0.5 + sparkle * 0.5})`,
                  }}
                >
                  <div 
                    className="w-2 h-2 bg-blue-200/60 dark:bg-blue-300/50 rounded-full"
                    style={{
                      boxShadow: `0 0 ${4 + sparkle * 6}px rgba(200, 230, 255, ${0.6 + sparkle * 0.4})`,
                      background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.9), rgba(200,230,255,0.6))`
                    }}
                  />
                </div>
              );
            })}

            {/* Floating Leaves */}
            {debugControls.leaves && [...Array(8)].map((_, i) => {
              const time = animationTimeRef.current * 0.00008;
              const seed = i * 199.2 + 300;
              const x = (seed % 100);
              const y = ((i * 157.3) % 70) + 10;
              
              const drift = Math.sin(time * (0.5 + i * 0.1) + i * 2) * (20 + i * 3);
              const fall = Math.sin(time * (0.3 + i * 0.05) + i) * (15 + i * 2);
              const rotation = time * (50 + i * 20) + i * 45;
              
              const leafTypes = [
                { color: 'text-green-400/60 dark:text-green-300/50', width: 8, height: 12 },
                { color: 'text-emerald-400/60 dark:text-emerald-300/50', width: 6, height: 10 },
                { color: 'text-lime-400/60 dark:text-lime-300/50', width: 7, height: 11 },
                { color: 'text-teal-400/60 dark:text-teal-300/50', width: 9, height: 13 }
              ];
              const leaf = leafTypes[i % leafTypes.length];
              
              return (
                <div
                  key={`leaf-${i}`}
                  className="absolute transition-all duration-200 ease-out"
                  style={{
                    left: `${Math.max(0, Math.min(100, x + drift))}%`,
                    top: `${Math.max(0, Math.min(80, y + fall))}%`,
                    transform: `rotate(${rotation}deg) scale(${0.7 + (i % 3) * 0.2})`,
                  }}
                >
                  <svg width={leaf.width} height={leaf.height} viewBox="0 0 8 12" className={leaf.color}>
                    <path d="M4,0 Q7,3 6,8 Q5,11 4,12 Q3,11 2,8 Q1,3 4,0 Z" fill="currentColor" opacity="0.8" />
                    <line x1="4" y1="0" x2="4" y2="12" stroke="currentColor" strokeWidth="0.5" opacity="0.6" />
                  </svg>
                </div>
              );
            })}

            {/* Swaying Grass Blades */}
            {debugControls.grass && [...Array(25)].map((_, i) => {
              const time = animationTimeRef.current * 0.0001;
              const seed = i * 41.3;
              const x = (seed % 95) + 2;
              
              const windSway = Math.sin(time * (2 + i * 0.1) + i * 0.5) * (3 + i * 0.2);
              const height = 15 + (i % 8) * 3;
              
              return (
                <div
                  key={`grass-${i}`}
                  className="absolute bottom-8"
                  style={{
                    left: `${x}%`,
                    transform: `translateX(${windSway}px) rotate(${windSway * 0.8}deg)`,
                    transformOrigin: 'bottom center',
                  }}
                >
                  <div 
                    className="w-0.5 bg-green-500/40 dark:bg-green-400/30 rounded-t-full"
                    style={{ 
                      height: `${height}px`,
                      background: `linear-gradient(to top, rgb(34 197 94 / 0.5), rgb(34 197 94 / 0.2))`
                    }}
                  />
                </div>
              );
            })}

            {/* God Rays/Sunbeams */}
            {debugControls.sunbeams && [...Array(6)].map((_, i) => {
              const time = animationTimeRef.current * 0.00002;
              const angle = -30 + i * 12; // Spread rays from sun
              const opacity = 0.1 + Math.sin(time * (1 + i * 0.2) + i) * 0.05;
              const length = 200 + (i % 3) * 50;
              
              return (
                <div
                  key={`sunbeam-${i}`}
                  className="absolute pointer-events-none"
                  style={{
                    top: '40px',
                    right: '90px',
                    width: '20px',
                    height: `${length}px`,
                    background: `linear-gradient(to bottom, 
                      rgba(255, 255, 150, ${opacity}) 0%, 
                      rgba(255, 200, 100, ${opacity * 0.8}) 30%, 
                      rgba(255, 150, 50, ${opacity * 0.6}) 60%, 
                      transparent 100%)`,
                    transform: `rotate(${angle}deg)`,
                    transformOrigin: 'top center',
                    filter: 'blur(1px)',
                  }}
                />
              );
            })}

            {/* Subtle Rainbow Arc */}
            {debugControls.rainbow && (
              <div 
                className="absolute top-16 left-1/4 w-1/2 h-32 pointer-events-none"
                style={{
                  opacity: 0.3 + Math.sin(animationTimeRef.current * 0.00005) * 0.1,
                  transform: `scale(${0.8 + Math.sin(animationTimeRef.current * 0.00008) * 0.1})`,
                }}
              >
                <svg viewBox="0 0 200 100" className="w-full h-full">
                  <defs>
                    <linearGradient id="rainbow" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="rgba(255,0,0,0.4)" />
                      <stop offset="16.66%" stopColor="rgba(255,165,0,0.4)" />
                      <stop offset="33.33%" stopColor="rgba(255,255,0,0.4)" />
                      <stop offset="50%" stopColor="rgba(0,255,0,0.4)" />
                      <stop offset="66.66%" stopColor="rgba(0,0,255,0.4)" />
                      <stop offset="83.33%" stopColor="rgba(75,0,130,0.4)" />
                      <stop offset="100%" stopColor="rgba(148,0,211,0.4)" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M 20 80 Q 100 20 180 80" 
                    stroke="url(#rainbow)" 
                    strokeWidth="2" 
                    fill="none" 
                    opacity="0.6"
                  />
                </svg>
              </div>
            )}

            {/* Wind Effect Particles */}
            {debugControls.windEffects && [...Array(10)].map((_, i) => {
              const time = animationTimeRef.current * 0.0003;
              const x = (i * 10 + Math.sin(time * (0.5 + i * 0.1) + i) * 80) % 100;
              const y = 20 + (i * 6) % 40 + Math.sin(time * (0.8 + i * 0.15) + i) * 10;
              const scale = 0.3 + Math.sin(time * (2 + i * 0.5) + i) * 0.2;
              
              return (
                <div
                  key={`wind-${i}`}
                  className="absolute w-1 h-4 bg-white/20 dark:bg-white/10 rounded-full blur-sm"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: `rotate(25deg) scale(${scale})`,
                    opacity: 0.4 + Math.sin(time * (3 + i) + i) * 0.3,
                  }}
                />
              );
            })}

            {/* Morning Dew Sparkles */}
            {debugControls.morningDew && [...Array(20)].map((_, i) => {
              const time = animationTimeRef.current * 0.0003;
              const seed = i * 73.9 + 1000;
              const x = (seed % 90) + 5;
              const y = ((i * 83.7) % 40) + 45;
              
              const twinkle = Math.sin(time * (4 + i * 1.5) + i) * 0.5 + 0.5;
              const float = Math.sin(time * (1.2 + i * 0.2) + i) * 1;
              
              return (
                <div
                  key={`morningdew-${i}`}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y + float}%`,
                    opacity: twinkle * 0.8,
                  }}
                >
                  <div 
                    className="w-1 h-1 bg-cyan-200/80 dark:bg-cyan-300/60 rounded-full"
                    style={{
                      boxShadow: `0 0 ${2 + twinkle * 4}px rgba(150, 230, 255, ${twinkle * 0.8})`,
                      transform: `scale(${0.5 + twinkle * 0.8})`,
                    }}
                  />
                </div>
              );
            })}
          </>
        )}

        {/* Day: Dynamic Clouds */}
        {currentTimeOfDay === 'day' && debugControls.dayClouds && (
          <>
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="absolute bg-white/20 dark:bg-white/10 rounded-full"
                style={{
                  width: `${40 + Math.random() * 30}px`,
                  height: `${15 + Math.random() * 10}px`,
                  top: `${10 + Math.random() * 40}%`,
                  right: `${10 + i * 15 + Math.sin(animationTimeRef.current * 0.00005 + i) * 8}%`, // Much slower
                  transform: `translateY(${Math.sin(animationTimeRef.current * 0.00008 + i) * 6}px)`, // Slower float
                  opacity: 0.3 + Math.sin(animationTimeRef.current * 0.0003 + i) * 0.15, // Slower opacity
                }}
              />
            ))}
          </>
        )}

        {/* Evening: Floating Orbs */}
        {currentTimeOfDay === 'evening' && debugControls.eveningOrbs && (
          <>
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full ${
                  i % 3 === 0 ? 'bg-gradient-to-br from-pink-300/30 to-purple-300/30 dark:from-pink-600/20 dark:to-purple-600/20' :
                  i % 3 === 1 ? 'bg-gradient-to-br from-orange-300/40 to-pink-300/40 dark:from-orange-600/25 dark:to-pink-600/25' :
                  'bg-gradient-to-br from-purple-300/50 to-indigo-300/50 dark:from-purple-600/30 dark:to-indigo-600/30'
                }`}
                style={{
                  width: `${12 + Math.random() * 16}px`,
                  height: `${12 + Math.random() * 16}px`,
                  top: `${Math.random() * 60 + 10}%`,
                  right: `${Math.random() * 70 + 10}%`,
                  transform: `translate(${Math.sin(animationTimeRef.current * 0.0001 + i) * 15}px, ${Math.cos(animationTimeRef.current * 0.00008 + i) * 12}px)`, // Slower
                  opacity: 0.4 + Math.sin(animationTimeRef.current * 0.0008 + i) * 0.25, // Slower
                }}
              />
            ))}
          </>
        )}

        {/* Night: Enhanced Celestial Scene */}
        {currentTimeOfDay === 'night' && (
          <>
            {debugControls.moon && renderMoon()}
            
            {/* Dynamic Stars - positioned above mountains */}
            {debugControls.stars && [...Array(20)].map((_, i) => {
              const x = (i * 137.5) % 100; // Golden ratio distribution
              const y = (i * 73.2) % 45; // Keep stars in upper 45% of screen
              return (
                <div
                  key={i}
                  className="absolute bg-blue-100/80 dark:bg-blue-50/60 rounded-full"
                  style={{
                    width: `${2 + Math.random() * 2}px`,
                    height: `${2 + Math.random() * 2}px`,
                    top: `${y}%`,
                    right: `${x}%`,
                    opacity: 0.3 + Math.sin(animationTimeRef.current * 0.0003 + i) * 0.4, // Slower twinkling
                    transform: `scale(${0.8 + Math.sin(animationTimeRef.current * 0.0006 + i) * 0.3})`, // Slower scaling
                  }}
                />
              );
            })}

            {/* Mathematical Shooting Stars */}
            {debugControls.shootingStars && shootingStars.map((star) => {
              const progress = (animationTimeRef.current % 3000) / 3000;
              const x = star.startX - Math.cos(star.angle) * progress * 200 * star.speed;
              const y = star.startY + Math.sin(star.angle) * progress * 100 * star.speed;
              
              return (
                <div
                  key={star.id}
                  className="absolute bg-gradient-to-r from-transparent via-blue-200/80 to-blue-100/60 dark:via-blue-100/60 dark:to-blue-50/40"
                  style={{
                    width: `${20 + star.speed * 5}px`,
                    height: '2px',
                    top: `${y}%`,
                    right: `${x}%`,
                    transform: `rotate(${star.angle}rad)`,
                    opacity: Math.max(0, 1 - progress * 2),
                  }}
                />
              );
            })}

            {/* Algorithmic Fireflies */}
            {debugControls.fireflies && [...Array(12)].map((_, i) => {
              const time = animationTimeRef.current * 0.0003; // Much slower
              const x = 50 + Math.sin(time * 0.3 + i) * 25 + Math.cos(time * 0.2 + i * 2) * 15; // Slower
              const y = 70 + Math.sin(time * 0.4 + i * 1.5) * 12 + Math.cos(time * 0.25 + i) * 8; // Slower
              const brightness = 0.3 + Math.sin(time * 1.5 + i) * 0.4; // Slower brightness change
              
              return (
                <div
                  key={`firefly-${i}`}
                  className="absolute w-2 h-2 bg-yellow-200/60 dark:bg-yellow-100/50 rounded-full"
                  style={{
                    left: `${x}%`,
                    bottom: `${y - 60}%`, // Adjust for bottom positioning
                    opacity: Math.max(0.2, brightness),
                    transform: `scale(${0.8 + brightness * 0.4})`,
                    boxShadow: `0 0 ${4 + brightness * 4}px rgba(255, 255, 0, ${brightness * 0.5})`,
                  }}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
}
