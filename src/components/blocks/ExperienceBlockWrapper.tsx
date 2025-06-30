/**
 * Experience Block Wrapper for block-party integration
 */

import React from 'react';
import { ExperienceBlock } from './experience';
import { BlockType } from '../../config/blockEditorConfig';
import { ExperienceBlockData, defaultExperienceBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface ExperienceBlockWrapperProps {
  data: ExperienceBlockData;
  onUpdate: (data: ExperienceBlockData) => void;
  isEditing?: boolean;
}

export function ExperienceBlockWrapper({ data, onUpdate, isEditing = false }: ExperienceBlockWrapperProps) {
  return (
    <ExperienceBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const experienceBlockConfig: BlockConfig<ExperienceBlockData> = createBlockConfig(
  BlockType.EXPERIENCE,
  {
    displayName: 'Work Experience',
    component: ExperienceBlockWrapper,
    defaultData: defaultExperienceBlockData,
    category: 'professional',
    description: 'Employment history and achievements',
    icon: 'Briefcase',
    supportsMultiple: true,
  }
);