/**
 * Interest Block Wrapper for block-party integration
 */

import React from 'react';
import { InterestBlock } from './interest';
import { BlockType } from '../../config/blockEditorConfig';
import { InterestBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface InterestBlockWrapperProps {
  data: InterestBlockData;
  onUpdate: (data: InterestBlockData) => void;
  isEditing?: boolean;
}

export function InterestBlockWrapper({ data, onUpdate, isEditing = false }: InterestBlockWrapperProps) {
  return (
    <InterestBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const interestBlockConfig: BlockConfig<InterestBlockData> = createBlockConfig(
  BlockType.INTEREST,
  {
    displayName: 'Interests',
    component: InterestBlockWrapper,
    createDefault: () => defaultBlockData[BlockType.INTEREST],
    category: 'personal',
    description: 'Personal interests and hobbies',
    icon: 'Sparkles',
    supportsMultiple: false,
  }
);