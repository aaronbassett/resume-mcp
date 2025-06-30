/**
 * Avatar Block Wrapper
 * 
 * Integrates AvatarBlock with the block-party library and block service
 */

import React from 'react';
import { AvatarBlock } from './avatar/AvatarBlock';
import { AvatarBlockData } from '../../types/blocks';
import { BlockType } from '../../config/blockEditorConfig';
import { blockService } from '../../lib/blockService';
import { useBlockStore } from '@aaronbassett/block-party';

interface AvatarBlockWrapperProps {
  blockId: string;
  data: AvatarBlockData;
  isEditing?: boolean;
  className?: string;
}

export function AvatarBlockWrapper({ 
  blockId, 
  data, 
  isEditing = false, 
  className 
}: AvatarBlockWrapperProps) {
  const { updateBlockData } = useBlockStore();

  const handleChange = async (newData: AvatarBlockData) => {
    // Update local state immediately (optimistic update)
    updateBlockData(blockId, newData);

    // Persist to database in background
    try {
      await blockService.updateBlock(blockId, { data: newData });
    } catch (error) {
      console.error('Failed to save avatar block:', error);
      // TODO: Show error notification
      // Revert optimistic update on error if needed
    }
  };

  return (
    <AvatarBlock
      data={data}
      onChange={handleChange}
      isEditing={isEditing}
      className={className}
    />
  );
}

// Register with block registry
export const avatarBlockConfig = {
  type: BlockType.AVATAR,
  component: AvatarBlockWrapper,
  displayName: 'Avatar',
  description: 'Profile picture or avatar',
  category: 'personal' as const,
  icon: 'User',
  supportsMultiple: false,
  defaultData: (): AvatarBlockData => ({
    imageUrl: '',
    altText: '',
  }),
};