import type { FC } from 'react';
import { FileText } from 'lucide-react';
import Select, { MultiValue, StylesConfig } from 'react-select';
import type { Resume } from '../../types/analytics';
import { useThemeStore } from '../../store/theme';

interface ResumeOption {
  value: string;
  label: string;
}

interface ResumeMultiSelectorProps {
  resumes: Resume[];
  selectedResumeIds: string[];
  onResumeChange: (resumeIds: string[]) => void;
}

export const ResumeMultiSelector: FC<ResumeMultiSelectorProps> = ({
  resumes,
  selectedResumeIds,
  onResumeChange
}) => {
  const { theme } = useThemeStore();

  const options: ResumeOption[] = resumes.map(resume => ({
    value: resume.id,
    label: resume.title
  }));

  const selectedOptions = options.filter(option => 
    selectedResumeIds.includes(option.value)
  );

  const handleChange = (newValue: MultiValue<ResumeOption>) => {
    const newIds = newValue.map(option => option.value);
    onResumeChange(newIds);
  };

  const customStyles: StylesConfig<ResumeOption, true> = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? 'rgb(30 41 59)' : 'rgb(255 255 255)',
      borderColor: theme === 'dark' ? 'rgb(30 41 59)' : 'rgb(226 232 240)',
      borderRadius: '0.375rem',
      minHeight: '2.5rem',
      boxShadow: state.isFocused ? 
        (theme === 'dark' ? '0 0 0 2px rgb(129 140 248)' : '0 0 0 2px rgb(99 102 241)') : 
        'none',
      '&:hover': {
        borderColor: theme === 'dark' ? 'rgb(148 163 184)' : 'rgb(148 163 184)',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? 'rgb(15 23 42)' : 'rgb(255 255 255)',
      border: theme === 'dark' ? '1px solid rgb(30 41 59)' : '1px solid rgb(226 232 240)',
      borderRadius: '0.375rem',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 50,
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? (theme === 'dark' ? 'rgb(99 102 241)' : 'rgb(99 102 241)')
        : state.isFocused 
          ? (theme === 'dark' ? 'rgb(30 41 59)' : 'rgb(241 245 249)')
          : 'transparent',
      color: state.isSelected 
        ? 'white'
        : (theme === 'dark' ? 'rgb(248 250 252)' : 'rgb(15 23 42)'),
      '&:hover': {
        backgroundColor: state.isSelected 
          ? (theme === 'dark' ? 'rgb(99 102 241)' : 'rgb(99 102 241)')
          : (theme === 'dark' ? 'rgb(30 41 59)' : 'rgb(241 245 249)'),
      },
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? 'rgb(99 102 241)' : 'rgb(99 102 241)',
      borderRadius: '0.375rem',
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: 'white',
      fontSize: '0.875rem',
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: 'white',
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        color: 'white',
      },
    }),
    placeholder: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'rgb(148 163 184)' : 'rgb(100 116 139)',
    }),
    singleValue: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'rgb(248 250 252)' : 'rgb(15 23 42)',
    }),
    input: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'rgb(248 250 252)' : 'rgb(15 23 42)',
    }),
  };

  return (
    <div className="flex items-center space-x-2 min-w-[300px]">
      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Select
        isMulti
        isSearchable
        options={options}
        value={selectedOptions}
        onChange={handleChange}
        placeholder="Select resumes..."
        className="flex-1"
        classNamePrefix="react-select"
        styles={customStyles}
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    </div>
  );
};