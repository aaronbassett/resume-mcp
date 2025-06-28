import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { WithContext as ReactTags, SEPARATORS } from 'react-tag-input';
import type { Tag } from '../../store/resume';

interface EditableTagsProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  placeholder?: string;
  className?: string;
}

const suggestions = [
  { id: 'frontend', text: 'Frontend', className: '' },
  { id: 'backend', text: 'Backend', className: '' },
  { id: 'fullstack', text: 'Full Stack', className: '' },
  { id: 'react', text: 'React', className: '' },
  { id: 'typescript', text: 'TypeScript', className: '' },
  { id: 'javascript', text: 'JavaScript', className: '' },
  { id: 'nodejs', text: 'Node.js', className: '' },
  { id: 'python', text: 'Python', className: '' },
  { id: 'java', text: 'Java', className: '' },
  { id: 'senior', text: 'Senior', className: '' },
  { id: 'lead', text: 'Lead', className: '' },
  { id: 'manager', text: 'Manager', className: '' },
  { id: 'devops', text: 'DevOps', className: '' },
  { id: 'cloud', text: 'Cloud', className: '' },
  { id: 'aws', text: 'AWS', className: '' },
  { id: 'azure', text: 'Azure', className: '' },
  { id: 'gcp', text: 'GCP', className: '' },
  { id: 'mobile', text: 'Mobile', className: '' },
  { id: 'ios', text: 'iOS', className: '' },
  { id: 'android', text: 'Android', className: '' },
  { id: 'remote', text: 'Remote', className: '' },
  { id: 'startup', text: 'Startup', className: '' },
  { id: 'enterprise', text: 'Enterprise', className: '' },
];

export const EditableTags: FC<EditableTagsProps> = ({
  tags,
  onTagsChange,
  placeholder = 'Click to add tags',
  className = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsEditing(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsEditing(false);
      }
    };

    if (isEditing) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isEditing]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleAddition = (tag: Tag) => {
    const newTags = [...tags, { ...tag, id: tag.id || tag.text }];
    onTagsChange(newTags);
  };

  const handleDelete = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onTagsChange(newTags);
  };

  const handleDrag = (tag: Tag, currPos: number, newPos: number) => {
    const newTags = [...tags];
    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);
    onTagsChange(newTags);
  };

  const displayValue = tags.length > 0 ? '' : placeholder;
  const isPlaceholder = tags.length === 0;

  if (isEditing) {
    return (
      <div ref={containerRef} className={`${className} min-h-[2.5rem]`}>
        <ReactTags
          tags={tags}
          suggestions={suggestions}
          separators={[SEPARATORS.TAB]}
          handleAddition={handleAddition}
          handleDelete={handleDelete}
          handleDrag={handleDrag}
          placeholder="Add a tag..."
          autofocus={true}
          allowDragDrop={true}
          allowUnique={true}
          classNames={{
            tags: 'react-tags',
            tagInput: 'react-tags__input',
            tagInputField: 'react-tags__input-field bg-transparent border-none outline-none text-sm placeholder:text-muted-foreground',
            selected: 'react-tags__selected',
            tag: 'react-tags__tag inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground mr-2 mb-2',
            remove: 'react-tags__remove ml-2 cursor-pointer hover:text-primary-foreground/80',
            suggestions: 'react-tags__suggestions absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto',
            activeSuggestion: 'react-tags__suggestion--active bg-accent text-accent-foreground',
          }}
        />
      </div>
    );
  }

  return (
    <div
      className={`${className} ${isPlaceholder ? 'text-muted-foreground italic' : ''} cursor-pointer hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1 transition-colors focus:outline-none focus:ring-2 focus:ring-ring min-h-[2.5rem] flex items-center flex-wrap gap-2`}
      onClick={handleEdit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleEdit();
        }
      }}
      tabIndex={0}
      role="button"
      aria-label="Edit tags"
    >
      {tags.length > 0 ? (
        tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary text-primary-foreground"
          >
            {tag.text}
          </span>
        ))
      ) : (
        displayValue
      )}
    </div>
  );
};