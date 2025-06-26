import type { FC } from 'react';
import { memo } from 'react';

interface AuroraTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const AuroraText: FC<AuroraTextProps> = memo(
  ({ children, className = '', style }) => {
    const gradientStyle = {
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      backgroundSize: '200% auto',
      ...style,
    };

    return (
      <span className={`relative inline-block ${className}`}>
        <span className="sr-only">{children}</span>
        <span
          className="relative animate-aurora bg-clip-text text-transparent"
          style={gradientStyle}
          aria-hidden="true"
        >
          {children}
        </span>
      </span>
    );
  }
);

AuroraText.displayName = 'AuroraText';