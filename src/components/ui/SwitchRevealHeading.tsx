import type { FC } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCSSRadialGradient } from '../../utils/gradientGenerator';
import type { RadialGradientOptions } from '../../utils/gradientGenerator';

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
  auroraGradientOptions?: Omit<RadialGradientOptions, 'hueSkew' | 'stops' | 'mode'>;
}

export const SwitchRevealHeading: FC<SwitchRevealHeadingProps> = ({
  headingText,
  auroraTexts,
  pauseDuration = 6000,
  fadeDuration = 0.6,
  auroraHueSkew = [240, 270, 300, 30, 60],
  auroraStops = 5,
  auroraMode = 'dark',
  className = '',
  auroraTextClassName = '',
  auroraGradientOptions = {},
}) => {
  const [currentAuroraText, setCurrentAuroraText] = useState('');
  const [usedTexts, setUsedTexts] = useState<string[]>([]);
  const [auroraBackgroundStyle, setAuroraBackgroundStyle] = useState<React.CSSProperties>({});
  const [isVisible, setIsVisible] = useState(false);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isProcessingRef = useRef(false);

  // Function to select a random aurora text that hasn't been used
  const selectRandomAuroraText = useCallback(() => {
    const availableTexts = auroraTexts.filter(text => !usedTexts.includes(text));
    
    // If all texts have been used, reset the used texts array
    if (availableTexts.length === 0) {
      setUsedTexts([]);
      const randomIndex = Math.floor(Math.random() * auroraTexts.length);
      return auroraTexts[randomIndex];
    }
    
    const randomIndex = Math.floor(Math.random() * availableTexts.length);
    return availableTexts[randomIndex];
  }, [auroraTexts, usedTexts]);

  // Function to generate gradient based on the aurora text
  const generateGradient = useCallback((text: string) => {
    const auroraGrad = getCSSRadialGradient(text, {
      hueSkew: auroraHueSkew,
      stops: auroraStops,
      mode: auroraMode,
      size: 'closest-side',
      ...auroraGradientOptions,
    });

    setAuroraBackgroundStyle({ backgroundImage: auroraGrad });
  }, [
    auroraHueSkew,
    auroraStops,
    auroraMode,
    auroraGradientOptions,
  ]);

  // Initialize with the first aurora text
  useEffect(() => {
    if (auroraTexts.length > 0 && !currentAuroraText) {
      const firstText = selectRandomAuroraText();
      setCurrentAuroraText(firstText);
      setUsedTexts([firstText]);
      generateGradient(firstText);
      
      // Fade in the initial text
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [auroraTexts, currentAuroraText, selectRandomAuroraText, generateGradient]);

  // Start the cycling after initial mount
  useEffect(() => {
    if (!currentAuroraText || auroraTexts.length <= 1) return;

    const startCycling = () => {
      if (isProcessingRef.current) return;
      isProcessingRef.current = true;

      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Wait for pause duration, then fade out
      timeoutRef.current = setTimeout(() => {
        setIsVisible(false);
        
        // After fade out completes, switch text and fade in
        setTimeout(() => {
          const newText = selectRandomAuroraText();
          setCurrentAuroraText(newText);
          setUsedTexts(prev => [...prev, newText]);
          generateGradient(newText);
          
          // Fade in new text
          setTimeout(() => {
            setIsVisible(true);
            isProcessingRef.current = false;
            
            // Continue cycling
            startCycling();
          }, 100);
        }, fadeDuration * 1000);
      }, pauseDuration);
    };

    // Start the first cycle after initial fade in
    const initialTimeout = setTimeout(startCycling, pauseDuration);

    return () => {
      clearTimeout(initialTimeout);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [currentAuroraText, auroraTexts.length, pauseDuration, fadeDuration, selectRandomAuroraText, generateGradient]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const auroraGradientStyle = {
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    backgroundSize: '200% auto',
    backgroundImage: auroraBackgroundStyle.backgroundImage,
  };

  return (
    <div className={`${className}`} style={{ minHeight: '200px' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <span>
          {headingText}{' '}
          <AnimatePresence mode="wait">
            <motion.span
              key={currentAuroraText}
              initial={{ opacity: 0 }}
              animate={{ opacity: isVisible ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: fadeDuration }}
              className={`relative inline-block animate-aurora bg-clip-text text-transparent ${auroraTextClassName}`}
              style={auroraGradientStyle}
            >
              {currentAuroraText}
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.div>
    </div>
  );
};