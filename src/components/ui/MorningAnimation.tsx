import { useEffect, useState, useRef, useCallback } from 'react';

interface MorningAnimationProps {
  mountainOffset: number;
  className?: string;
}

interface Butterfly {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  wingPhase: number;
  color: string;
  size: number;
  path: { x: number; y: number }[];
  currentPathIndex: number;
}

interface Dragonfly {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  wingBeat: number;
  color: string;
  size: number;
  target: { x: number; y: number };
}

interface Flower {
  id: number;
  x: number;
  y: number;
  type: 'tulip' | 'daisy' | 'rose' | 'lily';
  color: string;
  size: number;
  swayPhase: number;
  bloomPhase: number;
}

interface Cloud {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  layers: Array<{ x: number; y: number; size: number }>;
}

interface Bird {
  id: number;
  x: number;
  y: number;
  speed: number;
  wingPhase: number;
  flightPattern: 'straight' | 'wave' | 'circle';
}

// Enhanced mountain generation with more realistic peaks and valleys
const generateEnhancedMountains = (
  width: number, 
  height: number, 
  offset: number, 
  layer: number = 0, 
  seed: number = 0,
  complexity: number = 1
) => {
  const numPeaks = Math.floor(8 + Math.sin(seed + layer) * 4 * complexity);
  const peaks = [];
  
  peaks.push({ x: -50, y: height });
  
  for (let i = 1; i < numPeaks - 1; i++) {
    const x = (i / (numPeaks - 1)) * (width + 100) - 50;
    const randomHeight = Math.sin(seed * i + layer * 2.5) * 0.4 + 0.6;
    const noiseHeight = Math.sin(seed * i * 3 + layer * 1.7) * 0.1;
    const baseHeight = height * (0.3 + (randomHeight + noiseHeight) * 0.5);
    
    // Add sub-peaks for more detail
    const subPeakOffset = Math.sin(seed * i * 5) * 20;
    peaks.push({ x: x + subPeakOffset, y: baseHeight });
  }
  
  peaks.push({ x: width + 50, y: height });
  
  // Create smooth bezier curves between peaks
  let path = `M${peaks[0].x},${peaks[0].y}`;
  
  for (let i = 1; i < peaks.length - 1; i++) {
    const current = peaks[i];
    const next = peaks[i + 1];
    const prev = peaks[i - 1];
    
    // Control points for smooth curves
    const cp1x = prev.x + (current.x - prev.x) * 0.6;
    const cp1y = prev.y + (current.y - prev.y) * 0.3;
    const cp2x = current.x - (next.x - current.x) * 0.4;
    const cp2y = current.y - (next.y - current.y) * 0.2;
    
    path += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${current.x},${current.y}`;
  }
  
  path += ` L${peaks[peaks.length - 1].x},${peaks[peaks.length - 1].y} Z`;
  return path;
};

// Generate complex flight paths for butterflies
const generateButterflyPath = (startX: number, startY: number): { x: number; y: number }[] => {
  const path = [];
  const segments = 20;
  
  for (let i = 0; i < segments; i++) {
    const t = i / segments;
    const x = startX + Math.sin(t * Math.PI * 4) * 30 + t * 60;
    const y = startY + Math.cos(t * Math.PI * 3) * 20 + Math.sin(t * Math.PI * 2) * 15;
    path.push({ x, y });
  }
  
  return path;
};

export function MorningAnimation({ mountainOffset, className = '' }: MorningAnimationProps) {
  const [butterflies, setButterflies] = useState<Butterfly[]>([]);
  const [dragonflies, setDragonflies] = useState<Dragonfly[]>([]);
  const [flowers, setFlowers] = useState<Flower[]>([]);
  const [birds, setBirds] = useState<Bird[]>([]);
  const [clouds, setClouds] = useState<Cloud[]>([]);
  const animationTimeRef = useRef(0);
  const [isDark, setIsDark] = useState(false);

  // Detect theme changes
  useEffect(() => {
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    
    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    
    return () => observer.disconnect();
  }, []);

  // Initialize complex animations
  const initializeAnimations = useCallback(() => {
    // Generate butterflies with complex flight patterns
    const butterflyColors = ['#ff6b9d', '#ff8e8e', '#ffd93d', '#6bcf7f', '#4ecdc4', '#a8e6cf'];
    const initialButterflies: Butterfly[] = Array.from({ length: 6 }, (_, i) => {
      const startX = Math.random() * 100;
      const startY = 40 + Math.random() * 40;
      return {
        id: i,
        x: startX,
        y: startY,
        angle: 0,
        speed: 0.3 + Math.random() * 0.4,
        wingPhase: Math.random() * Math.PI * 2,
        color: butterflyColors[i % butterflyColors.length],
        size: 0.8 + Math.random() * 0.6,
        path: generateButterflyPath(startX, startY),
        currentPathIndex: 0,
      };
    });
    setButterflies(initialButterflies);

    // Generate dragonflies with hunting behavior
    const dragonflyColors = ['#4a90e2', '#7b68ee', '#20b2aa', '#32cd32', '#ffd700'];
    const initialDragonflies: Dragonfly[] = Array.from({ length: 4 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 20 + Math.random() * 50,
      angle: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.8,
      wingBeat: 0,
      color: dragonflyColors[i % dragonflyColors.length],
      size: 0.6 + Math.random() * 0.4,
      target: { x: Math.random() * 100, y: 20 + Math.random() * 50 },
    }));
    setDragonflies(initialDragonflies);

    // Generate diverse flowers
    const flowerTypes: Array<'tulip' | 'daisy' | 'rose' | 'lily'> = ['tulip', 'daisy', 'rose', 'lily'];
    const flowerColors = ['#ff69b4', '#ffb6c1', '#ff1493', '#db7093', '#c71585', '#ffd700', '#ffa500', '#ff6347'];
    const initialFlowers: Flower[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: (i * 7.5) % 100,
      y: 75 + Math.random() * 15,
      type: flowerTypes[i % flowerTypes.length],
      color: flowerColors[i % flowerColors.length],
      size: 0.7 + Math.random() * 0.6,
      swayPhase: Math.random() * Math.PI * 2,
      bloomPhase: Math.random() * Math.PI * 2,
    }));
    setFlowers(initialFlowers);

    // Generate enhanced birds
    const initialBirds: Bird[] = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 120,
      y: 15 + Math.random() * 30,
      speed: 0.08 + Math.random() * 0.12,
      wingPhase: Math.random() * Math.PI * 2,
      flightPattern: ['straight', 'wave', 'circle'][i % 3] as 'straight' | 'wave' | 'circle',
    }));
    setBirds(initialBirds);

    // Generate complex clouds with multiple layers
    const initialClouds: Cloud[] = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: Math.random() * 120,
      y: 8 + Math.random() * 25,
      size: 60 + Math.random() * 80,
      speed: 0.02 + Math.random() * 0.04,
      opacity: 0.4 + Math.random() * 0.4,
      layers: Array.from({ length: 3 }, (_, j) => ({
        x: Math.random() * 40,
        y: Math.random() * 20,
        size: 40 + Math.random() * 30,
      })),
    }));
    setClouds(initialClouds);
  }, []);

  useEffect(() => {
    initializeAnimations();
  }, [initializeAnimations]);

  // Complex animation loop
  useEffect(() => {
    let animationId: number;
    
    const animate = () => {
      animationTimeRef.current += 1;
      const time = animationTimeRef.current * 0.01;
      
      // Animate butterflies with complex flight patterns
      setButterflies(prev => prev.map(butterfly => {
        let newPathIndex = butterfly.currentPathIndex;
        let newX = butterfly.x;
        let newY = butterfly.y;
        
        if (butterfly.path.length > 0) {
          newPathIndex = Math.floor(time * butterfly.speed * 2) % butterfly.path.length;
          const target = butterfly.path[newPathIndex];
          newX = target.x + Math.sin(time * 3 + butterfly.id) * 5;
          newY = target.y + Math.cos(time * 2 + butterfly.id) * 3;
          
          // Reset path when completed
          if (newPathIndex === 0 && butterfly.currentPathIndex !== 0) {
            const newPath = generateButterflyPath(newX, newY);
            return { ...butterfly, path: newPath, currentPathIndex: newPathIndex, x: newX, y: newY };
          }
        }
        
        return {
          ...butterfly,
          x: newX,
          y: newY,
          currentPathIndex: newPathIndex,
          wingPhase: butterfly.wingPhase + 0.3,
        };
      }));

      // Animate dragonflies with hunting behavior
      setDragonflies(prev => prev.map(dragonfly => {
        const dx = dragonfly.target.x - dragonfly.x;
        const dy = dragonfly.target.y - dragonfly.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        let newTarget = dragonfly.target;
        if (distance < 5) {
          // Choose new target
          newTarget = {
            x: Math.random() * 100,
            y: 20 + Math.random() * 50,
          };
        }
        
        const moveX = (dx / distance) * dragonfly.speed * 0.5;
        const moveY = (dy / distance) * dragonfly.speed * 0.5;
        
        return {
          ...dragonfly,
          x: dragonfly.x + moveX + Math.sin(time * 4 + dragonfly.id) * 0.8,
          y: dragonfly.y + moveY + Math.cos(time * 3 + dragonfly.id) * 0.6,
          angle: Math.atan2(dy, dx),
          wingBeat: dragonfly.wingBeat + 0.8,
          target: newTarget,
        };
      }));

      // Animate flowers swaying in the breeze
      setFlowers(prev => prev.map(flower => ({
        ...flower,
        swayPhase: flower.swayPhase + 0.02,
        bloomPhase: flower.bloomPhase + 0.01,
      })));

      // Animate birds with different flight patterns
      setBirds(prev => prev.map(bird => {
        let newX = bird.x;
        let newY = bird.y;
        
        switch (bird.flightPattern) {
          case 'straight':
            newX = (bird.x + bird.speed) % 120;
            newY = bird.y + Math.sin(time * 0.5 + bird.id) * 0.3;
            break;
          case 'wave':
            newX = (bird.x + bird.speed) % 120;
            newY = bird.y + Math.sin(time * 1.2 + bird.id) * 2;
            break;
          case 'circle':
            const centerX = 50;
            const centerY = 30;
            const radius = 20;
            newX = centerX + Math.cos(time * bird.speed + bird.id) * radius;
            newY = centerY + Math.sin(time * bird.speed + bird.id) * radius * 0.5;
            break;
        }
        
        return {
          ...bird,
          x: newX,
          y: newY,
          wingPhase: bird.wingPhase + 0.4,
        };
      }));

      // Animate clouds with layered movement
      setClouds(prev => prev.map(cloud => ({
        ...cloud,
        x: (cloud.x + cloud.speed) % 130,
        layers: cloud.layers.map((layer, i) => ({
          ...layer,
          x: (layer.x + cloud.speed * (1 + i * 0.3)) % 60,
        })),
      })));
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  // Enhanced mountain scrolling with more layers
  const scrollOffset1 = -(mountainOffset * 0.015) % 500;
  const scrollOffset2 = -(mountainOffset * 0.035) % 500;
  const scrollOffset3 = -(mountainOffset * 0.055) % 500;
  const scrollOffset4 = -(mountainOffset * 0.075) % 500;

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {/* Enhanced Mountain Layers */}
      <div className="absolute bottom-0 left-0 right-0 h-48">
        <svg viewBox="0 0 500 200" className="w-full h-full" preserveAspectRatio="none">
          {/* Distant mountains */}
          <g transform={`translate(${scrollOffset1}, 0)`}>
            <path 
              d={generateEnhancedMountains(500, 200, Math.floor(mountainOffset / 15000) * 15000, 3, 42, 0.8)}
              fill="currentColor" 
              className={`${isDark ? 'text-purple-900/20' : 'text-purple-300/25'} transition-colors duration-500`}
            />
            <path 
              d={generateEnhancedMountains(500, 200, Math.floor(mountainOffset / 15000) * 15000, 3, 42, 0.8)}
              fill="currentColor" 
              className={`${isDark ? 'text-purple-900/20' : 'text-purple-300/25'} transition-colors duration-500`}
              transform="translate(500, 0)"
            />
          </g>
          
          {/* Far mountains */}
          <g transform={`translate(${scrollOffset2}, 0)`}>
            <path 
              d={generateEnhancedMountains(500, 200, Math.floor(mountainOffset / 12000) * 12000, 2, 27, 1.0)}
              fill="currentColor" 
              className={`${isDark ? 'text-indigo-800/30' : 'text-orange-300/30'} transition-colors duration-500`}
            />
            <path 
              d={generateEnhancedMountains(500, 200, Math.floor(mountainOffset / 12000) * 12000, 2, 27, 1.0)}
              fill="currentColor" 
              className={`${isDark ? 'text-indigo-800/30' : 'text-orange-300/30'} transition-colors duration-500`}
              transform="translate(500, 0)"
            />
          </g>
          
          {/* Middle mountains */}
          <g transform={`translate(${scrollOffset3}, 0)`}>
            <path 
              d={generateEnhancedMountains(500, 200, Math.floor(mountainOffset / 9000) * 9000, 1, 15, 1.2)}
              fill="currentColor" 
              className={`${isDark ? 'text-blue-700/40' : 'text-amber-400/35'} transition-colors duration-500`}
            />
            <path 
              d={generateEnhancedMountains(500, 200, Math.floor(mountainOffset / 9000) * 9000, 1, 15, 1.2)}
              fill="currentColor" 
              className={`${isDark ? 'text-blue-700/40' : 'text-amber-400/35'} transition-colors duration-500`}
              transform="translate(500, 0)"
            />
          </g>
          
          {/* Foreground mountains */}
          <g transform={`translate(${scrollOffset4}, 0)`}>
            <path 
              d={generateEnhancedMountains(500, 200, Math.floor(mountainOffset / 6000) * 6000, 0, 8, 1.5)}
              fill="currentColor" 
              className={`${isDark ? 'text-teal-600/50' : 'text-yellow-500/40'} transition-colors duration-500`}
            />
            <path 
              d={generateEnhancedMountains(500, 200, Math.floor(mountainOffset / 6000) * 6000, 0, 8, 1.5)}
              fill="currentColor" 
              className={`${isDark ? 'text-teal-600/50' : 'text-yellow-500/40'} transition-colors duration-500`}
              transform="translate(500, 0)"
            />
          </g>
        </svg>
      </div>
      {/* Enhanced Animated Sun with Dynamic Effects */}
      <div className="absolute top-12 right-12">
        <div 
          className={`w-20 h-20 rounded-full relative transition-all duration-500 ${
            isDark ? 'bg-gradient-to-br from-blue-200 to-indigo-300' : 'bg-gradient-to-br from-yellow-300 to-orange-400'
          }`}
          style={{
            transform: `scale(${1 + Math.sin(animationTimeRef.current * 0.008) * 0.15})`,
            boxShadow: isDark 
              ? '0 0 60px rgba(147, 197, 253, 0.3), 0 0 120px rgba(147, 197, 253, 0.15)'
              : '0 0 60px rgba(251, 191, 36, 0.4), 0 0 120px rgba(251, 191, 36, 0.2)'
          }}
        >
          {/* Enhanced Sun rays */}
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-1 transition-colors duration-500 ${
                isDark ? 'bg-gradient-to-t from-blue-300 to-transparent' : 'bg-gradient-to-t from-yellow-400 to-transparent'
              }`}
              style={{
                height: `${25 + Math.sin(animationTimeRef.current * 0.03 + i) * 8}px`,
                left: '50%',
                top: '50%',
                transformOrigin: 'bottom center',
                transform: `translate(-50%, -100%) rotate(${i * 30 + animationTimeRef.current * 0.1}deg)`,
                opacity: 0.6 + Math.sin(animationTimeRef.current * 0.02 + i) * 0.3,
              }}
            />
          ))}
          
          {/* Pulsing inner glow */}
          <div 
            className={`absolute inset-2 rounded-full transition-colors duration-500 ${
              isDark ? 'bg-gradient-to-br from-blue-100 to-indigo-200' : 'bg-gradient-to-br from-yellow-200 to-orange-300'
            }`}
            style={{
              transform: `scale(${0.8 + Math.sin(animationTimeRef.current * 0.012) * 0.2})`,
            }}
          />
        </div>
      </div>

      {/* Enhanced Multi-layered Clouds */}
      {clouds.map((cloud) => (
        <div
          key={cloud.id}
          className={`absolute transition-opacity duration-500 ${
            isDark ? 'opacity-30' : 'opacity-60'
          }`}
          style={{
            left: `${cloud.x}%`,
            top: `${cloud.y}%`,
            width: `${cloud.size}px`,
            height: `${cloud.size * 0.6}px`,
          }}
        >
          {cloud.layers.map((layer, i) => (
            <div
              key={i}
              className={`absolute rounded-full transition-colors duration-500 ${
                isDark ? 'bg-gray-600/40' : 'bg-white/70'
              }`}
              style={{
                left: `${layer.x}%`,
                top: `${layer.y}%`,
                width: `${layer.size}px`,
                height: `${layer.size * 0.7}px`,
                transform: `scale(${0.9 + Math.sin(animationTimeRef.current * 0.005 + i) * 0.1})`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Enhanced Flying Birds with Formations */}
      {birds.map((bird) => (
        <div
          key={bird.id}
          className={`absolute transition-colors duration-500 ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}
          style={{
            left: `${bird.x}%`,
            top: `${bird.y}%`,
            fontSize: '14px',
            transform: `rotate(${Math.sin(bird.wingPhase) * 8}deg)`,
          }}
        >
          <svg width="20" height="10" viewBox="0 0 20 10" fill="currentColor">
            <path 
              d={`M2 5 Q5 ${3 + Math.sin(bird.wingPhase) * 2} 8 5 Q11 ${7 - Math.sin(bird.wingPhase) * 2} 14 5 Q17 ${3 + Math.sin(bird.wingPhase) * 2} 18 5`} 
              stroke="currentColor" 
              strokeWidth="1.5" 
              fill="none" 
            />
          </svg>
        </div>
      ))}

      {/* Beautiful Moving Flowers */}
      {flowers.map((flower) => {
        const swayOffset = Math.sin(flower.swayPhase) * 3;
        const bloomScale = 0.8 + Math.sin(flower.bloomPhase) * 0.2;
        
        return (
          <div
            key={flower.id}
            className="absolute transition-transform duration-100"
            style={{
              left: `${flower.x}%`,
              bottom: `${25 - flower.y + 75}%`,
              transform: `translateX(${swayOffset}px) scale(${flower.size * bloomScale})`,
            }}
          >
            {/* Flower stem */}
            <div 
              className={`w-1 transition-colors duration-500 ${
                isDark ? 'bg-green-600' : 'bg-green-500'
              }`}
              style={{
                height: '30px',
                marginLeft: '50%',
                transform: `rotate(${swayOffset * 0.5}deg)`,
                transformOrigin: 'bottom center',
              }}
            />
            
            {/* Flower bloom based on type */}
            <div className="relative" style={{ transform: `translateY(-5px)` }}>
              {flower.type === 'tulip' && (
                <div 
                  className="w-6 h-8 rounded-t-full transition-colors duration-500"
                  style={{ 
                    backgroundColor: flower.color,
                    transform: `rotate(${swayOffset * 0.8}deg)`,
                  }}
                />
              )}
              
              {flower.type === 'daisy' && (
                <div className="relative w-6 h-6">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-4 rounded-full transition-colors duration-500"
                      style={{
                        backgroundColor: flower.color,
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'bottom center',
                        transform: `translate(-50%, -100%) rotate(${i * 45}deg)`,
                      }}
                    />
                  ))}
                  <div className={`absolute w-2 h-2 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-colors duration-500 ${
                    isDark ? 'bg-yellow-300' : 'bg-yellow-400'
                  }`} />
                </div>
              )}
              
              {flower.type === 'rose' && (
                <div className="relative w-5 h-5">
                  {[...Array(5)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-3 h-3 rounded-full opacity-80 transition-colors duration-500"
                      style={{
                        backgroundColor: flower.color,
                        left: '50%',
                        top: '50%',
                        transform: `translate(-50%, -50%) scale(${1 - i * 0.15}) rotate(${i * 20}deg)`,
                      }}
                    />
                  ))}
                </div>
              )}
              
              {flower.type === 'lily' && (
                <div className="relative w-6 h-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-5 rounded-full transition-colors duration-500"
                      style={{
                        backgroundColor: flower.color,
                        left: '50%',
                        top: '50%',
                        transformOrigin: 'bottom center',
                        transform: `translate(-50%, -100%) rotate(${i * 60}deg)`,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Magical Butterflies */}
      {butterflies.map((butterfly) => (
        <div
          key={butterfly.id}
          className="absolute"
          style={{
            left: `${butterfly.x}%`,
            top: `${butterfly.y}%`,
            transform: `scale(${butterfly.size}) rotate(${butterfly.angle}rad)`,
          }}
        >
          <svg width="24" height="16" viewBox="0 0 24 16" className="transition-transform duration-100">
            {/* Butterfly body */}
            <ellipse cx="12" cy="8" rx="0.5" ry="6" fill="#2d1810" />
            
            {/* Butterfly wings */}
            <g style={{ transform: `scaleY(${0.8 + Math.sin(butterfly.wingPhase) * 0.3})` }}>
              {/* Upper wings */}
              <ellipse 
                cx="8" cy="5" rx="4" ry="3" 
                fill={butterfly.color} 
                opacity="0.8"
                style={{ transform: `rotate(${Math.sin(butterfly.wingPhase) * 15}deg)` }}
              />
              <ellipse 
                cx="16" cy="5" rx="4" ry="3" 
                fill={butterfly.color} 
                opacity="0.8"
                style={{ transform: `rotate(${-Math.sin(butterfly.wingPhase) * 15}deg)` }}
              />
              
              {/* Lower wings */}
              <ellipse 
                cx="9" cy="11" rx="2.5" ry="2" 
                fill={butterfly.color} 
                opacity="0.6"
                style={{ transform: `rotate(${Math.sin(butterfly.wingPhase + Math.PI) * 10}deg)` }}
              />
              <ellipse 
                cx="15" cy="11" rx="2.5" ry="2" 
                fill={butterfly.color} 
                opacity="0.6"
                style={{ transform: `rotate(${-Math.sin(butterfly.wingPhase + Math.PI) * 10}deg)` }}
              />
              
              {/* Wing patterns */}
              <circle cx="8" cy="5" r="1" fill="white" opacity="0.6" />
              <circle cx="16" cy="5" r="1" fill="white" opacity="0.6" />
            </g>
            
            {/* Antennae */}
            <line x1="11" y1="2" x2="10" y2="1" stroke="#2d1810" strokeWidth="0.5" />
            <line x1="13" y1="2" x2="14" y2="1" stroke="#2d1810" strokeWidth="0.5" />
          </svg>
        </div>
      ))}

      {/* Graceful Dragonflies */}
      {dragonflies.map((dragonfly) => (
        <div
          key={dragonfly.id}
          className="absolute"
          style={{
            left: `${dragonfly.x}%`,
            top: `${dragonfly.y}%`,
            transform: `scale(${dragonfly.size}) rotate(${dragonfly.angle}rad)`,
          }}
        >
          <svg width="28" height="8" viewBox="0 0 28 8" className="transition-transform duration-50">
            {/* Dragonfly body */}
            <ellipse cx="14" cy="4" rx="0.8" ry="3" fill="#1a5c3a" />
            
            {/* Dragonfly wings */}
            <g style={{ transform: `scaleX(${0.9 + Math.sin(dragonfly.wingBeat) * 0.2})` }}>
              {/* Upper wings */}
              <ellipse 
                cx="8" cy="3" rx="6" ry="1.5" 
                fill={dragonfly.color} 
                opacity="0.4"
                style={{ transform: `rotate(${Math.sin(dragonfly.wingBeat) * 5}deg)` }}
              />
              <ellipse 
                cx="20" cy="3" rx="6" ry="1.5" 
                fill={dragonfly.color} 
                opacity="0.4"
                style={{ transform: `rotate(${-Math.sin(dragonfly.wingBeat) * 5}deg)` }}
              />
              
              {/* Lower wings */}
              <ellipse 
                cx="10" cy="5" rx="5" ry="1.2" 
                fill={dragonfly.color} 
                opacity="0.3"
                style={{ transform: `rotate(${-Math.sin(dragonfly.wingBeat) * 3}deg)` }}
              />
              <ellipse 
                cx="18" cy="5" rx="5" ry="1.2" 
                fill={dragonfly.color} 
                opacity="0.3"
                style={{ transform: `rotate(${Math.sin(dragonfly.wingBeat) * 3}deg)` }}
              />
            </g>
            
            {/* Head */}
            <circle cx="14" cy="1.5" r="1" fill="#2d5a3d" />
          </svg>
        </div>
      ))}

      {/* Enhanced Morning Light Particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => {
          const time = animationTimeRef.current * 0.001;
          const x = (i * 23.7) % 100;
          const y = (i * 17.3) % 100;
          const offsetX = Math.sin(time * 0.8 + i) * 12;
          const offsetY = Math.cos(time * 0.6 + i) * 8;
          const scale = 0.3 + Math.sin(time * 3 + i) * 0.4;
          
          return (
            <div
              key={i}
              className={`absolute rounded-full transition-colors duration-500 ${
                isDark ? 'bg-blue-300/20' : 'bg-yellow-300/40'
              }`}
              style={{
                left: `${x + offsetX}%`,
                top: `${y + offsetY}%`,
                width: `${2 + scale}px`,
                height: `${2 + scale}px`,
                transform: `scale(${scale})`,
                boxShadow: isDark 
                  ? '0 0 10px rgba(147, 197, 253, 0.3)' 
                  : '0 0 10px rgba(251, 191, 36, 0.3)',
              }}
            />
          );
        })}
      </div>

      {/* Floating Flower Petals */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => {
          const time = animationTimeRef.current * 0.001;
          const x = (time * 2 + i * 12.5) % 110;
          const y = 60 + Math.sin(time * 0.7 + i) * 20;
          const rotation = time * 20 + i * 45;
          
          return (
            <div
              key={i}
              className="absolute transition-colors duration-500"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <div 
                className={`w-2 h-4 rounded-full transition-colors duration-500 ${
                  isDark ? 'bg-pink-400/30' : 'bg-pink-300/60'
                }`}
                style={{
                  opacity: 0.3 + Math.sin(time * 2 + i) * 0.3,
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Gentle Breeze Effect Lines */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => {
          const time = animationTimeRef.current * 0.001;
          const x = (time * 15 + i * 18) % 120;
          const y = 70 + Math.sin(time * 0.5 + i) * 15;
          
          return (
            <div
              key={i}
              className={`absolute h-px transition-colors duration-500 ${
                isDark ? 'bg-gradient-to-r from-transparent via-blue-200/20 to-transparent' : 'bg-gradient-to-r from-transparent via-yellow-200/30 to-transparent'
              }`}
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${30 + Math.sin(time * 1.5 + i) * 10}px`,
                opacity: 0.4 + Math.sin(time * 2 + i) * 0.3,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
