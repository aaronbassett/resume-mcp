/**
 * Address Block Wrapper for block-party integration
 */

import React from 'react';
import { AddressBlock } from './address';
import { BlockType } from '../../config/blockEditorConfig';
import { AddressBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface AddressBlockWrapperProps {
  data: AddressBlockData;
  onUpdate: (data: AddressBlockData) => void;
  isEditing?: boolean;
}

export function AddressBlockWrapper({ data, onUpdate, isEditing = false }: AddressBlockWrapperProps) {
  return (
    <AddressBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const addressBlockConfig: BlockConfig<AddressBlockData> = createBlockConfig(
  BlockType.ADDRESS,
  {
    displayName: 'Address & Location',
    component: AddressBlockWrapper,
    defaultData: defaultBlockData[BlockType.ADDRESS],
    category: 'personal',
    description: 'Physical location or remote work status',
    icon: 'MapPin',
    supportsMultiple: false,
  }
);