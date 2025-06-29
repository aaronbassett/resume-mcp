import type { FC, ButtonHTMLAttributes } from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

// Define variant colors for light and dark modes
const variantStyles = {
  neutral: {
    light: 'from-gray-500 to-gray-700',
    dark: 'from-gray-400 to-gray-600',
    colors: ['#6b7280', '#4b5563', '#374151', '#1f2937', '#111827']
  },
  primary: {
    light: 'from-blue-500 to-purple-600',
    dark: 'from-blue-400 to-purple-500',
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc']
  },
  secondary: {
    light: 'from-pink-500 to-rose-600',
    dark: 'from-pink-400 to-rose-500',
    colors: ['#ec4899', '#f43f5e', '#ef4444', '#dc2626', '#b91c1c']
  },
  accent: {
    light: 'from-cyan-500 to-teal-600',
    dark: 'from-cyan-400 to-teal-500',
    colors: ['#06b6d4', '#0891b2', '#0e7490', '#155e75', '#164e63']
  },
  warning: {
    light: 'from-yellow-500 to-orange-600',
    dark: 'from-yellow-400 to-orange-500',
    colors: ['#eab308', '#f59e0b', '#f97316', '#ea580c', '#dc2626']
  },
  danger: {
    light: 'from-red-500 to-red-700',
    dark: 'from-red-400 to-red-600',
    colors: ['#ef4444', '#dc2626', '#b91c1c', '#991b1b', '#7f1d1d']
  },
  success: {
    light: 'from-green-500 to-emerald-600',
    dark: 'from-green-400 to-emerald-500',
    colors: ['#10b981', '#059669', '#047857', '#065f46', '#064e3b']
  }
};

type Variant = keyof typeof variantStyles;

interface Sparkle {
  id: string;
  x: string;
  y: string;
  color: string;
  delay: number;
  scale: number;
}

interface HypeButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: React.ReactNode;
}

