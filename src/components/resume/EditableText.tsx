import type { FC, ReactNode, KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';
import { Wand2 } from 'lucide-react'; 
import { HypeButton } from '../ui/HypeButton';
import { LLMTextAssist } from '../ui/LLMTextAssist';

interface LLMTextAssistProps {
  existingValue?: string;
  setNewValue: (value: string) => void;
  additionalContext?: string[];
  className?: string;
  onClick?: (e: React.MouseEvent) => void;
}

interface EditableTextProps {
  value: string;
  placeholder: string;
  onSave: (value: string) => void;
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  children?: ReactNode;
  llmOptions?: Omit<LLMTextAssistProps, 'existingValue' | 'setNewValue'>;
}

export const EditableText: FC<EditableTextProps> = ({
  value,
  placeholder,
  onSave,
  as: Component = 'p',
  className = '',
  children,
  llmOptions
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);

  const displayValue = value || placeholder;
  const isPlaceholder = !value;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    // Only add click outside listener when editing
    if (isEditing) {
      const handleClickOutside = (e: MouseEvent) => {
        // Only save and exit if click is outside the input container
        if (inputContainerRef.current && !inputContainerRef.current.contains(e.target as Node)) {
          handleSave();
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [isEditing, editValue]);

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

  const handleHypeButtonClick = (e: React.MouseEvent) => {
    // Stop propagation to prevent the blur event from firing
    e.stopPropagation();
  };

  if (isEditing) {
    return (
      <div ref={inputContainerRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${className} bg-muted/30 border border-border rounded-md px-3 py-2 pr-12 outline-none focus:outline-none focus:ring-offset-0 focus:ring-0 focus:border-border focus:shadow-none w-full`}
          placeholder={placeholder}
        />
        
        {/* LLMTextAssist positioned on the right side of the input */}
        {llmOptions && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <LLMTextAssist
              existingValue={editValue}
              setNewValue={setEditValue}
              additionalContext={llmOptions.additionalContext || [
                `The user is editing a ${Component} element with placeholder "${placeholder}"`,
                `Current field value: ${editValue || "empty"}`
              ]}
              onClick={handleHypeButtonClick}
              {...llmOptions}
            />
          </div>
        )}
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