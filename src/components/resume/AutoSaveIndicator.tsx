import type { FC } from 'react';
import { Hourglass, CheckCircle as CircleCheckBig, Circle as CircleX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveIndicatorProps {
  status: SaveStatus;
  onRetry?: () => void;
  className?: string;
}

export const AutoSaveIndicator: FC<AutoSaveIndicatorProps> = ({
  status,
  onRetry,
  className = ''
}) => {
  const getIcon = () => {
    switch (status) {
      case 'saving':
        return <Hourglass className="h-4 w-4 text-amber-500 animate-pulse" />;
      case 'saved':
        return <CircleCheckBig className="h-4 w-4 text-green-500" />;
      case 'error':
        return <CircleX className="h-4 w-4 text-red-500" />;
      case 'idle':
        return <div className="h-4 w-4" />; // Invisible placeholder to maintain space
    }
  };

  const getTooltip = () => {
    switch (status) {
      case 'saving':
        return 'Saving Resume';
      case 'saved':
        return 'All Changes Saved';
      case 'error':
        return 'Saving Failed: Click to Retry';
      default:
        return '';
    }
  };

  const handleClick = () => {
    if (status === 'error' && onRetry) {
      onRetry();
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <AnimatePresence mode="wait">
        <motion.button
          key={status}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: status === 'idle' ? 0 : 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          onClick={handleClick}
          disabled={status !== 'error'}
          className={`
            flex items-center justify-center w-8 h-8 rounded-full bg-background border border-border shadow-sm
            ${status === 'error' ? 'cursor-pointer hover:bg-accent hover:border-accent-foreground/20' : 'cursor-default'}
            ${status === 'idle' ? 'pointer-events-none' : ''}
            transition-all duration-200
          `}
          title={getTooltip()}
          aria-label={getTooltip()}
        >
          {getIcon()}
        </motion.button>
      </AnimatePresence>
    </div>
  );
};