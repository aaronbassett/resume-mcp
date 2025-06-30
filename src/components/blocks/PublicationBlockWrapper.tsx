/**
 * Publication Block Wrapper for block-party integration
 */

import React from 'react';
import { PublicationBlock } from './publication';
import { BlockType } from '../../config/blockEditorConfig';
import { PublicationBlockData, defaultPublicationBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface PublicationBlockWrapperProps {
  data: PublicationBlockData;
  onUpdate: (data: PublicationBlockData) => void;
  isEditing?: boolean;
}

export function PublicationBlockWrapper({ data, onUpdate, isEditing = false }: PublicationBlockWrapperProps) {
  return (
    <PublicationBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const publicationBlockConfig: BlockConfig<PublicationBlockData> = createBlockConfig(
  BlockType.PUBLICATION,
  {
    displayName: 'Publications',
    component: PublicationBlockWrapper,
    defaultData: defaultPublicationBlockData,
    category: 'achievements',
    description: 'Academic papers and articles',
    icon: 'BookOpen',
    supportsMultiple: true,
  }
);