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
export { EducationBlock } from './education';
export { VolunteerBlock } from './volunteer';
export { AwardBlock } from './award';
export { AvatarBlockWrapper, avatarBlockConfig } from './AvatarBlockWrapper';
export { ContactBlockWrapper, contactBlockConfig } from './ContactBlockWrapper';
export { AddressBlockWrapper, addressBlockConfig } from './AddressBlockWrapper';
export { SocialNetworksBlockWrapper, socialNetworksBlockConfig } from './SocialNetworksBlockWrapper';
export { ExperienceBlockWrapper, experienceBlockConfig } from './ExperienceBlockWrapper';
export { EducationBlockWrapper, educationBlockConfig } from './EducationBlockWrapper';
export { VolunteerBlockWrapper, volunteerBlockConfig } from './VolunteerBlockWrapper';
export { AwardBlockWrapper, awardBlockConfig } from './AwardBlockWrapper';

// Block Registry
export { blockRegistry } from '../../blocks/registry';