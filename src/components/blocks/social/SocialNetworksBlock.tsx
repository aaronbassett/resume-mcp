/**
 * Social Networks Block Component
 * 
 * Handles multiple social media profiles and professional networks
 */

import React, { useState } from 'react';
import { Plus, X, ExternalLink, Github, Linkedin, Twitter, Facebook, Instagram, Youtube, Globe } from 'lucide-react';
import { SocialNetworksBlockData, socialNetworksBlockSchema, SocialNetwork } from '../../../types/blocks';
import { cn } from '../../../lib/utils';

interface SocialNetworksBlockProps {
  data: SocialNetworksBlockData;
  onChange: (data: SocialNetworksBlockData) => void;
  isEditing?: boolean;
  className?: string;
}

const platformOptions = [
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'github', label: 'GitHub', icon: Github },
  { value: 'twitter', label: 'Twitter/X', icon: Twitter },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'other', label: 'Other', icon: Globe },
];

export function SocialNetworksBlock({ data, onChange, isEditing = false, className }: SocialNetworksBlockProps) {
  const [errors, setErrors] = useState<string[]>([]);

  const validateData = (newData: SocialNetworksBlockData) => {
    try {
      socialNetworksBlockSchema.parse(newData);
      setErrors([]);
      return true;
    } catch (error: any) {
      const errorMessages = error.errors?.map((e: any) => e.message) || ['Invalid data'];
      setErrors(errorMessages);
      return false;
    }
  };

  const handleChange = (networks: SocialNetwork[]) => {
    const newData = { networks };
    validateData(newData);
    onChange(newData);
  };

  const addNetwork = () => {
    const newNetwork: SocialNetwork = {
      platform: 'linkedin',
      url: '',
      displayName: '',
    };
    handleChange([...data.networks, newNetwork]);
  };

  const updateNetwork = (index: number, field: keyof SocialNetwork, value: string) => {
    const updatedNetworks = data.networks.map((network, i) => 
      i === index ? { ...network, [field]: value } : network
    );
    handleChange(updatedNetworks);
  };

  const removeNetwork = (index: number) => {
    const updatedNetworks = data.networks.filter((_, i) => i !== index);
    handleChange(updatedNetworks);
  };

  const getPlatformIcon = (platform: string) => {
    const platformOption = platformOptions.find(option => option.value === platform);
    return platformOption?.icon || Globe;
  };

  const getPlatformLabel = (platform: string) => {
    const platformOption = platformOptions.find(option => option.value === platform);
    return platformOption?.label || platform;
  };

  const hasNetworks = data.networks.length > 0;

  if (!isEditing && !hasNetworks) {
    return null; // Don't render empty social networks in view mode
  }

  return (
    <div className={cn('social-networks-block', className)}>
      <div className="space-y-4">
        {/* Social Networks Display (View Mode) */}
        {!isEditing && hasNetworks && (
          <div className="space-y-3">
            {data.networks.map((network, index) => {
              const Icon = getPlatformIcon(network.platform);
              return (
                <div key={index} className="flex items-center space-x-3">
                  <Icon className="w-5 h-5 text-gray-600 flex-shrink-0" />
                  <a
                    href={network.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline flex items-center space-x-1"
                  >
                    <span>{network.displayName || getPlatformLabel(network.platform)}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Social Networks Form (Edit Mode) */}
        {isEditing && (
          <div className="space-y-4">
            {/* Network List */}
            {data.networks.map((network, index) => {
              const Icon = getPlatformIcon(network.platform);
              return (
                <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5 text-gray-600" />
                      <span className="font-medium text-gray-700">
                        {getPlatformLabel(network.platform)}
                      </span>
                    </div>
                    <button
                      onClick={() => removeNetwork(index)}
                      className="text-red-500 hover:text-red-700 p-1"
                      type="button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Platform Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Platform
                    </label>
                    <select
                      value={network.platform}
                      onChange={(e) => updateNetwork(index, 'platform', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {platformOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* URL Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Profile URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={network.url}
                        onChange={(e) => updateNetwork(index, 'url', e.target.value)}
                        placeholder="https://linkedin.com/in/yourprofile"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {network.url && (
                        <a
                          href={network.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Display Name Input */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Display Name (optional)
                    </label>
                    <input
                      type="text"
                      value={network.displayName || ''}
                      onChange={(e) => updateNetwork(index, 'displayName', e.target.value)}
                      placeholder="Custom display text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500">
                      Leave blank to use the platform name
                    </p>
                  </div>
                </div>
              );
            })}

            {/* Add Network Button */}
            <button
              onClick={addNetwork}
              type="button"
              className="w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-400 hover:text-blue-600 flex items-center justify-center space-x-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Add Social Network</span>
            </button>

            {/* Help Text */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-700">
                <strong>Tip:</strong> Include professional networks like LinkedIn and GitHub first. 
                Only add personal social media if it's relevant to your professional brand.
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