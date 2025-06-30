/**
 * Experience Block Component
 * 
 * Handles work experience including current positions
 */

import React, { useState } from 'react';
import { Building, MapPin, Calendar, Plus, X } from 'lucide-react';
import { ExperienceBlockData, experienceBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface ExperienceBlockProps {
  data: ExperienceBlockData;
  onChange: (data: ExperienceBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function ExperienceBlock({ data, onChange, isEditing = false, className }: ExperienceBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: ExperienceBlockData) => {
    try {
      experienceBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof ExperienceBlockData, value: string | boolean | string[]) => {
    const newData = { ...data, [field]: value };
    
    // If setting current to true, clear end date
    if (field === 'current' && value === true) {
      newData.endDate = '';
    }
    
    validateData(newData);
    onChange(newData);
  };

  const addHighlight = () => {
    const newHighlights = [...data.highlights, ''];
    handleChange('highlights', newHighlights);
  };

  const updateHighlight = (index: number, value: string) => {
    const updatedHighlights = data.highlights.map((highlight, i) => 
      i === index ? value : highlight
    );
    handleChange('highlights', updatedHighlights);
  };

  const removeHighlight = (index: number) => {
    const updatedHighlights = data.highlights.filter((_, i) => i !== index);
    handleChange('highlights', updatedHighlights);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatDateRange = () => {
    const start = formatDate(data.startDate);
    const end = data.current ? 'Present' : formatDate(data.endDate);
    return `${start} - ${end}`;
  };

  const hasContent = data.company && data.position && data.startDate;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty experience in view mode
  }

  return (
    <div className={cn('experience-block', className)}>
      <div className="space-y-4">
        {/* Experience Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{data.position}</h3>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <Building className="w-4 h-4" />
                    <span className="font-medium">{data.company}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateRange()}</span>
                  </div>
                  {data.location && (
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{data.location}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {data.description && (
              <div className="text-gray-700 whitespace-pre-wrap">
                {data.description}
              </div>
            )}

            {/* Highlights */}
            {data.highlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Key Achievements:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {data.highlights.filter(Boolean).map((highlight, index) => (
                    <li key={index} className="text-gray-700">{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Experience Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Position and Company */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Position *
                </label>
                <input
                  type="text"
                  value={data.position}
                  onChange={(e) => handleChange('position', e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company *
                </label>
                <input
                  type="text"
                  value={data.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Company Name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                value={data.location}
                onChange={(e) => handleChange('location', e.target.value)}
                placeholder="San Francisco, CA"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date *
                </label>
                <input
                  type="month"
                  value={data.startDate}
                  onChange={(e) => handleChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <input
                  type="month"
                  value={data.current ? '' : data.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  disabled={data.current}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Current Position Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="current-position"
                checked={data.current}
                onChange={(e) => handleChange('current', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="current-position" className="text-sm font-medium text-gray-700">
                I currently work here
              </label>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe your role, responsibilities, and what you accomplished..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Key Achievements
              </label>
              
              {data.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => updateHighlight(index, e.target.value)}
                    placeholder="Increased sales by 25% through improved customer engagement"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeHighlight(index)}
                    type="button"
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={addHighlight}
                type="button"
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Achievement</span>
              </button>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Pro tip:</strong> Focus on quantifiable achievements and impact. 
                Use action verbs and specific numbers when possible (e.g., "Increased sales by 25%" rather than "Helped with sales").
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