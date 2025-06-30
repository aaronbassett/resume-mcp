import React from 'react';
import type { BlockRenderProps, BlockEditProps } from '@aaronbassett/block-party';
import type { ContactBlockData } from '../../types/blocks';
import { Mail, Phone, Globe } from 'lucide-react';

/**
 * View component for Contact block
 */
export const ContactBlockView: React.FC<BlockRenderProps<ContactBlockData>> = ({ block }) => {
  const { email, phone, website } = block.data;

  if (!email && !phone && !website) {
    return (
      <div className="text-gray-400 italic p-4 border border-dashed border-gray-300 rounded">
        Click to add contact information
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-4 p-4">
      {email && (
        <div className="flex items-center gap-2">
          <Mail className="w-4 h-4 text-gray-500" />
          <a href={`mailto:${email}`} className="text-blue-600 hover:underline">
            {email}
          </a>
        </div>
      )}
      {phone && (
        <div className="flex items-center gap-2">
          <Phone className="w-4 h-4 text-gray-500" />
          <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
            {phone}
          </a>
        </div>
      )}
      {website && (
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-500" />
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {website}
          </a>
        </div>
      )}
    </div>
  );
};

/**
 * Edit component for Contact block
 */
export const ContactBlockEdit: React.FC<BlockEditProps<ContactBlockData>> = ({
  block,
  onChange,
  onSave,
  onCancel,
}) => {
  const { email, phone, website } = block.data;

  const handleChange = (field: keyof ContactBlockData, value: string) => {
    onChange({
      ...block.data,
      [field]: value,
    });
  };

  return (
    <div className="p-4 space-y-4 bg-gray-50 rounded border border-gray-200">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email || ''}
          onChange={(e) => handleChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="john.doe@example.com"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone
        </label>
        <input
          id="phone"
          type="tel"
          value={phone || ''}
          onChange={(e) => handleChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+1 (555) 123-4567"
        />
      </div>

      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-1">
          Website
        </label>
        <input
          id="website"
          type="url"
          value={website || ''}
          onChange={(e) => handleChange('website', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="https://example.com"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </div>
  );
};