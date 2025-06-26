import type { FC } from 'react';
import { motion } from 'framer-motion';

type AnimationState = 'initial-reveal' | 'reveal' | 'cover';

interface BoxRevealProps {
  children: React.ReactNode;
  boxGradient: string;
  duration?: number;
  delay?: number;
  animationState: AnimationState;
  onAnimationComplete?: () => void;
  className?: string;
}

export const BoxReveal: FC<BoxRevealProps> = ({
  children,
  boxGradient,
  duration = 0.5,
  delay = 0,
  animationState,
  onAnimationComplete,
  className = '',
}) => {
  const getBoxVariants = () => {
    switch (animationState) {
      case 'initial-reveal':
        return {
          initial: { left: 0 },
          animate: { left: '100%' },
        };
      case 'reveal':
        return {
          initial: { left: 0 },
          animate: { left: '100%' },
        };
      case 'cover':
        return {
          initial: { left: '100%' },
          animate: { left: 0 },
        };
      default:
        return {
          initial: { left: 0 },
          animate: { left: '100%' },
        };
    }
  };

  const boxVariants = getBoxVariants();

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ width: 'fit-content' }}>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="relative"
      >
        {children}
      </motion.div>

      <motion.div
        variants={boxVariants}
        initial="initial"
        animate="animate"
        transition={{ 
          duration, 
          delay, 
          ease: 'easeInOut' 
        }}
        onAnimationComplete={onAnimationComplete}
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          width: '100%',
          zIndex: 20,
          background: boxGradient,
        }}
      />
    </div>
  );
};