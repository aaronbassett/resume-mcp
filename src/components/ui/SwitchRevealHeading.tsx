import type { FC } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSLinearGradient } from '../../utils/gradientGenerator';
import type { LinearGradientOptions } from '../../utils/gradientGenerator';

interface SwitchRevealHeadingProps {
  headingText: string;
  auroraTexts: string[];
  pauseDuration?: number;
  fadeDuration?: number;
  auroraHueSkew?: number | number[];
  auroraStops?: number;
  auroraMode?: 'light' | 'dark';
  className?: string;
  auroraTextClassName?: string;
  auroraGradientOptions?: Omit<LinearGradientOptions, 'hueSkew' | 'stops' | 'mode'>;
}

export const SwitchRevealHeading: FC<SwitchRevealHeadingProps> = ({
  headingText,
  auroraTexts,
  pauseDuration = 6000,
  fadeDuration = 0.6,
  auroraHueSkew = [240, 270, 300, 30, 60],
  auroraStops = 4,
  auroraMode = 'dark',
  className = '',
  auroraTextClassName = '',
  auroraGradientOptions = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [gradientStyle, setGradientStyle] = useState<React.CSSProperties>({});
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate gradient for current text
  const generateGradient = useCallback((text: string) => {
    const gradient = getCSSLinearGradient(text, {
      hueSkew: auroraHueSkew,
      stops: auroraStops,
      mode: auroraMode,
      angle: '45deg',
      ...auroraGradientOptions,
    });

    setGradientStyle({
      background: gradient,
      backgroundSize: '400% 400%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    });
  }, [auroraHueSkew, auroraStops, auroraMode, auroraGradientOptions]);

  // Initialize with first text
  useEffect(() => {
    if (auroraTexts.length > 0) {
      generateGradient(auroraTexts[0]);
      // Fade in after a short delay
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [auroraTexts, generateGradient]);

  // Set up cycling interval
  useEffect(() => {
    if (auroraTexts.length <= 1) return;

    const cycle = () => {
      // Fade out
      setIsVisible(false);
      
      // After fade out, switch text and fade in
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % auroraTexts.length);
        
        // Generate new gradient for new text
        const newText = auroraTexts[(currentIndex + 1) % auroraTexts.length];
        generateGradient(newText);
        
        // Fade in new text
        setTimeout(() => setIsVisible(true), 50);
      }, fadeDuration * 1000);
    };

    // Start cycling after initial pause
    intervalRef.current = setInterval(cycle, pauseDuration);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [auroraTexts, currentIndex, pauseDuration, fadeDuration, generateGradient]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const currentText = auroraTexts[currentIndex] || '';

  return (
    <div className={className} style={{ minHeight: '200px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span>
          {headingText}{' '}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: fadeDuration }}
              className={`relative inline-block animate-aurora ${auroraTextClassName}`}
              style={gradientStyle}
            >
              {currentText}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.div>
    </div>
  );
};