export const HypeButton: FC<HypeButtonProps> = ({
  variant = 'neutral',
  children,
  className = '',
  disabled = false,
  onMouseDown,
  onMouseUp,
  onMouseLeave,
  ...props
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [easterEggActive, setEasterEggActive] = useState(false);
  const [easterEggScale, setEasterEggScale] = useState(1);
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pressTimeoutRef = useRef<NodeJS.Timeout>();
  const easterEggIntervalRef = useRef<NodeJS.Timeout>();
  const sparkleIntervalRef = useRef<NodeJS.Timeout>();

  const variantConfig = variantStyles[variant];
  const isDark = document.documentElement.classList.contains('dark');
  const gradientClass = isDark ? variantConfig.dark : variantConfig.light;

  // Generate sparkles for hover effect
  const generateSparkles = useCallback(() => {
    if (!isHovered || disabled) return;

    const newSparkles: Sparkle[] = Array.from({ length: 6 }, (_, i) => ({
      id: `sparkle-${Date.now()}-${i}`,
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      color: "#FFFFC5",
      delay: Math.random() * 0.5,
      scale: Math.random() * 0.5 + 1
    }));

    setSparkles(newSparkles);
  }, [isHovered, disabled, variantConfig.colors]);

  // Handle sparkle generation
  useEffect(() => {
    if (isHovered && !disabled) {
      generateSparkles();
      sparkleIntervalRef.current = setInterval(generateSparkles, 800);
    } else {
      setSparkles([]);
      if (sparkleIntervalRef.current) {
        clearInterval(sparkleIntervalRef.current);
      }
    }

    return () => {
      if (sparkleIntervalRef.current) {
        clearInterval(sparkleIntervalRef.current);
      }
    };
  }, [isHovered, disabled, generateSparkles]);

  // Easter egg confetti burst
  const triggerConfettiBurst = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    // Create custom shapes
    const star = confetti.shapeFromPath({
      path: 'M5 0 L6.18 3.82 L10 5 L6.18 6.18 L5 10 L3.82 6.18 L0 5 L3.82 3.82 Z'
    });
    const triangle = confetti.shapeFromPath({
      path: 'M0 10 L5 0 L10 10 Z'
    });
    const square = confetti.shapeFromPath({
      path: 'M0 0 L10 0 L10 10 L0 10 Z'
    });

    const colors = ['#FFE400', '#FFBD00', '#E89400', '#FFCA6C', '#FDFFB8'];

    // Multiple bursts for more impact
    const burst = () => {
      confetti({
        particleCount: 15,
        spread: 100,
        ticks: 10,
        gravity: 0.6,
        decay: 0.94,
        startVelocity: 15,
        shapes: [star, 'circle'],
        colors,
        origin: { x, y },
        scalar: 0.5
      });

      confetti({
        particleCount: 7,
        spread: 100,
        ticks: 10,
        gravity: 0.6,
        decay: 0.94,
        startVelocity: 10,
        shapes: [triangle, square],
        colors,
        origin: { x, y },
        scalar: 0.3
      });
    };

    burst();
    setTimeout(burst, 100);
    setTimeout(burst, 200);
  }, []);

  // Easter egg logic
  const startEasterEgg = useCallback(() => {
    setEasterEggActive(true);
    
    // Start growing animation
    let scale = 1;
    const growthRate = 0.02;
    
    easterEggIntervalRef.current = setInterval(() => {
      scale += growthRate;
      setEasterEggScale(scale);
      
      // After 3 seconds of growth, trigger confetti and shrink
      if (scale >= 1.6) {
        triggerConfettiBurst();
        
        // Rapid shrink back to original size
        const shrinkInterval = setInterval(() => {
          scale -= 0.1;
          setEasterEggScale(Math.max(scale, 1));
          
          if (scale <= 1) {
            clearInterval(shrinkInterval);
            setEasterEggScale(1);
            
            // Start the cycle again if still pressed
            if (easterEggActive) {
              scale = 1;
            }
          }
        }, 50);
      }
    }, 50);
  }, [easterEggActive, triggerConfettiBurst]);

  const stopEasterEgg = useCallback(() => {
    setEasterEggActive(false);
    setEasterEggScale(1);
    if (easterEggIntervalRef.current) {
      clearInterval(easterEggIntervalRef.current);
    }
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    setIsPressed(true);
    
    // Start 5-second timer for easter egg
    pressTimeoutRef.current = setTimeout(() => {
      startEasterEgg();
    }, 5000);
    
    onMouseDown?.(e);
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsPressed(false);
    
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    
    stopEasterEgg();
    onMouseUp?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    setIsHovered(false);
    setIsPressed(false);
    
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    
    stopEasterEgg();
    onMouseLeave?.(e);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
      if (easterEggIntervalRef.current) {
        clearInterval(easterEggIntervalRef.current);
      }
      if (sparkleIntervalRef.current) {
        clearInterval(sparkleIntervalRef.current);
      }
    };
  }, []);

  return (
    <motion.button
      ref={buttonRef}
      className={`
        relative inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-white
        transition-all duration-200 overflow-hidden
        ${disabled 
          ? 'opacity-50 cursor-not-allowed bg-gray-400' 
          : `bg-gradient-to-r ${gradientClass} hover:shadow-lg active:scale-95`
        }
        ${className}
      `}
      style={{
        transform: `scale(${easterEggScale})`,
        background: disabled 
          ? '#9ca3af' 
          : undefined
      }}
      onMouseEnter={() => !disabled && setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onFocus={() => !disabled && setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      disabled={disabled}
      animate={{
        scale: isPressed ? 0.95 : easterEggScale,
      }}
      transition={{ duration: 0.1 }}
      {...props}
    >
      {/* Rainbow effect overlay */}
      {!disabled && (
        <div 
          className={`
            absolute inset-0 opacity-0 transition-opacity duration-300 rounded-lg
            ${isHovered ? 'opacity-20' : ''}
            focus-within:opacity-30
          `}
          style={{
            background: `linear-gradient(45deg, ${variantConfig.colors.join(', ')})`,
            backgroundSize: '400% 400%',
            animation: isHovered ? 'rainbow 2s linear infinite' : undefined
          }}
        />
      )}

      {/* Pulse effect for clicks */}
      <AnimatePresence>
        {isPressed && !disabled && (
          <motion.div
            className="absolute inset-0 rounded-lg"
            style={{
              background: `radial-gradient(circle, ${variantConfig.colors[0]}40 0%, transparent 70%)`
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* Sparkles */}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              left: sparkle.x,
              top: sparkle.y,
              transform: 'translate(-50%, -50%)',
              zIndex: 99
            }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, sparkle.scale, 0],
              rotate: [0, 180, 360]
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              duration: 1.5,
              delay: sparkle.delay,
              ease: "easeInOut",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"
                fill={sparkle.color}
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};