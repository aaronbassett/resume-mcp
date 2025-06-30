/**
 * Avatar Block Component
 * 
 * Handles profile image upload/URL with preview and validation
 */

import React, { useState, useRef } from 'react';
import { Upload, User, X, ExternalLink } from 'lucide-react';
import { AvatarBlockData, avatarBlockSchema } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface AvatarBlockProps {
  data: AvatarBlockData;
  onChange: (data: AvatarBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

export function AvatarBlock({ data, onChange, isEditing = false, className }: AvatarBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateData = (newData: AvatarBlockData) => {
    try {
      avatarBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleImageUrlChange = (url: string) => {
    const newData = { ...data, imageUrl: url };
    validateData(newData);
    onChange(newData);
    setImageError(false);
  };

  const handleAltTextChange = (altText: string) => {
    const newData = { ...data, altText };
    validateData(newData);
    onChange(newData);
  };

  const handleFileUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrors(['Please select a valid image file']);
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(['Image size must be less than 5MB']);
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      // Create a local URL for preview
      const localUrl = URL.createObjectURL(file);
      handleImageUrlChange(localUrl);
      
      // TODO: Implement actual file upload to storage service
      // For now, we'll just use the local URL
      console.log('File upload would happen here:', file.name);
      
    } catch (error) {
      setErrors(['Failed to process image']);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const clearImage = () => {
    handleImageUrlChange('');
    setImageError(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleImageError = () => {
    setImageError(true);
    setErrors(['Failed to load image. Please check the URL or try a different image.']);
  };

  const handleImageLoad = () => {
    setImageError(false);
    setErrors([]);
  };

  if (!isEditing && !data.imageUrl) {
    return null; // Don't render empty avatar in view mode
  }

  return (
    <div className={cn('avatar-block', className)}>
      <div className="space-y-4">
        {/* Avatar Display */}
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            {data.imageUrl && !imageError ? (
              <div className="relative group">
                <img
                  src={data.imageUrl}
                  alt={data.altText || 'Profile picture'}
                  className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
                {isEditing && (
                  <button
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="w-32 h-32 rounded-full bg-gray-100 border-4 border-gray-200 flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* Upload Controls (Edit Mode) */}
          {isEditing && (
            <div className="flex flex-col items-center space-y-3 w-full max-w-md">
              {/* File Upload */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <div className="flex space-x-2">
                <button
                  onClick={openFileDialog}
                  disabled={isUploading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {isUploading ? 'Uploading...' : 'Upload Image'}
                </button>
              </div>

              {/* URL Input */}
              <div className="w-full space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Or enter image URL
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={data.imageUrl || ''}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {data.imageUrl && (
                    <a
                      href={data.imageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Alt Text Input */}
              <div className="w-full space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Alt text (optional)
                </label>
                <input
                  type="text"
                  value={data.altText || ''}
                  onChange={(e) => handleAltTextChange(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500">
                  Helps screen readers understand your image
                </p>
              </div>
            </div>
          )}
        </div>

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

        {/* Usage Tips (Edit Mode) */}
        {isEditing && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Tips:</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Use a square image for best results</li>
              <li>• Recommended size: 400x400 pixels or larger</li>
              <li>• Supported formats: JPG, PNG, GIF, WebP</li>
              <li>• Maximum file size: 5MB</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}