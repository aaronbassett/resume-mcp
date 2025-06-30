import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useThemeStore } from '../store/theme';

// Import Vanta.js effects dynamically to avoid SSR issues
let VANTA: any = null;

interface VantaBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const VantaBackground: React.FC<VantaBackgroundProps> = ({ children, className = '' }) => {
  const vantaRef = useRef<HTMLDivElement>(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);
  const { theme } = useThemeStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadVanta = async () => {
      if (!VANTA) {
        // Dynamically import Vanta.js
        const vantaModule = await import('vanta/dist/vanta.topology.min');
        VANTA = vantaModule.default;
        setIsLoaded(true);
      } else {
        setIsLoaded(true);
      }
    };

    loadVanta();

    return () => {
      // Clean up on unmount
      if (vantaEffect) {
        vantaEffect.destroy();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !vantaRef.current) return;

    // Destroy previous effect if it exists
    if (vantaEffect) {
      vantaEffect.destroy();
    }

    // Create new effect with theme-appropriate colors
    const newEffect = VANTA.TOPOLOGY({
      el: vantaRef.current,
      THREE: THREE,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200,
      minWidth: 200,
      scale: 1.0,
      scaleMobile: 1.0,
      color: theme === 'dark' ? 0x6366f1 : 0x6366f1, // Primary color
      backgroundColor: theme === 'dark' ? 0x020617 : 0xffffff // Background color
    });

    setVantaEffect(newEffect);

    // Clean up on theme change
    return () => {
      if (newEffect) {
        newEffect.destroy();
      }
    };
  }, [theme, isLoaded]);

  return (
    <div ref={vantaRef} className={`relative ${className}`}>
      {children}
    </div>
  );
};