/**
 * Award Block Wrapper for block-party integration
 */

import React from 'react';
import { AwardBlock } from './award';
import { BlockType } from '../../config/blockEditorConfig';
import { AwardBlockData, defaultAwardBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface AwardBlockWrapperProps {
  data: AwardBlockData;
  onUpdate: (data: AwardBlockData) => void;
  isEditing?: boolean;
}

export function AwardBlockWrapper({ data, onUpdate, isEditing = false }: AwardBlockWrapperProps) {
  return (
    <AwardBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const awardBlockConfig: BlockConfig<AwardBlockData> = createBlockConfig(
  BlockType.AWARD,
  {
    displayName: 'Awards & Recognition',
    component: AwardBlockWrapper,
    defaultData: defaultAwardBlockData,
    category: 'achievements',
    description: 'Professional awards and honors',
    icon: 'Trophy',
    supportsMultiple: true,
  }
);