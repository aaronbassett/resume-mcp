/**
 * Award Block Component
 * 
 * Handles awards and recognitions
 */

import React, { useState } from 'react';
import { Trophy, Calendar } from 'lucide-react';
import { AwardBlockData, awardBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface AwardBlockProps {
  data: AwardBlockData;
  onChange: (data: AwardBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function AwardBlock({ data, onChange, isEditing = false, className }: AwardBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: AwardBlockData) => {
    try {
      awardBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof AwardBlockData, value: string) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const hasContent = data.title && data.awarder && data.date;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty award in view mode
  }

  return (
    <div className={cn('award-block', className)}>
      <div className="space-y-4">
        {/* Award Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Trophy className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{data.title}</h3>
                  <p className="text-gray-700">
                    Awarded by <span className="font-medium">{data.awarder}</span>
                  </p>
                </div>
              </div>
              <div className="text-sm text-gray-600 flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(data.date)}</span>
              </div>
            </div>

            {/* Description */}
            {data.description && (
              <div className="text-gray-700 pl-8">
                {data.description}
              </div>
            )}
          </div>
        )}

        {/* Award Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Award Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Award Title *
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Employee of the Year"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Awarder and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Awarded By *
                </label>
                <input
                  type="text"
                  value={data.awarder}
                  onChange={(e) => handleChange('awarder', e.target.value)}
                  placeholder="Company Name or Organization"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Date Received *
                </label>
                <input
                  type="month"
                  value={data.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Provide context about why you received this award and what it represents..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
              <p className="text-xs text-gray-500">
                Include selection criteria, competition level, or significance if relevant
              </p>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Include awards that demonstrate excellence in your field, 
                leadership, or unique achievements. Academic honors can go in the Education section.
              </p>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Please fix the following errors:
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc pl-5 space-y-1">
                    {errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}