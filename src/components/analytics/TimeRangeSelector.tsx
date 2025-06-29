import type { FC } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Dropdown, DropdownItem } from '../ui/Dropdown';
import { CustomDateRangePicker } from './CustomDateRangePicker';

interface TimeRangeSelectorProps {
  selectedRange: string;
  customStartDate?: Date;
  customEndDate?: Date;
  onRangeChange: (range: string) => void;
  onCustomRangeChange?: (start: Date, end: Date) => void;
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
  customStartDate,
  customEndDate,
  onRangeChange,
  onCustomRangeChange
}) => {
  const selectedLabel = timeRanges.find(range => range.value === selectedRange)?.label || 'Select range';

  const handleCustomRangeChange = (start: Date, end: Date) => {
    if (onCustomRangeChange) {
      onCustomRangeChange(start, end);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      <div className="flex items-center space-x-2">
        <Dropdown
          trigger={
            <Button variant="outline" className="justify-between min-w-[160px]">
              <span>{selectedLabel}</span>
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

        {selectedRange === 'custom' && customStartDate && customEndDate && onCustomRangeChange && (
          <CustomDateRangePicker
            startDate={customStartDate}
            endDate={customEndDate}
            onDateRangeChange={handleCustomRangeChange}
          />
        )}
      </div>
    </div>
  );
};