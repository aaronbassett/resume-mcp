/**
 * Reference Block Wrapper for block-party integration
 */

import React from 'react';
import { ReferenceBlock } from './reference';
import { BlockType } from '../../config/blockEditorConfig';
import { ReferenceBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface ReferenceBlockWrapperProps {
  data: ReferenceBlockData;
  onUpdate: (data: ReferenceBlockData) => void;
  isEditing?: boolean;
}

export function ReferenceBlockWrapper({ data, onUpdate, isEditing = false }: ReferenceBlockWrapperProps) {
  return (
    <ReferenceBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const referenceBlockConfig: BlockConfig<ReferenceBlockData> = createBlockConfig(
  BlockType.REFERENCE,
  {
    displayName: 'References',
    component: ReferenceBlockWrapper,
    defaultData: defaultBlockData[BlockType.REFERENCE],
    category: 'personal',
    description: 'Professional references',
    icon: 'UserCheck',
    supportsMultiple: true,
  }
);