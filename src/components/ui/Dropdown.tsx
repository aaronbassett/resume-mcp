import type { FC, ReactNode } from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  onOpenChange?: (open: boolean) => void;
}

export const Dropdown: FC<DropdownProps> = ({ 
  trigger, 
  children, 
  align = 'right',
  className = '',
  onOpenChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        onOpenChange?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onOpenChange]);

  const handleTriggerClick = () => {
    const newState = !isOpen;
    setIsOpen(newState);
    onOpenChange?.(newState);
  };

  const closeDropdown = () => {
    setIsOpen(false);
    onOpenChange?.(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className={`absolute top-full mt-2 w-56 bg-popover border rounded-lg shadow-lg z-50 ${
              align === 'right' ? 'right-0' : 'left-0'
            }`}
          >
            <div className="py-1">
              {React.Children.map(children, (child) => {
                if (React.isValidElement(child) && child.type === DropdownItem) {
                  return React.cloneElement(child as React.ReactElement<DropdownItemProps>, {
                    onItemClick: closeDropdown
                  });
                }
                return child;
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  onItemClick?: () => void;
}

export const DropdownItem: FC<DropdownItemProps> = ({ 
  children, 
  onClick, 
  className = '',
  disabled = false,
  onItemClick
}) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
      onItemClick?.();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className={`w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
};

interface DropdownSeparatorProps {
  className?: string;
}

export const DropdownSeparator: FC<DropdownSeparatorProps> = ({ className = '' }) => {
  return <div className={`h-px bg-border my-1 ${className}`} />;
};