import type { FC } from 'react';
import { FileText } from 'lucide-react';
import Select, { SingleValue, StylesConfig } from 'react-select';
import type { Resume } from '../../types/analytics';
import { useThemeStore } from '../../store/theme';

interface ResumeOption {
  value: string;
  label: string;
}

interface ResumeMultiSelectorProps {
  resumes: Resume[];
  selectedResumeId?: string;
  onResumeChange: (resumeId?: string) => void;
}

export const ResumeMultiSelector: FC<ResumeMultiSelectorProps> = ({
  resumes,
  selectedResumeId,
  onResumeChange
}) => {
  const { theme } = useThemeStore();

  const options: ResumeOption[] = [
    { value: '', label: 'All Resumes' },
    ...resumes.map(resume => ({
      value: resume.id,
      label: resume.title
    }))
  ];

  const selectedOption = options.find(option => 
    option.value === (selectedResumeId || '')
  );

  const handleChange = (newValue: SingleValue<ResumeOption>) => {
    const newId = newValue?.value || undefined;
    onResumeChange(newId === '' ? undefined : newId);
  };

  const customStyles: StylesConfig<ResumeOption, false> = {
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
    dropdownIndicator: (provided) => ({
      ...provided,
      color: theme === 'dark' ? 'rgb(148 163 184)' : 'rgb(100 116 139)',
    }),
    indicatorSeparator: (provided) => ({
      ...provided,
      backgroundColor: theme === 'dark' ? 'rgb(30 41 59)' : 'rgb(226 232 240)',
    }),
  };

  return (
    <div className="flex items-center space-x-2 min-w-[200px]">
      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <Select
        isMulti={false}
        isSearchable={true}
        options={options}
        value={selectedOption}
        onChange={handleChange}
        placeholder="Select resume..."
        className="flex-1"
        classNamePrefix="react-select"
        styles={customStyles}
        menuPortalTarget={document.body}
        menuPosition="fixed"
      />
    </div>
  );
};