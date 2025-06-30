/**
 * Reference Block Component
 * 
 * Handles professional references
 */

import React, { useState } from 'react';
import { UserCheck, Mail, Phone, Building } from 'lucide-react';
import { ReferenceBlockData, referenceBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface ReferenceBlockProps {
  data: ReferenceBlockData;
  onChange: (data: ReferenceBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function ReferenceBlock({ data, onChange, isEditing = false, className }: ReferenceBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [showContactInfo, setShowContactInfo] = useState(false);

  const validateData = (newData: ReferenceBlockData) => {
    try {
      referenceBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof ReferenceBlockData, value: string) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const hasContent = data.name && data.title && data.company;
  const hasContactInfo = data.email || data.phone;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty reference in view mode
  }

  return (
    <div className={cn('reference-block', className)}>
      <div className="space-y-4">
        {/* Reference Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <UserCheck className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{data.name}</h3>
                <div className="text-gray-700">
                  <p className="font-medium">{data.title}</p>
                  <div className="flex items-center space-x-1 text-sm">
                    <Building className="w-4 h-4" />
                    <span>{data.company}</span>
                  </div>
                </div>
                
                {data.relationship && (
                  <p className="text-sm text-gray-600 mt-1 italic">
                    {data.relationship}
                  </p>
                )}

                {/* Contact Information */}
                {hasContactInfo && (
                  <div className="mt-3">
                    {showContactInfo ? (
                      <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                        {data.email && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <a
                              href={`mailto:${data.email}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {data.email}
                            </a>
                          </div>
                        )}
                        {data.phone && (
                          <div className="flex items-center space-x-2 text-sm">
                            <Phone className="w-4 h-4 text-gray-500" />
                            <a
                              href={`tel:${data.phone}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {data.phone}
                            </a>
                          </div>
                        )}
                        <button
                          onClick={() => setShowContactInfo(false)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Hide contact info
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowContactInfo(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        Show contact information
                      </button>
                    )}
                  </div>
                )}

                {!hasContactInfo && (
                  <p className="text-sm text-gray-500 mt-2 italic">
                    References available upon request
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Reference Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Name and Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Reference Name *
                </label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Jane Smith"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="Engineering Manager"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Company and Relationship */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Company *
                </label>
                <input
                  type="text"
                  value={data.company}
                  onChange={(e) => handleChange('company', e.target.value)}
                  placeholder="Tech Corp"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Relationship
                </label>
                <input
                  type="text"
                  value={data.relationship}
                  onChange={(e) => handleChange('relationship', e.target.value)}
                  placeholder="Direct supervisor for 2 years"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700">Contact Information (Optional)</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={data.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="jane.smith@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={data.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-500">
                Leave contact info blank if you prefer "References available upon request"
              </p>
            </div>

            {/* Privacy Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                <strong>Privacy Note:</strong> Always get permission before listing someone as a reference. 
                Consider whether to include contact information directly on your resume or provide it separately.
              </p>
            </div>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Choose references who can speak positively about your work. 
                Former supervisors, colleagues, or clients work best. Notify them when you're job searching.
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