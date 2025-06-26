import type { FC } from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { BoxReveal } from './BoxReveal';
import { AuroraText } from './AuroraText';
import { getCSSLinearGradient, getCSSRadialGradient } from '../../utils/gradientGenerator';
import type { LinearGradientOptions, RadialGradientOptions } from '../../utils/gradientGenerator';

interface SwitchRevealHeadingProps {
  headingText: string;
  auroraTexts: string[];
  pauseDuration?: number;
  coverDuration?: number;
  coverDelay?: number;
  boxHueSkew?: number | number[];
  auroraHueSkew?: number | number[];
  boxStops?: number;
  auroraStops?: number;
  boxMode?: 'light' | 'dark';
  auroraMode?: 'light' | 'dark';
  className?: string;
  boxRevealClassName?: string;
  auroraTextClassName?: string;
  boxGradientOptions?: Omit<LinearGradientOptions, 'hueSkew' | 'stops' | 'mode'>;
  auroraGradientOptions?: Omit<RadialGradientOptions, 'hueSkew' | 'stops' | 'mode'>;
}

type AnimationPhase = 'initial-reveal' | 'pausing' | 'covering' | 'switching' | 'revealing';

export const SwitchRevealHeading: FC<SwitchRevealHeadingProps> = ({
  headingText,
  auroraTexts,
  pauseDuration = 6000,
  coverDuration = 0.5,
  coverDelay = 0,
  boxHueSkew = [240, 270, 300, 30, 60],
  auroraHueSkew = [240, 270, 300, 30, 60],
  boxStops = 3,
  auroraStops = 5,
  boxMode = 'dark',
  auroraMode = 'dark',
  className = '',
  boxRevealClassName = '',
  auroraTextClassName = '',
  boxGradientOptions = {},
  auroraGradientOptions = {},
}) => {
  const [currentAuroraText, setCurrentAuroraText] = useState('');
  const [usedTexts, setUsedTexts] = useState<string[]>([]);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('initial-reveal');
  const [boxGradient, setBoxGradient] = useState('');
  const [auroraBackgroundStyle, setAuroraBackgroundStyle] = useState<React.CSSProperties>({});
  
  // Use a single timeout ref and a flag to prevent multiple handlers
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

  // Function to generate gradients based on the aurora text
  const generateGradients = useCallback((text: string) => {
    const boxGrad = getCSSLinearGradient(text, {
      hueSkew: boxHueSkew,
      stops: boxStops,
      mode: boxMode,
      ...boxGradientOptions,
    });

    const auroraGrad = getCSSRadialGradient(text, {
      hueSkew: auroraHueSkew,
      stops: auroraStops,
      mode: auroraMode,
      size: 'closest-side',
      ...auroraGradientOptions,
    });

    setBoxGradient(boxGrad);
    setAuroraBackgroundStyle({ backgroundImage: auroraGrad });
  }, [
    boxHueSkew,
    auroraHueSkew,
    boxStops,
    auroraStops,
    boxMode,
    auroraMode,
    boxGradientOptions,
    auroraGradientOptions,
  ]);

  // Initialize with the first aurora text
  useEffect(() => {
    if (auroraTexts.length > 0 && !currentAuroraText) {
      const firstText = selectRandomAuroraText();
      setCurrentAuroraText(firstText);
      setUsedTexts([firstText]);
      generateGradients(firstText);
    }
  }, [auroraTexts, currentAuroraText, selectRandomAuroraText, generateGradients]);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle animation completion with proper state management
  const handleAnimationComplete = useCallback(() => {
    // Prevent multiple calls
    if (isProcessingRef.current) {
      return;
    }
    
    isProcessingRef.current = true;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    console.log('Animation completed, current phase:', animationPhase);

    switch (animationPhase) {
      case 'initial-reveal':
        // After initial reveal, start pausing
        setAnimationPhase('pausing');
        timeoutRef.current = setTimeout(() => {
          setAnimationPhase('covering');
          isProcessingRef.current = false;
        }, pauseDuration);
        break;

      case 'covering':
        // After covering, switch text immediately
        setAnimationPhase('switching');
        timeoutRef.current = setTimeout(() => {
          const newText = selectRandomAuroraText();
          setCurrentAuroraText(newText);
          setUsedTexts(prev => [...prev, newText]);
          generateGradients(newText);
          setAnimationPhase('revealing');
          isProcessingRef.current = false;
        }, 300);
        break;

      case 'revealing':
        // After revealing, start pausing again
        setAnimationPhase('pausing');
        timeoutRef.current = setTimeout(() => {
          setAnimationPhase('covering');
          isProcessingRef.current = false;
        }, pauseDuration);
        break;

      default:
        isProcessingRef.current = false;
        break;
    }
  }, [animationPhase, pauseDuration, selectRandomAuroraText, generateGradients]);

  // Convert animation phase to BoxReveal animation state
  const getBoxRevealAnimationState = () => {
    switch (animationPhase) {
      case 'initial-reveal':
      case 'revealing':
        return 'reveal';
      case 'covering':
        return 'cover';
      default:
        return 'reveal';
    }
  };

  return (
    <div className={className}>
      <BoxReveal
        boxGradient={boxGradient}
        duration={coverDuration}
        delay={coverDelay}
        animationState={getBoxRevealAnimationState()}
        onAnimationComplete={handleAnimationComplete}
        className={boxRevealClassName}
      >
        <span>
          {headingText}{' '}
          <AuroraText 
            style={auroraBackgroundStyle}
            className={auroraTextClassName}
          >
            {currentAuroraText}
          </AuroraText>
        </span>
      </BoxReveal>
    </div>
  );
};