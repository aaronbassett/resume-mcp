import React from 'react';
import { useBlockStore } from '@aaronbassett/block-party';
import type { Block } from '@aaronbassett/block-party';

interface BlockEditorWrapperProps {
  children: React.ReactNode;
  onBlocksChange?: (blocks: Block[]) => void;
  onError?: (error: Error) => void;
}

/**
 * Wrapper component that provides block editor functionality
 * and integrates with the block-party library
 */
export const BlockEditorWrapper: React.FC<BlockEditorWrapperProps> = ({
  children,
  onBlocksChange,
  onError,
}) => {
  const store = useBlockStore();
  
  // Subscribe to block changes
  React.useEffect(() => {
    if (onBlocksChange) {
      const unsubscribe = store.subscribe(
        (state) => state.blocks,
        (blocks) => {
          onBlocksChange(Object.values(blocks));
        }
      );
      
      return unsubscribe;
    }
  }, [store, onBlocksChange]);

  // Handle global errors
  React.useEffect(() => {
    if (onError) {
      // Set up error boundary for block operations
      const handleError = (event: ErrorEvent) => {
        onError(new Error(event.message));
      };
      
      window.addEventListener('error', handleError);
      return () => window.removeEventListener('error', handleError);
    }
  }, [onError]);

  return <>{children}</>;
};

/**
 * Hook to access block editor functionality
 */
export const useBlockEditor = () => {
  const store = useBlockStore();
  
  return {
    // Block management
    addBlock: store.addBlock,
    removeBlock: store.removeBlock,
    updateBlockData: store.updateBlockData,
    moveBlock: store.moveBlock,
    
    // Edit mode management
    enableBlockEdit: store.enableBlockEdit,
    disableBlockEdit: store.disableBlockEdit,
    saveBlock: store.saveBlock,
    cancelBlockEdit: store.cancelBlockEdit,
    
    // Query functions
    getBlock: store.getBlock,
    getBlocksByType: store.getBlocksByType,
    canAddBlock: store.canAddBlock,
    
    // State
    blocks: Object.values(store.blocks),
    editingBlockId: store.editingBlockId,
  };
};