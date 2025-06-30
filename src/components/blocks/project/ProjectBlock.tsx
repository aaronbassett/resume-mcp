/**
 * Project Block Component
 * 
 * Handles personal or professional projects
 */

import React, { useState } from 'react';
import { Folder, Calendar, ExternalLink, Plus, X, Code } from 'lucide-react';
import { ProjectBlockData, projectBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface ProjectBlockProps {
  data: ProjectBlockData;
  onChange: (data: ProjectBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function ProjectBlock({ data, onChange, isEditing = false, className }: ProjectBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: ProjectBlockData) => {
    try {
      projectBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof ProjectBlockData, value: string | string[]) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const addItem = (field: 'technologies' | 'highlights') => {
    const newItems = [...data[field], ''];
    handleChange(field, newItems);
  };

  const updateItem = (field: 'technologies' | 'highlights', index: number, value: string) => {
    const updatedItems = data[field].map((item, i) => 
      i === index ? value : item
    );
    handleChange(field, updatedItems);
  };

  const removeItem = (field: 'technologies' | 'highlights', index: number) => {
    const updatedItems = data[field].filter((_, i) => i !== index);
    handleChange(field, updatedItems);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const formatDateRange = () => {
    const start = formatDate(data.startDate);
    const end = data.endDate ? formatDate(data.endDate) : 'Present';
    return start ? `${start} - ${end}` : '';
  };

  const hasContent = data.name && data.description;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty project in view mode
  }

  return (
    <div className={cn('project-block', className)}>
      <div className="space-y-4">
        {/* Project Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            {/* Header */}
            <div className="space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <Folder className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {data.name}
                      {data.url && (
                        <a
                          href={data.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-blue-600 hover:text-blue-800 inline-flex items-center"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </h3>
                  </div>
                </div>
                {data.startDate && (
                  <div className="text-sm text-gray-600 flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDateRange()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="text-gray-700 whitespace-pre-wrap">
              {data.description}
            </div>

            {/* Technologies */}
            {data.technologies.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Code className="w-4 h-4" />
                  <span>Technologies:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.technologies.filter(Boolean).map((tech, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlights */}
            {data.highlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Key Features:</h4>
                <ul className="list-disc pl-5 space-y-1">
                  {data.highlights.filter(Boolean).map((highlight, index) => (
                    <li key={index} className="text-gray-700">{highlight}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Project Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Project Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Project Name *
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="E-commerce Platform"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Project URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={data.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://github.com/username/project"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {data.url && (
                  <a
                    href={data.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
              <p className="text-xs text-gray-500">
                GitHub repository, live demo, or project page
              </p>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Start Date
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
                  value={data.endDate}
                  onChange={(e) => handleChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Leave blank if ongoing
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Description *
              </label>
              <textarea
                value={data.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Describe the project, its purpose, and your role..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
            </div>

            {/* Technologies */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Technologies Used
              </label>
              
              {data.technologies.map((tech, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <input
                    type="text"
                    value={tech}
                    onChange={(e) => updateItem('technologies', index, e.target.value)}
                    placeholder="React, Node.js, PostgreSQL"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeItem('technologies', index)}
                    type="button"
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addItem('technologies')}
                type="button"
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Technology</span>
              </button>
            </div>

            {/* Highlights */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Key Features/Achievements
              </label>
              
              {data.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <input
                    type="text"
                    value={highlight}
                    onChange={(e) => updateItem('highlights', index, e.target.value)}
                    placeholder="Implemented real-time data synchronization"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeItem('highlights', index)}
                    type="button"
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={() => addItem('highlights')}
                type="button"
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Feature/Achievement</span>
              </button>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Showcase projects that demonstrate your skills and initiative. 
                Include personal projects, open-source contributions, or significant work projects (with permission).
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