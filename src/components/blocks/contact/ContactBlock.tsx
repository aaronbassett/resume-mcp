/**
 * Contact Block Component
 * 
 * Handles email, phone, and website contact information
 */

import React, { useState } from 'react';
import { Mail, Phone, Globe, ExternalLink } from 'lucide-react';
import { ContactBlockData, contactBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface ContactBlockProps {
  data: ContactBlockData;
  onChange: (data: ContactBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function ContactBlock({ data, onChange, isEditing = false, className }: ContactBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: ContactBlockData) => {
    try {
      contactBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof ContactBlockData, value: string) => {
    const newData = { ...data, [field]: value || undefined };
    validateData(newData);
    onChange(newData);
  };

  const hasAnyContact = data.email || data.phone || data.website;

  if (!isEditing && !hasAnyContact) {
    return null; // Don't render empty contact in view mode
  }

  return (
    <div className={cn('contact-block', className)}>
      <div className="space-y-4">
        {/* Contact Display (View Mode) */}
        {!isEditing && hasAnyContact && (
          <div className="space-y-3">
            {data.email && (
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <a
                  href={`mailto:${data.email}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {data.email}
                </a>
              </div>
            )}
            
            {data.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <a
                  href={`tel:${data.phone}`}
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  {data.phone}
                </a>
              </div>
            )}
            
            {data.website && (
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-gray-600 flex-shrink-0" />
                <a
                  href={data.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                >
                  <span>{data.website}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>
        )}

        {/* Contact Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Email Input */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </label>
              <input
                type="email"
                value={data.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="your.email@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Phone Input */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Phone className="w-4 h-4" />
                <span>Phone</span>
              </label>
              <input
                type="tel"
                value={data.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+1 (555) 123-4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Website Input */}
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Globe className="w-4 h-4" />
                <span>Website</span>
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={data.website || ''}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://www.yourwebsite.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {data.website && (
                  <a
                    href={data.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Note:</strong> At least one contact method is required. 
                All fields are optional, but having multiple ways to contact you increases opportunities.
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