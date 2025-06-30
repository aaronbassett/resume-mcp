import { blockRegistry, createBlockConfig, defaultDataCreators, blockValidators } from './registry';
import { BlockType, blockMetadata } from '../config/blockEditorConfig';
import { ContactBlockView, ContactBlockEdit } from './implementations/ContactBlock';
import type { ContactBlockData } from '../types/blocks';

/**
 * Register all block types with the registry
 * This function should be called once during app initialization
 */
export function registerAllBlocks(): void {
  // Register Contact Block as an example
  blockRegistry.register(
    BlockType.CONTACT,
    createBlockConfig<ContactBlockData>(BlockType.CONTACT, {
      displayName: blockMetadata[BlockType.CONTACT].displayName,
      maxBlocks: blockMetadata[BlockType.CONTACT].maxBlocks,
      renderView: ContactBlockView,
      renderEdit: ContactBlockEdit,
      createDefault: defaultDataCreators[BlockType.CONTACT],
      validate: blockValidators[BlockType.CONTACT],
      onSave: async (block) => {
        // TODO: Integrate with blockService to persist to database
        console.log('Saving contact block:', block);
      },
    })
  );

  // TODO: Register remaining 14 block types as they are implemented
  // Each block type will follow the same pattern:
  // 1. Import the View and Edit components
  // 2. Use blockRegistry.register() with the appropriate type
  // 3. Use metadata, defaultDataCreators, and validators from our configs

  console.log(`Registered ${blockRegistry.getTypes().length} block types`);
}

/**
 * Get a block configuration by type with proper typing
 */
export function getBlockConfig<T>(type: BlockType) {
  const config = blockRegistry.get<T>(type);
  if (!config) {
    throw new Error(`Block type "${type}" is not registered`);
  }
  return config;
}

/**
 * Check if all required blocks are registered
 */
export function validateBlockRegistrations(): {
  isValid: boolean;
  missing: BlockType[];
} {
  const allTypes = Object.values(BlockType);
  const registeredTypes = blockRegistry.getTypes();
  const missing = allTypes.filter(type => !registeredTypes.includes(type));

  return {
    isValid: missing.length === 0,
    missing,
  };
}