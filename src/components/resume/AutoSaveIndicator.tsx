import type { FC } from 'react';
import { Hourglass, CircleCheckBig, CircleX } from 'lucide-react';
import { motion } from 'framer-motion';

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
        return <Hourglass className="h-5 w-5 text-amber-500 animate-pulse" />;
      case 'saved':
        return <CircleCheckBig className="h-5 w-5 text-green-500" />;
      case 'error':
        return <CircleX className="h-5 w-5 text-red-500" />;
      default:
        return null;
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

  if (status === 'idle') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={`fixed top-4 right-4 z-50 ${className}`}
    >
      <button
        onClick={handleClick}
        disabled={status !== 'error'}
        className={`
          flex items-center justify-center w-12 h-12 rounded-full bg-background border border-border shadow-lg
          ${status === 'error' ? 'cursor-pointer hover:bg-accent' : 'cursor-default'}
          transition-colors duration-200
        `}
        title={getTooltip()}
        aria-label={getTooltip()}
      >
        {getIcon()}
      </button>
    </motion.div>
  );
};