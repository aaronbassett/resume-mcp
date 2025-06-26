import type { FC } from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
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
  pauseDuration = 24000, // 4x longer pause (was 6000)
  fadeDuration = 0.3, // 2x faster fade (was 0.6)
  auroraHueSkew = [240, 270, 300, 30, 60],
  auroraStops = 4,
  auroraMode = 'dark',
  className = '',
  auroraTextClassName = '',
  auroraGradientOptions = {},
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Memoize gradient options to prevent recreation
  const gradientOptions = useMemo(() => ({
    hueSkew: auroraHueSkew,
    stops: auroraStops,
    mode: auroraMode,
    angle: '45deg',
    ...auroraGradientOptions,
  }), [auroraHueSkew, auroraStops, auroraMode, auroraGradientOptions]);

  // Generate gradient style for current text
  const gradientStyle = useMemo(() => {
    if (auroraTexts.length === 0) return {};
    
    const currentText = auroraTexts[currentIndex] || '';
    const gradient = getCSSLinearGradient(currentText, gradientOptions);

    return {
      background: gradient,
      backgroundSize: '400% 400%',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    };
  }, [auroraTexts, currentIndex, gradientOptions]);

  // Initialize visibility
  useEffect(() => {
    if (auroraTexts.length > 0) {
      const timer = setTimeout(() => setIsVisible(true), 100);
      return () => clearTimeout(timer);
    }
  }, [auroraTexts.length]);

  // Set up cycling interval
  useEffect(() => {
    if (auroraTexts.length <= 1) return;

    const cycle = () => {
      // Fade out
      setIsVisible(false);
      
      // After fade out, switch text and fade in
      setTimeout(() => {
        setCurrentIndex(prev => (prev + 1) % auroraTexts.length);
        
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
  }, [auroraTexts.length, pauseDuration, fadeDuration]);

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
    <div className={className} style={{ minHeight: '320px', paddingBottom: '2rem' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        style={{ lineHeight: '1.1' }}
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
              style={{
                ...gradientStyle,
                display: 'inline-block',
                verticalAlign: 'baseline',
              }}
            >
              {currentText}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.div>
    </div>
  );
};