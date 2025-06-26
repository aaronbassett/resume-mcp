import { cn } from "../../lib/utils";
import { motion, MotionStyle, Transition } from "framer-motion";
import { useState, useEffect } from "react";

interface BorderBottomBeamProps {
  /**
   * The size of the border beam.
   */
  size?: number;
  /**
   * The duration of the border beam.
   */
  duration?: number;
  /**
   * The delay of the border beam.
   */
  delay?: number;
  /**
   * The color of the border beam from.
   */
  colorFrom?: string;
  /**
   * The color of the border beam to.
   */
  colorTo?: string;
  /**
   * The motion transition of the border beam.
   */
  transition?: Transition;
  /**
   * The class name of the border beam.
   */
  className?: string;
  /**
   * The style of the border beam.
   */
  style?: React.CSSProperties;
  /**
   * Whether to reverse the animation direction.
   */
  reverse?: boolean;
  /**
   * The initial offset position (0-100).
   */
  initialOffset?: number;
  /**
   * Number of times to loop (-1 for infinite, 0 for once, n for n times).
   */
  loop?: number;
  /**
   * Animation loop type: 'pacman' (same direction) or 'pong' (alternating).
   */
  loopType?: 'pacman' | 'pong';
  /**
   * Whether the beam should be visible and animating.
   */
  play?: boolean;
  /**
   * Children to render inside the beam container.
   */
  children?: React.ReactNode;
}

export const BorderBottomBeam = ({
  className,
  size = 50,
  delay = 0,
  duration = 2,
  colorFrom = "#6366f1",
  colorTo = "#ec4899",
  transition,
  style,
  reverse = false,
  initialOffset = 0,
  loop = -1,
  loopType = 'pacman',
  play = true,
  children,
}: BorderBottomBeamProps) => {
  const [animationKey, setAnimationKey] = useState(0);
  const [currentDirection, setCurrentDirection] = useState(reverse);
  const [loopCount, setLoopCount] = useState(0);

  useEffect(() => {
    if (!play || loop === 0) return; // No reset needed if not playing or single play

    const handleAnimationComplete = () => {
      if (loop === -1 || loopCount < loop - 1) {
        setLoopCount(prev => prev + 1);
        
        if (loopType === 'pong') {
          setCurrentDirection(prev => !prev);
        } else {
          // pacman mode - reset animation
          setAnimationKey(prev => prev + 1);
        }
      }
    };

    // Calculate when animation completes
    const timer = setTimeout(handleAnimationComplete, (duration + delay) * 1000);
    
    return () => clearTimeout(timer);
  }, [animationKey, currentDirection, loopCount, loop, loopType, duration, delay, play]);

  const shouldRepeat = loop === -1 || (loop > 0 && loopCount < loop - 1);

  return (
    <div className={cn("relative", className)}>
      {children}
      {play && (
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden">
          <motion.div
            key={loopType === 'pacman' ? animationKey : undefined}
            className="absolute bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--color-from)] to-[var(--color-to)]"
            style={
              {
                width: `${size}%`,
                "--color-from": colorFrom,
                "--color-to": colorTo,
                ...style,
              } as MotionStyle
            }
            initial={{ 
              left: currentDirection ? `${100 - initialOffset}%` : `${-size + initialOffset}%` 
            }}
            animate={{
              left: currentDirection ? `${-size - initialOffset}%` : `${100 + initialOffset}%`,
            }}
            transition={{
              repeat: loopType === 'pong' && shouldRepeat ? Infinity : 0,
              repeatType: loopType === 'pong' ? 'reverse' : 'loop',
              ease: "linear",
              duration,
              delay: loopType === 'pacman' ? delay : (loopCount === 0 ? delay : 0),
              ...transition,
            }}
          />
        </div>
      )}
    </div>
  );
};