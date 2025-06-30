/**
 * Block data types for all 15 block types in the resume editor
 */

export interface AvatarBlockData {
  imageUrl?: string;
  altText?: string;
}

export interface ContactBlockData {
  email?: string;
  phone?: string;
  website?: string;
}

export interface AddressBlockData {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isRemote?: boolean;
}

export interface SocialNetwork {
  platform: string;
  url: string;
  username?: string;
}

export interface SocialNetworksBlockData {
  networks: SocialNetwork[];
}

export interface ExperienceBlockData {
  company: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

export interface VolunteerBlockData {
  organization: string;
  position: string;
  location?: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  description?: string;
  highlights?: string[];
}

export interface EducationBlockData {
  institution: string;
  degree: string;
  field?: string;
  location?: string;
  graduationDate: string;
  gpa?: string;
  honors?: string[];
  coursework?: string[];
}

export interface AwardBlockData {
  title: string;
  awarder: string;
  date: string;
  description?: string;
}

export interface CertificateBlockData {
  name: string;
  authority: string;
  licenseNumber?: string;
  issuedAt: string;
  expiresAt?: string;
  url?: string;
}

export interface PublicationBlockData {
  title: string;
  publisher: string;
  publicationDate: string;
  url?: string;
  authors?: string[];
  description?: string;
}

export interface SkillBlockData {
  name: string;
  category: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  yearsOfExperience?: number;
}

export interface NaturalLanguageBlockData {
  language: string;
  fluency: 'elementary' | 'conversational' | 'professional' | 'native';
}

export interface InterestBlockData {
  interests: string[];
}

export interface ReferenceBlockData {
  name: string;
  title: string;
  company: string;
  email?: string;
  phone?: string;
  relationship?: string;
}

export interface ProjectBlockData {
  name: string;
  description: string;
  url?: string;
  startDate?: string;
  endDate?: string;
  technologies?: string[];
  highlights?: string[];
}

/**
 * Union type of all block data types
 */
export type BlockData = 
  | AvatarBlockData
  | ContactBlockData
  | AddressBlockData
  | SocialNetworksBlockData
  | ExperienceBlockData
  | VolunteerBlockData
  | EducationBlockData
  | AwardBlockData
  | CertificateBlockData
  | PublicationBlockData
  | SkillBlockData
  | NaturalLanguageBlockData
  | InterestBlockData
  | ReferenceBlockData
  | ProjectBlockData;

/**
 * Extended block interface for resume blocks
 */
export interface ResumeBlock {
  id: string;
  type: string;
  data: BlockData;
  name?: string;
  isShared?: boolean;
  resumeCount?: number;
}