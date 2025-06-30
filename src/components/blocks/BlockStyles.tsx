import { twMerge } from 'tailwind-merge';

/**
 * Common styles for block components
 */
export const blockStyles = {
  // Container styles
  container: {
    view: 'rounded-lg border border-gray-200 bg-white p-4 hover:shadow-sm transition-shadow',
    edit: 'rounded-lg border-2 border-blue-500 bg-gray-50 p-4',
    empty: 'rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center',
  },

  // Input styles
  input: {
    base: 'block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
  },

  // Label styles
  label: 'mb-2 block text-sm font-medium text-gray-900',

  // Button styles
  button: {
    primary: 'rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300',
    secondary: 'rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200',
    danger: 'rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300',
  },

  // Helper text styles
  helperText: {
    base: 'mt-1 text-xs text-gray-500',
    error: 'mt-1 text-xs text-red-600',
  },

  // Block header styles
  header: {
    title: 'text-lg font-semibold text-gray-900',
    subtitle: 'text-sm text-gray-500',
  },

  // Drag handle styles
  dragHandle: 'cursor-move text-gray-400 hover:text-gray-600',

  // Empty state styles
  emptyState: {
    icon: 'mx-auto h-12 w-12 text-gray-400',
    title: 'mt-2 text-sm font-medium text-gray-900',
    description: 'mt-1 text-sm text-gray-500',
  },
};

/**
 * Helper function to merge Tailwind classes
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return twMerge(inputs.filter(Boolean).join(' '));
}

/**
 * Block wrapper component with consistent styling
 */
interface BlockWrapperProps {
  children: React.ReactNode;
  isEditing?: boolean;
  isEmpty?: boolean;
  className?: string;
  onClick?: () => void;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  children,
  isEditing = false,
  isEmpty = false,
  className,
  onClick,
}) => {
  const baseStyles = isEmpty
    ? blockStyles.container.empty
    : isEditing
    ? blockStyles.container.edit
    : blockStyles.container.view;

  return (
    <div
      className={cn(baseStyles, className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </div>
  );
};