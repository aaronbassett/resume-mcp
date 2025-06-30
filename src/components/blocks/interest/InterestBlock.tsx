/**
 * Interest Block Component
 * 
 * Handles personal interests and hobbies
 */

import React, { useState } from 'react';
import { Sparkles, Plus, X } from 'lucide-react';
import { InterestBlockData, interestBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface InterestBlockProps {
  data: InterestBlockData;
  onChange: (data: InterestBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function InterestBlock({ data, onChange, isEditing = false, className }: InterestBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [newInterest, setNewInterest] = useState('');

  const validateData = (newData: InterestBlockData) => {
    try {
      interestBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (interests: string[]) => {
    const newData = { interests };
    validateData(newData);
    onChange(newData);
  };

  const addInterest = () => {
    if (newInterest.trim() && !data.interests.includes(newInterest.trim())) {
      handleChange([...data.interests, newInterest.trim()]);
      setNewInterest('');
    }
  };

  const removeInterest = (index: number) => {
    const updatedInterests = data.interests.filter((_, i) => i !== index);
    handleChange(updatedInterests);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  const hasContent = data.interests.length > 0;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty interests in view mode
  }

  return (
    <div className={cn('interest-block', className)}>
      <div className="space-y-4">
        {/* Interests Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Interests</h3>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {data.interests.map((interest, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-gradient-to-r from-pink-50 to-purple-50 text-gray-700 rounded-full text-sm border border-pink-200"
                >
                  {interest}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Interests Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-5 h-5 text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-900">Interests & Hobbies</h3>
            </div>

            {/* Current Interests */}
            {data.interests.length > 0 && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Current Interests
                </label>
                <div className="flex flex-wrap gap-2">
                  {data.interests.map((interest, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-pink-50 to-purple-50 text-gray-700 rounded-full text-sm border border-pink-200"
                    >
                      {interest}
                      <button
                        onClick={() => removeInterest(index)}
                        type="button"
                        className="ml-2 text-pink-500 hover:text-pink-700"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Add New Interest */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Add Interest
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Photography, Hiking, Open Source..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  onClick={addInterest}
                  type="button"
                  disabled={!newInterest.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add</span>
                </button>
              </div>
              <p className="text-xs text-gray-500">
                Press Enter or click Add to add an interest
              </p>
            </div>

            {/* Suggestions */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-purple-900 mb-2">Interest Ideas</h4>
              <div className="text-sm text-purple-700 space-y-1">
                <p><strong>Professional:</strong> Open Source Contributing, Tech Blogging, Hackathons, Public Speaking</p>
                <p><strong>Creative:</strong> Photography, Writing, Music, Art, Design</p>
                <p><strong>Active:</strong> Hiking, Running, Yoga, Rock Climbing, Cycling</p>
                <p><strong>Social:</strong> Volunteering, Mentoring, Community Building</p>
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Include 3-6 interests that show personality and can be conversation starters. 
                Choose interests that align with company culture when possible.
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