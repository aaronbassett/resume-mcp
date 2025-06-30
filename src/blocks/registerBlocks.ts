import { blockRegistry, createBlockConfig, defaultDataCreators, blockValidators } from './registry';
import { BlockType, blockMetadata } from '../config/blockEditorConfig';

// Import all block configurations synchronously
import { avatarBlockConfig } from '../components/blocks/AvatarBlockWrapper';
import { contactBlockConfig } from '../components/blocks/ContactBlockWrapper';
import { addressBlockConfig } from '../components/blocks/AddressBlockWrapper';
import { socialNetworksBlockConfig } from '../components/blocks/SocialNetworksBlockWrapper';
import { experienceBlockConfig } from '../components/blocks/ExperienceBlockWrapper';
import { volunteerBlockConfig } from '../components/blocks/VolunteerBlockWrapper';
import { educationBlockConfig } from '../components/blocks/EducationBlockWrapper';
import { awardBlockConfig } from '../components/blocks/AwardBlockWrapper';
import { certificateBlockConfig } from '../components/blocks/CertificateBlockWrapper';
import { publicationBlockConfig } from '../components/blocks/PublicationBlockWrapper';
import { projectBlockConfig } from '../components/blocks/ProjectBlockWrapper';
import { skillBlockConfig } from '../components/blocks/SkillBlockWrapper';
import { languageBlockConfig } from '../components/blocks/LanguageBlockWrapper';
import { interestBlockConfig } from '../components/blocks/InterestBlockWrapper';
import { referenceBlockConfig } from '../components/blocks/ReferenceBlockWrapper';

/**
 * Register all block types with the registry
 * This function should be called once during app initialization
 */
export function registerAllBlocks(): void {
  // Map of block types to their configurations
  const blockConfigs = {
    [BlockType.AVATAR]: avatarBlockConfig,
    [BlockType.CONTACT]: contactBlockConfig,
    [BlockType.ADDRESS]: addressBlockConfig,
    [BlockType.SOCIAL_NETWORKS]: socialNetworksBlockConfig,
    [BlockType.EXPERIENCE]: experienceBlockConfig,
    [BlockType.VOLUNTEER]: volunteerBlockConfig,
    [BlockType.EDUCATION]: educationBlockConfig,
    [BlockType.AWARD]: awardBlockConfig,
    [BlockType.CERTIFICATE]: certificateBlockConfig,
    [BlockType.PUBLICATION]: publicationBlockConfig,
    [BlockType.PROJECT]: projectBlockConfig,
    [BlockType.SKILL]: skillBlockConfig,
    [BlockType.NATURAL_LANGUAGE]: languageBlockConfig,
    [BlockType.INTEREST]: interestBlockConfig,
    [BlockType.REFERENCE]: referenceBlockConfig,
  };

  // Register all block configurations
  Object.entries(blockConfigs).forEach(([blockType, config]) => {
    if (config) {
      blockRegistry.register(blockType as BlockType, config);
    } else {
      console.warn(`No configuration found for block type: ${blockType}`);
    }
  });

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