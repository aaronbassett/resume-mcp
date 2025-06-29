import type { FC, ReactNode, KeyboardEvent } from 'react';
import { useState, useRef, useEffect } from 'react';

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

  if (isEditing) {
    return (
      <div ref={inputContainerRef} className="relative">
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`${className} bg-muted/30 border border-border rounded-md px-3 py-2 outline-none focus:outline-none focus:ring-offset-0 focus:ring-0 focus:border-border focus:shadow-none w-full`}
          placeholder={placeholder}
        />
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