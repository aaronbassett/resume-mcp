/**
 * Animated Block Creator Component
 * 
 * Adds smooth animations to the block creation interface
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlockCreator } from './BlockCreator';
import { SlashCommandDetector } from './SlashCommandDetector';
import { BlockType } from '../config/blockEditorConfig';

interface BlockCreatorAnimatedProps {
  onCreateBlock?: (blockType: BlockType, data?: any) => void;
  userId?: string;
  enableSlashCommand?: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export function BlockCreatorAnimated({
  onCreateBlock,
  userId,
  enableSlashCommand = true,
  containerRef,
}: BlockCreatorAnimatedProps) {
  return (
    <>
      {/* Main Block Creator with animations */}
      <BlockCreator
        onCreateBlock={onCreateBlock}
        userId={userId}
        enableSlashCommand={enableSlashCommand}
        className="transition-transform duration-200 hover:scale-105"
      />

      {/* Slash Command Detector */}
      {enableSlashCommand && (
        <SlashCommandDetector
          onSelectBlockType={(blockType, data) => {
            if (onCreateBlock) {
              onCreateBlock(blockType, data);
            }
          }}
          containerRef={containerRef}
          enabled={enableSlashCommand}
        />
      )}
    </>
  );
}

// Export animation variants for use in other components
export const menuAnimations = {
  initial: { opacity: 0, scale: 0.9, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: 10 },
  transition: { duration: 0.2, ease: 'easeOut' },
};

export const itemAnimations = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -10 },
  transition: { duration: 0.15 },
};

export const backdropAnimations = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
};