// Block editor components and utilities
export { BlockEditorWrapper, useBlockEditor } from './BlockEditorWrapper';
export { ResumeBlockProvider, useResumeBlockContext } from './ResumeBlockContext';
export type { ResumeBlockProviderProps } from './ResumeBlockContext';

// Block Components
export { AvatarBlock } from './avatar';
export { ContactBlock } from './contact';
export { AddressBlock } from './address';
export { SocialNetworksBlock } from './social';
export { ExperienceBlock } from './experience';
export { AvatarBlockWrapper, avatarBlockConfig } from './AvatarBlockWrapper';
export { ContactBlockWrapper, contactBlockConfig } from './ContactBlockWrapper';
export { AddressBlockWrapper, addressBlockConfig } from './AddressBlockWrapper';
export { SocialNetworksBlockWrapper, socialNetworksBlockConfig } from './SocialNetworksBlockWrapper';
export { ExperienceBlockWrapper, experienceBlockConfig } from './ExperienceBlockWrapper';

// Block Registry
export { blockRegistry } from '../../blocks/registry';