/**
 * Skill Block Wrapper for block-party integration
 */

import React from 'react';
import { SkillBlock } from './skill';
import { BlockType } from '../../config/blockEditorConfig';
import { SkillBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface SkillBlockWrapperProps {
  data: SkillBlockData;
  onUpdate: (data: SkillBlockData) => void;
  isEditing?: boolean;
}

export function SkillBlockWrapper({ data, onUpdate, isEditing = false }: SkillBlockWrapperProps) {
  return (
    <SkillBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const skillBlockConfig: BlockConfig<SkillBlockData> = createBlockConfig(
  BlockType.SKILL,
  {
    displayName: 'Skills',
    component: SkillBlockWrapper,
    createDefault: () => defaultBlockData[BlockType.SKILL],
    category: 'skills',
    description: 'Technical and professional skills',
    icon: 'Zap',
    supportsMultiple: true,
  }
);