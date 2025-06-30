// Block registration and management
export { blockRegistry } from './registry';
export { registerAllBlocks, getBlockConfig, validateBlockRegistrations } from './registerBlocks';
export { 
  createNewBlock, 
  validateBlock, 
  getBlockDisplayName, 
  supportsMultipleInstances,
  getBlockPreview 
} from './utils';

// Block implementations
export { ContactBlockView, ContactBlockEdit } from './implementations/ContactBlock';