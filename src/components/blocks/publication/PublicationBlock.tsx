/**
 * Publication Block Component
 * 
 * Handles academic papers, articles, and other publications
 */

import React, { useState } from 'react';
import { BookOpen, Calendar, ExternalLink, Plus, X } from 'lucide-react';
import { PublicationBlockData, publicationBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface PublicationBlockProps {
  data: PublicationBlockData;
  onChange: (data: PublicationBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function PublicationBlock({ data, onChange, isEditing = false, className }: PublicationBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: PublicationBlockData) => {
    try {
      publicationBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof PublicationBlockData, value: string | string[]) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const addAuthor = () => {
    const newAuthors = [...data.authors, ''];
    handleChange('authors', newAuthors);
  };

  const updateAuthor = (index: number, value: string) => {
    const updatedAuthors = data.authors.map((author, i) => 
      i === index ? value : author
    );
    handleChange('authors', updatedAuthors);
  };

  const removeAuthor = (index: number) => {
    const updatedAuthors = data.authors.filter((_, i) => i !== index);
    handleChange('authors', updatedAuthors);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  const formatAuthors = () => {
    if (data.authors.length === 0) return '';
    if (data.authors.length === 1) return data.authors[0];
    if (data.authors.length === 2) return data.authors.join(' and ');
    return `${data.authors.slice(0, -1).join(', ')}, and ${data.authors[data.authors.length - 1]}`;
  };

  const hasContent = data.title && data.publisher && data.publicationDate;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty publication in view mode
  }

  return (
    <div className={cn('publication-block', className)}>
      <div className="space-y-4">
        {/* Publication Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start space-x-3">
              <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {data.title}
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
                
                {/* Authors */}
                {data.authors.length > 0 && (
                  <p className="text-gray-700 text-sm mt-1">
                    {formatAuthors()}
                  </p>
                )}
                
                {/* Publisher and Date */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                  <span className="font-medium">{data.publisher}</span>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(data.publicationDate)}</span>
                  </div>
                </div>
                
                {/* Description */}
                {data.description && (
                  <p className="text-gray-700 mt-2">
                    {data.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Publication Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Publication Title *
              </label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="Machine Learning in Healthcare: A Comprehensive Review"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Publisher and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Publisher/Journal *
                </label>
                <input
                  type="text"
                  value={data.publisher}
                  onChange={(e) => handleChange('publisher', e.target.value)}
                  placeholder="IEEE Transactions on Neural Networks"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Publication Date *
                </label>
                <input
                  type="month"
                  value={data.publicationDate}
                  onChange={(e) => handleChange('publicationDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Authors */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Authors
              </label>
              
              {data.authors.map((author, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => updateAuthor(index, e.target.value)}
                    placeholder="John Doe"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => removeAuthor(index)}
                    type="button"
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              <button
                onClick={addAuthor}
                type="button"
                className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Author</span>
              </button>
              
              <p className="text-xs text-gray-500">
                List authors in the order they appear in the publication
              </p>
            </div>

            {/* URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Publication URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={data.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://doi.org/10.1234/example"
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
                DOI, journal link, or preprint URL
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Abstract/Description
              </label>
              <textarea
                value={data.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Brief summary of the publication's content and key findings..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              />
              <p className="text-xs text-gray-500">
                A brief summary helps readers understand the relevance of your work
              </p>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Include peer-reviewed papers, conference proceedings, 
                book chapters, and significant technical articles. List yourself among the authors if applicable.
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