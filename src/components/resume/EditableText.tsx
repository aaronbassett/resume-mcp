import type { FC, ReactNode, KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Wand2 } from 'lucide-react'; 
import { HypeButton } from '../ui/HypeButton';

interface EditableTextProps {
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  children?: ReactNode;
}

export const EditableText: FC<EditableTextProps> = ({
  value,
  placeholder,
  onSave,
  as: Component = 'p',
  className = '',
  children
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleEdit = () => {
    setEditValue(value);
    setIsEditing(true);
  };

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    handleSave();
  };

  const handleHypeButtonClick = () => {
    // This is where the magic happens! 
    // In a real implementation, this could trigger AI enhancement of the text
    console.log('✨ Hype button clicked! Adding some magic...');
  };

  if (isEditing) {
    return (
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className={`${className} bg-muted/30 border border-border rounded-md px-3 py-2 pr-12 outline-none focus:outline-none focus:ring-offset-0 focus:ring-0 focus:border-border focus:shadow-none w-full`}
          placeholder={placeholder}
        />
        
        {/* HypeButton positioned on the right side of the input */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <HypeButton
            variant="accent"
            onClick={handleHypeButtonClick}
            className="h-8 w-8 p-0 text-xs"
            title="Add some AI magic ✨"
          >
            <Wand2 className="h-4 w-4" />
          </HypeButton>
        </div>
      </div>
    );
  }

  return (
    <Component
      className={`${className} ${isPlaceholder ? 'text-muted-foreground italic' : ''} cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1 transition-colors focus:ring-0 focus:ring-ring focus:ring-offset-0 focus:border-border focus:shadow-none`}
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEdit();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label={`Edit ${placeholder.toLowerCase()}`}
    >
      {children || displayValue}
    </Component>
  );
};