/**
 * Skill Block Component
 * 
 * Handles technical and professional skills with proficiency levels
 */

import React, { useState } from 'react';
import { Zap } from 'lucide-react';
import { SkillBlockData, skillBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface SkillBlockProps {
  data: SkillBlockData;
  onChange: (data: SkillBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

const proficiencyLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-gray-200', width: 'w-1/4' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-blue-200', width: 'w-2/4' },
  { value: 'advanced', label: 'Advanced', color: 'bg-green-200', width: 'w-3/4' },
  { value: 'expert', label: 'Expert', color: 'bg-purple-200', width: 'w-full' },
];

export function SkillBlock({ data, onChange, isEditing = false, className }: SkillBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: SkillBlockData) => {
    try {
      skillBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof SkillBlockData, value: string | number) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const getProficiencyInfo = () => {
    return proficiencyLevels.find(level => level.value === data.proficiency) || proficiencyLevels[1];
  };

  const hasContent = data.name && data.category;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty skill in view mode
  }

  return (
    <div className={cn('skill-block', className)}>
      <div className="space-y-4">
        {/* Skill Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Zap className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-3">
                    <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
                    <span className="text-sm text-gray-500 px-2 py-1 bg-gray-100 rounded">
                      {data.category}
                    </span>
                  </div>
                  
                  {/* Proficiency Bar */}
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {getProficiencyInfo().label}
                      </span>
                      {data.yearsOfExperience > 0 && (
                        <span className="text-gray-500">
                          {data.yearsOfExperience} year{data.yearsOfExperience !== 1 ? 's' : ''} experience
                        </span>
                      )}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={cn(
                          "h-2 rounded-full transition-all duration-300",
                          getProficiencyInfo().color,
                          getProficiencyInfo().width
                        )}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skill Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Skill Name and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Skill Name *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="JavaScript"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Category *
                </label>
                <input
                  type="text"
                  value={data.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  placeholder="Programming Languages"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  e.g., Programming Languages, Frameworks, Tools, Soft Skills
                </p>
              </div>
            </div>

            {/* Proficiency and Experience */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Proficiency Level
                </label>
                <select
                  value={data.proficiency}
                  onChange={(e) => handleChange('proficiency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {proficiencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Years of Experience
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  step="0.5"
                  value={data.yearsOfExperience || 0}
                  onChange={(e) => handleChange('yearsOfExperience', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Proficiency Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Preview</h4>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{data.name || 'Skill Name'}</span>
                  <span className="text-gray-600">{getProficiencyInfo().label}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      getProficiencyInfo().color,
                      getProficiencyInfo().width
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Be honest about your proficiency levels. 
                Group similar skills by category for better organization.
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