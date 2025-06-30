/**
 * Social Networks Block Wrapper for block-party integration
 */

import React from 'react';
import { SocialNetworksBlock } from './social';
import { BlockType } from '../../config/blockEditorConfig';
import { SocialNetworksBlockData, defaultBlockData } from '../../types/blocks';
import { createBlockConfig } from '../../blocks/registry';
import type { BlockConfig } from '@aaronbassett/block-party';

interface SocialNetworksBlockWrapperProps {
  data: SocialNetworksBlockData;
  onUpdate: (data: SocialNetworksBlockData) => void;
  isEditing?: boolean;
}

export function SocialNetworksBlockWrapper({ data, onUpdate, isEditing = false }: SocialNetworksBlockWrapperProps) {
  return (
    <SocialNetworksBlock
      data={data}
      onChange={onUpdate}
      isEditing={isEditing}
    />
  );
}

export const socialNetworksBlockConfig: BlockConfig<SocialNetworksBlockData> = createBlockConfig(
  BlockType.SOCIAL_NETWORKS,
  {
    displayName: 'Social Networks',
    component: SocialNetworksBlockWrapper,
    createDefault: () => defaultBlockData[BlockType.SOCIAL_NETWORKS],
    category: 'personal',
    description: 'Professional and social media profiles',
    icon: 'Users',
    supportsMultiple: false,
  }
);