/**
 * Education Block Wrapper for block-party integration
 */

import React from 'react';
import { EducationBlock } from './education';
import { BlockType } from '../../config/blockEditorConfig';
import { EducationBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface EducationBlockWrapperProps {
  data: EducationBlockData;
  onUpdate: (data: EducationBlockData) => void;
  isEditing?: boolean;
}

export function EducationBlockWrapper({ data, onUpdate, isEditing = false }: EducationBlockWrapperProps) {
  return (
    <EducationBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const educationBlockConfig: BlockConfig<EducationBlockData> = createBlockConfig(
  BlockType.EDUCATION,
  {
    displayName: 'Education',
    component: EducationBlockWrapper,
    createDefault: () => defaultBlockData[BlockType.EDUCATION],
    category: 'professional',
    description: 'Academic degrees and coursework',
    icon: 'GraduationCap',
    supportsMultiple: true,
  }
);