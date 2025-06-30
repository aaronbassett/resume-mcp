/**
 * Education Block Component
 * 
 * Handles educational background including degrees, GPA, and coursework
 */

import React, { useState } from 'react';
import { GraduationCap, MapPin, Calendar, Plus, X } from 'lucide-react';
import { EducationBlockData, educationBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface EducationBlockProps {
  data: EducationBlockData;
  onChange: (data: EducationBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function EducationBlock({ data, onChange, isEditing = false, className }: EducationBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: EducationBlockData) => {
    try {
      educationBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof EducationBlockData, value: string | string[]) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const addItem = (field: 'honors' | 'coursework') => {
    const newItems = [...data[field], ''];
    handleChange(field, newItems);
  };

  const updateItem = (field: 'honors' | 'coursework', index: number, value: string) => {
    const updatedItems = data[field].map((item, i) => 
      i === index ? value : item
    );
    handleChange(field, updatedItems);
  };

  const removeItem = (field: 'honors' | 'coursework', index: number) => {
    const updatedItems = data[field].filter((_, i) => i !== index);
    handleChange(field, updatedItems);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const hasContent = data.institution && data.degree && data.graduationDate;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty education in view mode
  }

  return (
    <div className={cn('education-block', className)}>
      <div className="space-y-4">
        {/* Education Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {data.degree} {data.field && `in ${data.field}`}
                  </h3>
                  <div className="flex items-center space-x-2 text-gray-700">
                    <GraduationCap className="w-4 h-4" />
                    <span className="font-medium">{data.institution}</span>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(data.graduationDate)}</span>
                  </div>
                  {data.location && (
                    <div className="flex items-center space-x-1 mt-1">
                      <MapPin className="w-4 h-4" />
                      <span>{data.location}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* GPA */}
              {data.gpa && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">GPA:</span> {data.gpa}
                </div>
              )}
            </div>

            {/* Honors */}
            {data.honors.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Honors & Awards:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {data.honors.filter(Boolean).map((honor, index) => (
                    <li key={index} className="text-gray-700">{honor}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Coursework */}
            {data.coursework.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Relevant Coursework:</h4>
                <div className="flex flex-wrap gap-2">
                  {data.coursework.filter(Boolean).map((course, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {course}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Education Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Institution and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Institution *
                </label>
                <input
                  type="text"
                  value={data.institution}
                  onChange={(e) => handleChange('institution', e.target.value)}
                  placeholder="University of California, Berkeley"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Location
                </label>
                <input
                  type="text"
                  value={data.location}
                  onChange={(e) => handleChange('location', e.target.value)}
                  placeholder="Berkeley, CA"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Degree and Field */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Degree *
                </label>
                <input
                  type="text"
                  value={data.degree}
                  onChange={(e) => handleChange('degree', e.target.value)}
                  placeholder="Bachelor of Science"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Field of Study
                </label>
                <input
                  type="text"
                  value={data.field}
                  onChange={(e) => handleChange('field', e.target.value)}
                  placeholder="Computer Science"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Graduation Date and GPA */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Graduation Date *
                </label>
                <input
                  type="month"
                  value={data.graduationDate}
                  onChange={(e) => handleChange('graduationDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  GPA
                </label>
                <input
                  type="text"
                  value={data.gpa}
                  onChange={(e) => handleChange('gpa', e.target.value)}
                  placeholder="3.8/4.0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Honors */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Honors & Awards
              </label>
              
              {data.honors.map((honor, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <input
                    type="text"
                    value={honor}
                    onChange={(e) => updateItem('honors', index, e.target.value)}
                    placeholder="Dean's List, Magna Cum Laude"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeItem('honors', index)}
                    type="button"
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addItem('honors')}
                type="button"
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Honor/Award</span>
              </button>
            </div>

            {/* Coursework */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Relevant Coursework
              </label>
              
              {data.coursework.map((course, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => updateItem('coursework', index, e.target.value)}
                    placeholder="Data Structures, Machine Learning"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeItem('coursework', index)}
                    type="button"
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addItem('coursework')}
                type="button"
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Course</span>
              </button>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Include your GPA if it's 3.5 or higher. 
                List relevant coursework that demonstrates skills related to your target role.
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