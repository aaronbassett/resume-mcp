/**
 * Contact Block Wrapper for block-party integration
 */

import React from 'react';
import { ContactBlock } from './contact';
import { BlockType } from '../../config/blockEditorConfig';
import { ContactBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface ContactBlockWrapperProps {
  data: ContactBlockData;
  onUpdate: (data: ContactBlockData) => void;
  isEditing?: boolean;
}

export function ContactBlockWrapper({ data, onUpdate, isEditing = false }: ContactBlockWrapperProps) {
  return (
    <ContactBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const contactBlockConfig: BlockConfig<ContactBlockData> = createBlockConfig(
  BlockType.CONTACT,
  {
    displayName: 'Contact Information',
    component: ContactBlockWrapper,
    createDefault: () => defaultBlockData[BlockType.CONTACT],
    category: 'personal',
    description: 'Email, phone, and website contact information',
    icon: 'Mail',
    supportsMultiple: false,
  }
);