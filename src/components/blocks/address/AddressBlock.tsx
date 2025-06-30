/**
 * Address Block Component
 * 
 * Handles physical location or remote status
 */

import React, { useState } from 'react';
import { MapPin, Wifi } from 'lucide-react';
import { AddressBlockData, addressBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface AddressBlockProps {
  data: AddressBlockData;
  onChange: (data: AddressBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function AddressBlock({ data, onChange, isEditing = false, className }: AddressBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: AddressBlockData) => {
    try {
      addressBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof AddressBlockData, value: string | boolean) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const formatAddress = () => {
    if (data.isRemote) {
      return 'Remote';
    }

    const parts = [
      data.street,
      data.city,
      data.state,
      data.postalCode,
      data.country
    ].filter(Boolean);

    return parts.join(', ') || null;
  };

  const formattedAddress = formatAddress();
  const hasLocation = data.isRemote || formattedAddress;

  if (!isEditing && !hasLocation) {
    return null; // Don't render empty address in view mode
  }

  return (
    <div className={cn('address-block', className)}>
      <div className="space-y-4">
        {/* Address Display (View Mode) */}
        {!isEditing && hasLocation && (
          <div className="flex items-start space-x-3">
            {data.isRemote ? (
              <Wifi className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            ) : (
              <MapPin className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
            )}
            <div className="text-gray-700">
              {data.isRemote ? (
                <span className="font-medium text-blue-600">Remote</span>
              ) : (
                <div className="space-y-1">
                  {data.street && <div>{data.street}</div>}
                  <div>
                    {[data.city, data.state, data.postalCode].filter(Boolean).join(', ')}
                  </div>
                  {data.country && <div>{data.country}</div>}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Address Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Remote Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="remote-toggle"
                checked={data.isRemote || false}
                onChange={(e) => handleChange('isRemote', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="remote-toggle" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Wifi className="w-4 h-4" />
                <span>I work remotely</span>
              </label>
            </div>

            {/* Location Fields (only show if not remote) */}
            {!data.isRemote && (
              <div className="space-y-4 pl-7">
                {/* Street Address */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={data.street || ''}
                    onChange={(e) => handleChange('street', e.target.value)}
                    placeholder="123 Main Street, Apt 4B"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* City and State */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      value={data.city || ''}
                      onChange={(e) => handleChange('city', e.target.value)}
                      placeholder="San Francisco"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      State/Province
                    </label>
                    <input
                      type="text"
                      value={data.state || ''}
                      onChange={(e) => handleChange('state', e.target.value)}
                      placeholder="CA"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Postal Code and Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      value={data.postalCode || ''}
                      onChange={(e) => handleChange('postalCode', e.target.value)}
                      placeholder="94102"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Country
                    </label>
                    <input
                      type="text"
                      value={data.country || ''}
                      onChange={(e) => handleChange('country', e.target.value)}
                      placeholder="United States"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Privacy tip:</strong> You can be as specific or general as you want. 
                Many people just include city and state/country for privacy reasons.
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