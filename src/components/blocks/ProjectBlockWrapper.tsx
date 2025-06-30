/**
 * Project Block Wrapper for block-party integration
 */

import React from 'react';
import { ProjectBlock } from './project';
import { BlockType } from '../../config/blockEditorConfig';
import { ProjectBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface ProjectBlockWrapperProps {
  data: ProjectBlockData;
  onUpdate: (data: ProjectBlockData) => void;
  isEditing?: boolean;
}

export function ProjectBlockWrapper({ data, onUpdate, isEditing = false }: ProjectBlockWrapperProps) {
  return (
    <ProjectBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const projectBlockConfig: BlockConfig<ProjectBlockData> = createBlockConfig(
  BlockType.PROJECT,
  {
    displayName: 'Projects',
    component: ProjectBlockWrapper,
    createDefault: () => defaultBlockData[BlockType.PROJECT],
    category: 'professional',
    description: 'Personal or professional projects',
    icon: 'Folder',
    supportsMultiple: true,
  }
);