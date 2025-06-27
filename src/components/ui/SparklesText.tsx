import type { FC, ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Sparkle {
  id: string;
  x: number;
  y: number;
  size: number;
  delay: number;
}

interface SparklesTextProps {
  children: ReactNode;
  className?: string;
  sparkleCount?: number;
  sparkleSize?: number;
  sparkleColor?: string;
  enabled?: boolean;
}

export const SparklesText: FC<SparklesTextProps> = ({
  children,
  className = '',
  sparkleCount = 8,
  sparkleSize = 4,
  sparkleColor = '#fbbf24',
  enabled = false,
}) => {
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    if (!enabled) {
      setSparkles([]);
      return;
    }

    const generateSparkles = (): Sparkle[] => {
      return Array.from({ length: sparkleCount }, (_, i) => ({
        id: `sparkle-${i}-${Date.now()}`,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: sparkleSize + Math.random() * 4,
        delay: Math.random() * 2,
      }));
    };

    setSparkles(generateSparkles());

    const interval = setInterval(() => {
      setSparkles(generateSparkles());
    }, 1500);

    return () => clearInterval(interval);
  }, [enabled, sparkleCount, sparkleSize]);

  return (
    <span className={`relative inline-block ${className}`}>
      {children}
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <motion.div
            key={sparkle.id}
            className="absolute pointer-events-none"
            style={{
              left: `${sparkle.x}%`,
              top: `${sparkle.y}%`,
              width: sparkle.size,
              height: sparkle.size,
            }}
            initial={{ opacity: 0, scale: 0, rotate: 0 }}
            animate={{ 
              opacity: [0, 1, 0], 
              scale: [0, 1, 0],
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
              width={sparkle.size}
              height={sparkle.size}
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 0L14.59 8.41L23 11L14.59 13.59L12 22L9.41 13.59L1 11L9.41 8.41L12 0Z"
                fill={sparkleColor}
              />
            </svg>
          </motion.div>
        ))}
      </AnimatePresence>
    </span>
  );
};