import type { FC } from 'react';
import { useState, useRef, useEffect } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/Button';

interface CustomDateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onDateRangeChange: (start: Date, end: Date) => void;
}

export const CustomDateRangePicker: FC<CustomDateRangePickerProps> = ({
  startDate,
  endDate,
  onDateRangeChange
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate);
  const [tempEndDate, setTempEndDate] = useState(endDate);
  const [leftCalendarDate, setLeftCalendarDate] = useState(new Date(startDate.getFullYear(), startDate.getMonth(), 1));
  const [rightCalendarDate, setRightCalendarDate] = useState(new Date(endDate.getFullYear(), endDate.getMonth(), 1));
  const [selectingStart, setSelectingStart] = useState(true);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDateRange = () => {
    const start = startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    const end = endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${start} - ${end}`;
  };

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const isSameDay = (date1: Date, date2: Date) => {
    return date1.getDate() === date2.getDate() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getFullYear() === date2.getFullYear();
  };

  const isInRange = (date: Date) => {
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return isSameDay(date, today);
  };

  const handleDateClick = (date: Date) => {
    if (selectingStart) {
      setTempStartDate(date);
      if (date > tempEndDate) {
        setTempEndDate(date);
      }
      setSelectingStart(false);
    } else {
      if (date < tempStartDate) {
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      } else {
        setTempEndDate(date);
      }
      setSelectingStart(true);
    }
  };

  const handleApply = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempStartDate(startDate);
    setTempEndDate(endDate);
    setIsOpen(false);
  };

  const navigateMonth = (direction: 'prev' | 'next', calendar: 'left' | 'right') => {
    const currentDate = calendar === 'left' ? leftCalendarDate : rightCalendarDate;
    const newDate = new Date(currentDate);
    
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }

    if (calendar === 'left') {
      setLeftCalendarDate(newDate);
      // Ensure right calendar is always after left
      if (newDate >= rightCalendarDate) {
        const rightDate = new Date(newDate);
        rightDate.setMonth(rightDate.getMonth() + 1);
        setRightCalendarDate(rightDate);
      }
    } else {
      setRightCalendarDate(newDate);
      // Ensure left calendar is always before right
      if (newDate <= leftCalendarDate) {
        const leftDate = new Date(newDate);
        leftDate.setMonth(leftDate.getMonth() - 1);
        setLeftCalendarDate(leftDate);
      }
    }
  };

  const renderCalendar = (calendarDate: Date, isLeft: boolean) => {
    const daysInMonth = getDaysInMonth(calendarDate);
    const firstDay = getFirstDayOfMonth(calendarDate);
    const monthName = calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(calendarDate.getFullYear(), calendarDate.getMonth(), day);
      const isSelected = isSameDay(date, tempStartDate) || isSameDay(date, tempEndDate);
      const isInDateRange = isInRange(date);
      const isCurrentDay = isToday(date);
      
      days.push(
        <button
          key={day}
          onClick={() => handleDateClick(date)}
          className={`
            w-8 h-8 text-sm rounded-md transition-colors relative
            ${isSelected 
              ? 'bg-primary text-primary-foreground font-semibold' 
              : isInDateRange 
                ? 'bg-primary/20 text-primary' 
                : 'hover:bg-accent hover:text-accent-foreground'
            }
            ${isCurrentDay && !isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev', isLeft ? 'left' : 'right')}
            className="p-1 hover:bg-accent rounded-md"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <h3 className="font-semibold text-sm">{monthName}</h3>
          <button
            onClick={() => navigateMonth('next', isLeft ? 'left' : 'right')}
            className="p-1 hover:bg-accent rounded-md"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="w-8 h-6 text-xs font-medium text-muted-foreground flex items-center justify-center">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="justify-start min-w-[200px]"
      >
        <CalendarDays className="mr-2 h-4 w-4" />
        {formatDateRange()}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 bg-popover border rounded-lg shadow-lg z-50 right-0"
          >
            <div className="flex">
              {renderCalendar(leftCalendarDate, true)}
              <div className="w-px bg-border" />
              {renderCalendar(rightCalendarDate, false)}
            </div>
            
            <div className="flex items-center justify-between p-4 border-t bg-muted/20">
              <div className="text-sm text-muted-foreground">
                {selectingStart ? 'Select start date' : 'Select end date'}
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply}>
                  Apply
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};