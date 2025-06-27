import type { FC } from 'react';
import { FileText, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import type { Resume } from '../../types/analytics';

interface ResumeSelectorProps {
  resumes: Resume[];
  selectedResumeId?: string;
  onResumeChange: (resumeId?: string) => void;
}

export const ResumeSelector: FC<ResumeSelectorProps> = ({
  resumes,
  selectedResumeId,
  onResumeChange
}) => {
  const selectedResume = resumes.find(resume => resume.id === selectedResumeId);
  const selectedLabel = selectedResume ? selectedResume.title : 'All Resumes';

  return (
    <Dropdown
      trigger={
        <Button variant="outline" className="justify-between min-w-[180px]">
          <div className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span className="truncate">{selectedLabel}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      }
    >
      <DropdownItem
        onClick={() => onResumeChange(undefined)}
        className={!selectedResumeId ? 'bg-accent' : ''}
      >
        All Resumes
      </DropdownItem>
      {resumes.map((resume) => (
        <DropdownItem
          key={resume.id}
          onClick={() => onResumeChange(resume.id)}
          className={selectedResumeId === resume.id ? 'bg-accent' : ''}
        >
          {resume.title}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};