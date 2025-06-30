/**
 * Language Block Wrapper for block-party integration
 */

import React from 'react';
import { LanguageBlock } from './language';
import { BlockType } from '../../config/blockEditorConfig';
import { NaturalLanguageBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface LanguageBlockWrapperProps {
  data: NaturalLanguageBlockData;
  onUpdate: (data: NaturalLanguageBlockData) => void;
  isEditing?: boolean;
}

export function LanguageBlockWrapper({ data, onUpdate, isEditing = false }: LanguageBlockWrapperProps) {
  return (
    <LanguageBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const languageBlockConfig: BlockConfig<NaturalLanguageBlockData> = createBlockConfig(
  BlockType.NATURAL_LANGUAGE,
  {
    displayName: 'Languages',
    component: LanguageBlockWrapper,
    defaultData: defaultBlockData[BlockType.NATURAL_LANGUAGE],
    category: 'skills',
    description: 'Spoken and written languages',
    icon: 'Languages',
    supportsMultiple: true,
  }
);