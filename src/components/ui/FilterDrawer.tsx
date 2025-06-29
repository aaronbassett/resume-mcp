import type { FC } from 'react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, X, Calendar, Tag, Eye, BarChart3 } from 'lucide-react';
import { Button } from './Button';
import { TextInput, Select } from 'flowbite-react';

interface FilterOptions {
  dateRange: 'all' | 'last_week' | 'last_month' | 'last_3_months' | 'last_year';
  tags: string[];
  sortBy: 'updated' | 'created' | 'title' | 'views';
  sortOrder: 'asc' | 'desc';
  status: 'all' | 'active' | 'draft' | 'archived';
}

interface FilterDrawerProps {
  isOpen: boolean;
  onToggle: () => void;
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableTags: string[];
  className?: string;
}

export const FilterDrawer: FC<FilterDrawerProps> = ({
  isOpen,
  onToggle,
  filters,
  onFiltersChange,
  availableTags,
  className = ''
}) => {
  const [selectedTags, setSelectedTags] = useState<string[]>(filters.tags);

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handleTagToggle = (tag: string) => {
    const newTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    
    setSelectedTags(newTags);
    handleFilterChange('tags', newTags);
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterOptions = {
      dateRange: 'all',
      tags: [],
      sortBy: 'updated',
      sortOrder: 'desc',
      status: 'all'
    };
    setSelectedTags([]);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = 
    filters.dateRange !== 'all' ||
    filters.tags.length > 0 ||
    filters.sortBy !== 'updated' ||
    filters.sortOrder !== 'desc' ||
    filters.status !== 'all';

  return (
    <div className={`w-full ${className}`}>
      {/* Filter Toggle Button */}
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={onToggle}
          className="h-12 px-4 relative"
        >
          <div className="flex items-center space-x-2">
            <span>Filter</span>
            {hasActiveFilters && (
              <div className="w-2 h-2 bg-primary rounded-full"></div>
            )}
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4" />
            </motion.div>
          </div>
        </Button>
      </div>

      {/* Drawer Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="w-full mt-4 bg-background/80 dark:bg-background/40 rounded-lg border shadow-inner overflow-hidden"
          >
            <div className="p-6 space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Filter Resumes</h3>
                <div className="flex items-center space-x-2">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearAllFilters}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Clear All
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onToggle}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Filter Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Date Range Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Date Range</span>
                  </label>
                  <Select
                    value={filters.dateRange}
                    onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  >
                    <option value="all">All Time</option>
                    <option value="last_week">Last Week</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_year">Last Year</option>
                  </Select>
                </div>

                {/* Status Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Eye className="h-4 w-4" />
                    <span>Status</span>
                  </label>
                  <Select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="all">All Resumes</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="archived">Archived</option>
                  </Select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Sort By</span>
                  </label>
                  <Select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="updated">Last Updated</option>
                    <option value="created">Date Created</option>
                    <option value="title">Title</option>
                    <option value="views">View Count</option>
                  </Select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Order</label>
                  <Select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                  >
                    <option value="desc">Newest First</option>
                    <option value="asc">Oldest First</option>
                  </Select>
                </div>
              </div>

              {/* Tags Filter */}
              {availableTags.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium flex items-center space-x-2">
                    <Tag className="h-4 w-4" />
                    <span>Tags</span>
                    {selectedTags.length > 0 && (
                      <span className="text-xs text-muted-foreground">
                        ({selectedTags.length} selected)
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                          selectedTags.includes(tag)
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {(() => {
                        const activeCount = [
                          filters.dateRange !== 'all',
                          filters.tags.length > 0,
                          filters.sortBy !== 'updated' || filters.sortOrder !== 'desc',
                          filters.status !== 'all'
                        ].filter(Boolean).length;
                        
                        return `${activeCount} filter${activeCount !== 1 ? 's' : ''} active`;
                      })()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onToggle}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};