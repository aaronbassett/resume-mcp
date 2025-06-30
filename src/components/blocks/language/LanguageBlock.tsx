/**
 * Natural Language Block Component
 * 
 * Handles spoken languages with fluency levels
 */

import React, { useState } from 'react';
import { Languages } from 'lucide-react';
import { NaturalLanguageBlockData, naturalLanguageBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface LanguageBlockProps {
  data: NaturalLanguageBlockData;
  onChange: (data: NaturalLanguageBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

const fluencyLevels = [
  { value: 'basic', label: 'Basic', description: 'Can communicate simple needs', color: 'bg-gray-200', width: 'w-1/4' },
  { value: 'conversational', label: 'Conversational', description: 'Can hold everyday conversations', color: 'bg-blue-200', width: 'w-2/4' },
  { value: 'proficient', label: 'Proficient', description: 'Can work professionally', color: 'bg-green-200', width: 'w-3/4' },
  { value: 'native', label: 'Native/Bilingual', description: 'Native or native-like fluency', color: 'bg-purple-200', width: 'w-full' },
];

export function LanguageBlock({ data, onChange, isEditing = false, className }: LanguageBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: NaturalLanguageBlockData) => {
    try {
      naturalLanguageBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof NaturalLanguageBlockData, value: string) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const getFluencyInfo = () => {
    return fluencyLevels.find(level => level.value === data.fluency) || fluencyLevels[1];
  };

  const hasContent = data.language && data.fluency;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty language in view mode
  }

  return (
    <div className={cn('language-block', className)}>
      <div className="space-y-4">
        {/* Language Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <Languages className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">{data.language}</h3>
                  <span className="text-sm font-medium text-gray-600">
                    {getFluencyInfo().label}
                  </span>
                </div>
                
                {/* Fluency Bar */}
                <div className="mt-2 space-y-1">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all duration-300",
                        getFluencyInfo().color,
                        getFluencyInfo().width
                      )}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    {getFluencyInfo().description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Language Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Language and Fluency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Language *
                </label>
                <input
                  type="text"
                  value={data.language}
                  onChange={(e) => handleChange('language', e.target.value)}
                  placeholder="Spanish"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Fluency Level *
                </label>
                <select
                  value={data.fluency}
                  onChange={(e) => handleChange('fluency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {fluencyLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Fluency Description */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Fluency Level Guide</h4>
              <div className="space-y-2">
                {fluencyLevels.map((level) => (
                  <div key={level.value} className="flex items-start space-x-3">
                    <div className={cn("w-16 h-2 rounded-full mt-1.5", level.color)} />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">{level.label}</p>
                      <p className="text-xs text-gray-500">{level.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Preview</h4>
              <div className="flex items-center justify-between">
                <span className="font-medium text-blue-900">{data.language || 'Language'}</span>
                <span className="text-sm text-blue-700">{getFluencyInfo().label}</span>
              </div>
              <div className="mt-2 w-full bg-blue-100 rounded-full h-2">
                <div
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    "bg-blue-400",
                    getFluencyInfo().width
                  )}
                />
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Only include languages relevant to your target role. 
                Be honest about fluency levels as they may be tested during interviews.
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