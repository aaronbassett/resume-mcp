import type { FC } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';

interface TimeRangeSelectorProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

const timeRanges = [
  { value: 'last_24h', label: 'Last 24 hours' },
  { value: 'last_7d', label: 'Last 7 days' },
  { value: 'last_30d', label: 'Last 30 days' },
  { value: 'last_90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
];

export const TimeRangeSelector: FC<TimeRangeSelectorProps> = ({
  selectedRange,
  onRangeChange
}) => {
  const selectedLabel = timeRanges.find(range => range.value === selectedRange)?.label || 'Select range';

  return (
    <Dropdown
      trigger={
        <Button variant="outline" className="justify-between min-w-[160px]">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{selectedLabel}</span>
          </div>
          <ChevronDown className="h-4 w-4" />
        </Button>
      }
    >
      {timeRanges.map((range) => (
        <DropdownItem
          key={range.value}
          onClick={() => onRangeChange(range.value)}
          className={selectedRange === range.value ? 'bg-accent' : ''}
        >
          {range.label}
        </DropdownItem>
      ))}
    </Dropdown>
  );
};