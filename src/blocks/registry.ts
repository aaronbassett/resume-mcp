import type { BlockConfig } from '@aaronbassett/block-party';
import { BlockType } from '../config/blockEditorConfig';
import type {
  AvatarBlockData,
  ContactBlockData,
  AddressBlockData,
  SocialNetworksBlockData,
  ExperienceBlockData,
  VolunteerBlockData,
  EducationBlockData,
  AwardBlockData,
  CertificateBlockData,
  PublicationBlockData,
  SkillBlockData,
  NaturalLanguageBlockData,
  InterestBlockData,
  ReferenceBlockData,
  ProjectBlockData,
} from '../types/blocks';

/**
 * Registry for all block configurations
 */
class BlockRegistry {
  private configs: Map<BlockType, BlockConfig<any>> = new Map();

  /**
   * Register a block configuration
   */
  register<T>(type: BlockType, config: BlockConfig<T>): void {
    if (this.configs.has(type)) {
      console.warn(`Block type ${type} is already registered. Overwriting...`);
    }
    this.configs.set(type, config);
  }

  /**
   * Get a block configuration by type
   */
  get<T>(type: BlockType): BlockConfig<T> | undefined {
    return this.configs.get(type);
  }

  /**
   * Get all registered block configurations
   */
  getAll(): Map<BlockType, BlockConfig<any>> {
    return new Map(this.configs);
  }

  /**
   * Check if a block type is registered
   */
  has(type: BlockType): boolean {
    return this.configs.has(type);
  }

  /**
   * Get all registered block types
   */
  getTypes(): BlockType[] {
    return Array.from(this.configs.keys());
  }

  /**
   * Clear all registrations
   */
  clear(): void {
    this.configs.clear();
  }
}

// Create singleton instance
export const blockRegistry = new BlockRegistry();

/**
 * Helper function to create a block configuration with type safety
 */
export function createBlockConfig<T>(
  type: BlockType,
  config: Omit<BlockConfig<T>, 'type'>
): BlockConfig<T> {
  return {
    type,
    ...config,
  };
}

/**
 * Default data creators for each block type
 */
export const defaultDataCreators = {
  [BlockType.AVATAR]: (): AvatarBlockData => ({
    imageUrl: '',
    altText: '',
  }),
  
  [BlockType.CONTACT]: (): ContactBlockData => ({
    email: '',
    phone: '',
    website: '',
  }),
  
  [BlockType.ADDRESS]: (): AddressBlockData => ({
    street: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    isRemote: false,
  }),
  
  [BlockType.SOCIAL_NETWORKS]: (): SocialNetworksBlockData => ({
    networks: [],
  }),
  
  [BlockType.EXPERIENCE]: (): ExperienceBlockData => ({
    company: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    highlights: [],
  }),
  
  [BlockType.VOLUNTEER]: (): VolunteerBlockData => ({
    organization: '',
    position: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    highlights: [],
  }),
  
  [BlockType.EDUCATION]: (): EducationBlockData => ({
    institution: '',
    degree: '',
    field: '',
    location: '',
    graduationDate: '',
    gpa: '',
    honors: [],
    coursework: [],
  }),
  
  [BlockType.AWARD]: (): AwardBlockData => ({
    title: '',
    awarder: '',
    date: '',
    description: '',
  }),
  
  [BlockType.CERTIFICATE]: (): CertificateBlockData => ({
    name: '',
    authority: '',
    licenseNumber: '',
    issuedAt: '',
    expiresAt: '',
    url: '',
  }),
  
  [BlockType.PUBLICATION]: (): PublicationBlockData => ({
    title: '',
    publisher: '',
    publicationDate: '',
    url: '',
    authors: [],
    description: '',
  }),
  
  [BlockType.SKILL]: (): SkillBlockData => ({
    name: '',
    category: '',
    proficiency: 'intermediate',
    yearsOfExperience: 0,
  }),
  
  [BlockType.NATURAL_LANGUAGE]: (): NaturalLanguageBlockData => ({
    language: '',
    fluency: 'conversational',
  }),
  
  [BlockType.INTEREST]: (): InterestBlockData => ({
    interests: [],
  }),
  
  [BlockType.REFERENCE]: (): ReferenceBlockData => ({
    name: '',
    title: '',
    company: '',
    email: '',
    phone: '',
    relationship: '',
  }),
  
  [BlockType.PROJECT]: (): ProjectBlockData => ({
    name: '',
    description: '',
    url: '',
    startDate: '',
    endDate: '',
    technologies: [],
    highlights: [],
  }),
};

