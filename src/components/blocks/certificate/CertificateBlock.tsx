/**
 * Certificate Block Component
 * 
 * Handles professional certifications and licenses
 */

import React, { useState } from 'react';
import { Award, Calendar, ExternalLink } from 'lucide-react';
import { CertificateBlockData, certificateBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface CertificateBlockProps {
  data: CertificateBlockData;
  onChange: (data: CertificateBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function CertificateBlock({ data, onChange, isEditing = false, className }: CertificateBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: CertificateBlockData) => {
    try {
      certificateBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (field: keyof CertificateBlockData, value: string) => {
    const newData = { ...data, [field]: value };
    validateData(newData);
    onChange(newData);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);
    return expiry <= threeMonthsFromNow && expiry >= new Date();
  };

  const hasExpired = (expiryDate: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const hasContent = data.name && data.authority && data.issuedAt;

  if (!isEditing && !hasContent) {
    return null; // Don't render empty certificate in view mode
  }

  return (
    <div className={cn('certificate-block', className)}>
      <div className="space-y-4">
        {/* Certificate Display (View Mode) */}
        {!isEditing && hasContent && (
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <Award className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
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
                  <p className="text-gray-700">
                    Issued by <span className="font-medium">{data.authority}</span>
                  </p>
                  {data.licenseNumber && (
                    <p className="text-sm text-gray-600">
                      License #: {data.licenseNumber}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Issued: {formatDate(data.issuedAt)}</span>
                </div>
                {data.expiresAt && (
                  <div className={cn(
                    "flex items-center space-x-1 mt-1",
                    hasExpired(data.expiresAt) && "text-red-600",
                    isExpiringSoon(data.expiresAt) && !hasExpired(data.expiresAt) && "text-yellow-600"
                  )}>
                    <Calendar className="w-4 h-4" />
                    <span>
                      {hasExpired(data.expiresAt) ? 'Expired' : 'Expires'}: {formatDate(data.expiresAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Certificate Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Certificate Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Certificate Name *
              </label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="AWS Certified Solutions Architect"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Issuing Authority and License Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Issuing Authority *
                </label>
                <input
                  type="text"
                  value={data.authority}
                  onChange={(e) => handleChange('authority', e.target.value)}
                  placeholder="Amazon Web Services"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  License/Credential Number
                </label>
                <input
                  type="text"
                  value={data.licenseNumber}
                  onChange={(e) => handleChange('licenseNumber', e.target.value)}
                  placeholder="ABC123DEF456"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Issue and Expiry Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Issue Date *
                </label>
                <input
                  type="month"
                  value={data.issuedAt}
                  onChange={(e) => handleChange('issuedAt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Expiry Date
                </label>
                <input
                  type="month"
                  value={data.expiresAt}
                  onChange={(e) => handleChange('expiresAt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Leave blank if the certificate doesn't expire
                </p>
              </div>
            </div>

            {/* Verification URL */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Verification URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={data.url}
                  onChange={(e) => handleChange('url', e.target.value)}
                  placeholder="https://verify.certauthority.com/ABC123"
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
                Link to verify the certificate's authenticity
              </p>
            </div>

            {/* Expiry Warning */}
            {data.expiresAt && (hasExpired(data.expiresAt) || isExpiringSoon(data.expiresAt)) && (
              <div className={cn(
                "border rounded-lg p-3",
                hasExpired(data.expiresAt) 
                  ? "bg-red-50 border-red-200" 
                  : "bg-yellow-50 border-yellow-200"
              )}>
                <p className={cn(
                  "text-sm",
                  hasExpired(data.expiresAt) ? "text-red-700" : "text-yellow-700"
                )}>
                  <strong>Warning:</strong> This certificate {hasExpired(data.expiresAt) ? 'has expired' : 'expires soon'}. 
                  Consider renewing it to keep your credentials current.
                </p>
              </div>
            )}

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Include industry-recognized certifications relevant to your field. 
                Keep track of expiry dates to maintain valid credentials.
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