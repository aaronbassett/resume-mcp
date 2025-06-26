import type { FC } from 'react';
import { useState, useEffect, useCallback } from 'react';
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
  const [animationState, setAnimationState] = useState<'initial-reveal' | 'reveal' | 'cover'>('initial-reveal');
  const [boxGradient, setBoxGradient] = useState('');
  const [auroraBackgroundStyle, setAuroraBackgroundStyle] = useState<React.CSSProperties>({});

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
    if (auroraTexts.length > 0) {
      const firstText = selectRandomAuroraText();
      setCurrentAuroraText(firstText);
      setUsedTexts([firstText]);
      generateGradients(firstText);
    }
  }, [auroraTexts, selectRandomAuroraText, generateGradients]);

  // Handle animation completion
  const handleAnimationComplete = useCallback(() => {
    if (animationState === 'initial-reveal') {
      // After initial reveal, start the cycle
      setTimeout(() => {
        setAnimationState('cover');
      }, pauseDuration);
    } else if (animationState === 'cover') {
      // After covering, switch text and reveal
      setTimeout(() => {
        const newText = selectRandomAuroraText();
        setCurrentAuroraText(newText);
        setUsedTexts(prev => [...prev, newText]);
        generateGradients(newText);
        setAnimationState('reveal');
      }, 300); // Brief pause before switching text
    } else if (animationState === 'reveal') {
      // After revealing, wait and then cover again
      setTimeout(() => {
        setAnimationState('cover');
      }, pauseDuration);
    }
  }, [animationState, pauseDuration, selectRandomAuroraText, generateGradients]);

  return (
    <div className={className}>
      <BoxReveal
        boxGradient={boxGradient}
        duration={coverDuration}
        delay={coverDelay}
        animationState={animationState}
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