/**
 * Validation functions for each block type
 */
export const blockValidators = {
  [BlockType.AVATAR]: (data: AvatarBlockData): boolean => {
    return true; // Avatar is optional
  },
  
  [BlockType.CONTACT]: (data: ContactBlockData): boolean => {
    // At least one contact method required
    return !!(data.email || data.phone || data.website);
  },
  
  [BlockType.ADDRESS]: (data: AddressBlockData): boolean => {
    // Either remote or has location info
    return data.isRemote || !!(data.city || data.country);
  },
  
  [BlockType.SOCIAL_NETWORKS]: (data: SocialNetworksBlockData): boolean => {
    return data.networks.every(n => n.platform && n.url);
  },
  
  [BlockType.EXPERIENCE]: (data: ExperienceBlockData): boolean => {
    return !!(data.company && data.position && data.startDate);
  },
  
  [BlockType.VOLUNTEER]: (data: VolunteerBlockData): boolean => {
    return !!(data.organization && data.position && data.startDate);
  },
  
  [BlockType.EDUCATION]: (data: EducationBlockData): boolean => {
    return !!(data.institution && data.degree && data.graduationDate);
  },
  
  [BlockType.AWARD]: (data: AwardBlockData): boolean => {
    return !!(data.title && data.awarder && data.date);
  },
  
  [BlockType.CERTIFICATE]: (data: CertificateBlockData): boolean => {
    return !!(data.name && data.authority && data.issuedAt);
  },
  
  [BlockType.PUBLICATION]: (data: PublicationBlockData): boolean => {
    return !!(data.title && data.publisher && data.publicationDate);
  },
  
  [BlockType.SKILL]: (data: SkillBlockData): boolean => {
    return !!(data.name && data.category);
  },
  
  [BlockType.NATURAL_LANGUAGE]: (data: NaturalLanguageBlockData): boolean => {
    return !!(data.language && data.fluency);
  },
  
  [BlockType.INTEREST]: (data: InterestBlockData): boolean => {
    return data.interests.length > 0;
  },
  
  [BlockType.REFERENCE]: (data: ReferenceBlockData): boolean => {
    return !!(data.name && data.title && data.company);
  },
  
  [BlockType.PROJECT]: (data: ProjectBlockData): boolean => {
    return !!(data.name && data.description);
  },
};

// Auto-register Avatar Block
import('../components/blocks/AvatarBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.AVATAR, module.avatarBlockConfig);
});

// Auto-register Contact Block
import('../components/blocks/ContactBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.CONTACT, module.contactBlockConfig);
});

// Auto-register Address Block
import('../components/blocks/AddressBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.ADDRESS, module.addressBlockConfig);
});

// Auto-register Social Networks Block
import('../components/blocks/SocialNetworksBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.SOCIAL_NETWORKS, module.socialNetworksBlockConfig);
});

// Auto-register Experience Block
import('../components/blocks/ExperienceBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.EXPERIENCE, module.experienceBlockConfig);
});

// Auto-register Education Block
import('../components/blocks/EducationBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.EDUCATION, module.educationBlockConfig);
});

// Auto-register Volunteer Block
import('../components/blocks/VolunteerBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.VOLUNTEER, module.volunteerBlockConfig);
});

// Auto-register Award Block
import('../components/blocks/AwardBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.AWARD, module.awardBlockConfig);
});

// Auto-register Certificate Block
import('../components/blocks/CertificateBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.CERTIFICATE, module.certificateBlockConfig);
});

// Auto-register Publication Block
import('../components/blocks/PublicationBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.PUBLICATION, module.publicationBlockConfig);
});

// Auto-register Project Block
import('../components/blocks/ProjectBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.PROJECT, module.projectBlockConfig);
});

// Auto-register Skill Block
import('../components/blocks/SkillBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.SKILL, module.skillBlockConfig);
});

// Auto-register Language Block
import('../components/blocks/LanguageBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.NATURAL_LANGUAGE, module.languageBlockConfig);
});

// Auto-register Interest Block
import('../components/blocks/InterestBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.INTEREST, module.interestBlockConfig);
});

// Auto-register Reference Block
import('../components/blocks/ReferenceBlockWrapper').then((module) => {
  blockRegistry.register(BlockType.REFERENCE, module.referenceBlockConfig);
});