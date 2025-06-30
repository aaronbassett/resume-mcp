/**
 * Volunteer Block Wrapper for block-party integration
 */

import React from 'react';
import { VolunteerBlock } from './volunteer';
import { BlockType } from '../../config/blockEditorConfig';
import { VolunteerBlockData, defaultVolunteerBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface VolunteerBlockWrapperProps {
  data: VolunteerBlockData;
  onUpdate: (data: VolunteerBlockData) => void;
  isEditing?: boolean;
}

export function VolunteerBlockWrapper({ data, onUpdate, isEditing = false }: VolunteerBlockWrapperProps) {
  return (
    <VolunteerBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const volunteerBlockConfig: BlockConfig<VolunteerBlockData> = createBlockConfig(
  BlockType.VOLUNTEER,
  {
    displayName: 'Volunteer Experience',
    component: VolunteerBlockWrapper,
    defaultData: defaultVolunteerBlockData,
    category: 'professional',
    description: 'Community service and volunteer work',
    icon: 'Heart',
    supportsMultiple: true,
  }
);