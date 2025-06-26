import type { FC } from 'react';
import { getCSSGradient } from '../../utils/gradientGenerator';
import { useThemeStore } from '../../store/theme';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export const Avatar: FC<AvatarProps> = ({ 
  src, 
  alt = '', 
  size = 'md', 
  fallback,
  className = '' 
}) => {
  const theme = useThemeStore((state) => state.theme);
  
  const sizes = {
    sm: 'h-6 w-6 text-xs',
    md: 'h-8 w-8 text-sm',
    lg: 'h-10 w-10 text-base',
    xl: 'h-12 w-12 text-lg',
  };

  // Generate initials properly
  const getInitials = (name: string): string => {
    if (!name) return '';
    
    // Split by spaces and take first character of each word, limit to 2 characters
    const words = name.trim().split(/\s+/);
    if (words.length === 1) {
      // Single word - take first 2 characters
      return words[0].substring(0, 2).toUpperCase();
    } else {
      // Multiple words - take first character of first two words
      return words.slice(0, 2).map(word => word.charAt(0)).join('').toUpperCase();
    }
  };

  // Use fallback if provided, otherwise generate initials from alt
  const initials = fallback || getInitials(alt);
  
  // Generate radial gradient background based on the text we're using for initials
  const gradientInput = fallback || alt || 'default';
  const gradientBackground = getCSSRadialGradient(gradientInput, theme);

  return (
    <div className={`relative inline-flex items-center justify-center rounded-full overflow-hidden ${sizes[size]} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
        />
      ) : (
        <div 
          className="h-full w-full flex items-center justify-center"
          style={{ background: gradientBackground }}
        >
          <span className="font-semibold text-white drop-shadow-sm">
            {initials}
          </span>
        </div>
      )}
    </div>
  );
};