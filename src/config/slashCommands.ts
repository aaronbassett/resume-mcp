import { BlockType, blockMetadata } from './blockEditorConfig';

export interface SlashCommand {
  command: string;
  blockType: BlockType;
  aliases?: string[];
}

/**
 * Slash commands for creating blocks
 */
export const slashCommands: SlashCommand[] = [
  // Personal blocks
  {
    command: '/avatar',
    blockType: BlockType.AVATAR,
    aliases: ['/photo', '/image', '/profile'],
  },
  {
    command: '/contact',
    blockType: BlockType.CONTACT,
    aliases: ['/email', '/phone'],
  },
  {
    command: '/address',
    blockType: BlockType.ADDRESS,
    aliases: ['/location'],
  },
  {
    command: '/social',
    blockType: BlockType.SOCIAL_NETWORKS,
    aliases: ['/networks', '/links'],
  },
  
  // Professional blocks
  {
    command: '/experience',
    blockType: BlockType.EXPERIENCE,
    aliases: ['/work', '/job'],
  },
  {
    command: '/volunteer',
    blockType: BlockType.VOLUNTEER,
    aliases: ['/community'],
  },
  {
    command: '/education',
    blockType: BlockType.EDUCATION,
    aliases: ['/school', '/degree'],
  },
  {
    command: '/project',
    blockType: BlockType.PROJECT,
    aliases: ['/portfolio'],
  },
  
  // Achievement blocks
  {
    command: '/award',
    blockType: BlockType.AWARD,
    aliases: ['/honor', '/recognition'],
  },
  {
    command: '/certificate',
    blockType: BlockType.CERTIFICATE,
    aliases: ['/certification', '/cert'],
  },
  {
    command: '/publication',
    blockType: BlockType.PUBLICATION,
    aliases: ['/article', '/paper'],
  },
  
  // Skills blocks
  {
    command: '/skill',
    blockType: BlockType.SKILL,
    aliases: ['/skills'],
  },
  {
    command: '/language',
    blockType: BlockType.NATURAL_LANGUAGE,
    aliases: ['/languages'],
  },
  
  // Other blocks
  {
    command: '/interest',
    blockType: BlockType.INTEREST,
    aliases: ['/interests', '/hobby'],
  },
  {
    command: '/reference',
    blockType: BlockType.REFERENCE,
    aliases: ['/references'],
  },
];

/**
 * Get block type from slash command
 */
export function getBlockTypeFromCommand(input: string): BlockType | null {
  const normalizedInput = input.toLowerCase().trim();
  
  for (const cmd of slashCommands) {
    if (normalizedInput === cmd.command || cmd.aliases?.includes(normalizedInput)) {
      return cmd.blockType;
    }
  }
  
  return null;
}

/**
 * Get slash command suggestions based on input
 */
export function getSlashCommandSuggestions(input: string): Array<{
  command: string;
  blockType: BlockType;
  displayName: string;
  description: string;
}> {
  const normalizedInput = input.toLowerCase().trim();
  
  if (!normalizedInput.startsWith('/')) {
    return [];
  }
  
  const searchTerm = normalizedInput.slice(1);
  
  return slashCommands
    .filter(cmd => {
      const matches = cmd.command.slice(1).includes(searchTerm) ||
        cmd.aliases?.some(alias => alias.slice(1).includes(searchTerm));
      return matches;
    })
    .map(cmd => {
      const metadata = blockMetadata[cmd.blockType];
      return {
        command: cmd.command,
        blockType: cmd.blockType,
        displayName: metadata.displayName,
        description: metadata.description,
      };
    });
}