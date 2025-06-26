import type { FC } from 'react';
import { motion } from 'framer-motion';
import { useMemo } from 'react';

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
  // Extract text content and split into words
  const words = useMemo(() => {
    const extractText = (node: React.ReactNode): string => {
      if (typeof node === 'string') return node;
      if (typeof node === 'number') return node.toString();
      if (React.isValidElement(node)) {
        if (node.props.children) {
          return extractText(node.props.children);
        }
      }
      if (Array.isArray(node)) {
        return node.map(extractText).join('');
      }
      return '';
    };

    const text = extractText(children);
    return text.split(/(\s+)/).filter(word => word.trim().length > 0);
  }, [children]);

  const getBoxVariants = (wordIndex: number) => {
    const staggerDelay = wordIndex * 0.1; // Stagger each word by 100ms
    
    switch (animationState) {
      case 'initial-reveal':
      case 'reveal':
        return {
          initial: { 
            x: '0%',
            opacity: 1
          },
          animate: { 
            x: '100%',
            opacity: 1
          },
          transition: {
            duration,
            delay: delay + staggerDelay,
            ease: 'easeInOut'
          }
        };
      case 'cover':
        return {
          initial: { 
            x: '-100%',
            opacity: 1
          },
          animate: { 
            x: '0%',
            opacity: 1
          },
          transition: {
            duration,
            delay: delay + staggerDelay,
            ease: 'easeInOut'
          }
        };
      default:
        return {
          initial: { x: '0%' },
          animate: { x: '100%' },
          transition: { duration, delay: delay + staggerDelay }
        };
    }
  };

  // Handle animation completion - only call once when the last word finishes
  const handleWordAnimationComplete = (wordIndex: number) => {
    if (wordIndex === words.length - 1 && onAnimationComplete) {
      onAnimationComplete();
    }
  };

  return (
    <div className={`relative ${className}`} style={{ width: 'fit-content' }}>
      {/* Render the actual content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Render individual word boxes */}
      <div className="absolute inset-0 z-20 flex flex-wrap">
        {words.map((word, index) => {
          const variants = getBoxVariants(index);
          
          return (
            <div
              key={`${word}-${index}`}
              className="relative overflow-hidden"
              style={{ 
                width: 'fit-content',
                marginRight: index < words.length - 1 ? '0.25em' : '0'
              }}
            >
              {/* Invisible text to maintain proper spacing */}
              <span className="invisible whitespace-pre">{word}</span>
              
              {/* Sliding box */}
              <motion.div
                initial={variants.initial}
                animate={variants.animate}
                transition={variants.transition}
                onAnimationComplete={() => handleWordAnimationComplete(index)}
                className="absolute inset-0"
                style={{
                  background: boxGradient,
                  transformOrigin: 'left center'
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};