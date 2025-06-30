import React, { useEffect, useState } from 'react';
import { BlockManager } from '@aaronbassett/block-party';
import { Plus, GripVertical, Trash2, Edit3, Save, X, ChevronDown, ChevronUp, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';
import { cn } from '../../lib/utils';
import { BlockType, blockMetadata } from '../../config/blockEditorConfig';
import { getBlockConfig, registerAllBlocks } from '../../blocks/registerBlocks';
import { useBlockEditor } from './BlockEditorWrapper';
import { blockService } from '../../lib/blockService';
import type { Block } from '@aaronbassett/block-party';

// Import all block wrapper components
import { AvatarBlockWrapper } from './AvatarBlockWrapper';
import { ContactBlockWrapper } from './ContactBlockWrapper';
import { AddressBlockWrapper } from './AddressBlockWrapper';
import { SocialNetworksBlockWrapper } from './SocialNetworksBlockWrapper';
import { ExperienceBlockWrapper } from './ExperienceBlockWrapper';
import { EducationBlockWrapper } from './EducationBlockWrapper';
import { VolunteerBlockWrapper } from './VolunteerBlockWrapper';
import { AwardBlockWrapper } from './AwardBlockWrapper';
import { CertificateBlockWrapper } from './CertificateBlockWrapper';
import { PublicationBlockWrapper } from './PublicationBlockWrapper';
import { ProjectBlockWrapper } from './ProjectBlockWrapper';
import { SkillBlockWrapper } from './SkillBlockWrapper';
import { LanguageBlockWrapper } from './LanguageBlockWrapper';
import { InterestBlockWrapper } from './InterestBlockWrapper';
import { ReferenceBlockWrapper } from './ReferenceBlockWrapper';

interface BlockEditorProps {
  resumeId: string;
  onBlocksChange?: (blocks: Block[]) => void;
}

// Block wrapper component map
const blockWrappers: Record<BlockType, React.ComponentType<any>> = {
  [BlockType.AVATAR]: AvatarBlockWrapper,
  [BlockType.CONTACT]: ContactBlockWrapper,
  [BlockType.ADDRESS]: AddressBlockWrapper,
  [BlockType.SOCIAL_NETWORKS]: SocialNetworksBlockWrapper,
  [BlockType.EXPERIENCE]: ExperienceBlockWrapper,
  [BlockType.VOLUNTEER]: VolunteerBlockWrapper,
  [BlockType.EDUCATION]: EducationBlockWrapper,
  [BlockType.AWARD]: AwardBlockWrapper,
  [BlockType.CERTIFICATE]: CertificateBlockWrapper,
  [BlockType.PUBLICATION]: PublicationBlockWrapper,
  [BlockType.SKILL]: SkillBlockWrapper,
  [BlockType.NATURAL_LANGUAGE]: LanguageBlockWrapper,
  [BlockType.INTEREST]: InterestBlockWrapper,
  [BlockType.REFERENCE]: ReferenceBlockWrapper,
  [BlockType.PROJECT]: ProjectBlockWrapper,
};

// Block categories for organization
const blockCategories = [
  {
    name: 'Basic Information',
    types: [BlockType.AVATAR, BlockType.CONTACT, BlockType.ADDRESS, BlockType.SOCIAL_NETWORKS],
  },
  {
    name: 'Experience & Education',
    types: [BlockType.EXPERIENCE, BlockType.EDUCATION, BlockType.VOLUNTEER],
  },
  {
    name: 'Achievements',
    types: [BlockType.AWARD, BlockType.CERTIFICATE, BlockType.PUBLICATION, BlockType.PROJECT],
  },
  {
    name: 'Skills & Interests',
    types: [BlockType.SKILL, BlockType.NATURAL_LANGUAGE, BlockType.INTEREST, BlockType.REFERENCE],
  },
];

export const BlockEditor: React.FC<BlockEditorProps> = ({ resumeId, onBlocksChange }) => {
  const { blocks, addBlock, removeBlock, moveBlock, editingBlockId } = useBlockEditor();
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['Basic Information']);
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Register blocks on mount
  useEffect(() => {
    registerAllBlocks();
  }, []);

  // Load blocks for the resume
  useEffect(() => {
    const loadBlocks = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        
        const { data, error } = await blockService.getBlocksForResume(resumeId);
        
        if (error) {
          setLoadError(error.message);
          console.error('Error loading blocks:', error);
        } else if (data) {
          // TODO: Initialize the block store with loaded blocks
          // For now, blocks are managed by the useBlockEditor hook
          console.log('Loaded blocks:', data);
        }
      } catch (err) {
        setLoadError('Failed to load blocks');
        console.error('Error loading blocks:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (resumeId) {
      loadBlocks();
    }
  }, [resumeId]);

  // Notify parent of block changes
  useEffect(() => {
    if (onBlocksChange) {
      onBlocksChange(blocks);
    }
  }, [blocks, onBlocksChange]);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(c => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleAddBlock = (type: BlockType) => {
    const config = getBlockConfig(type);
    const metadata = blockMetadata[type];
    
    // Check if we can add more blocks of this type
    const existingCount = blocks.filter(b => b.type === type).length;
    if (metadata.maxBlocks && existingCount >= metadata.maxBlocks) {
      alert(`You can only have ${metadata.maxBlocks} ${metadata.displayName} block(s).`);
      return;
    }

    addBlock(type);
    setIsAddingBlock(false);
    setSelectedCategory(null);
  };

  const handleMoveBlock = (fromIndex: number, toIndex: number) => {
    const block = blocks[fromIndex];
    if (block) {
      moveBlock(block.id, toIndex);
    }
  };

  const renderBlock = (block: Block, index: number) => {
    const BlockWrapper = blockWrappers[block.type as BlockType];
    
    if (!BlockWrapper) {
      return (
        <Card key={block.id} className="border-dashed border-2 border-gray-300">
          <CardContent className="p-4">
            <p className="text-muted-foreground">Block type "{block.type}" is not yet implemented</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div
        key={block.id}
        className={cn(
          "group relative transition-all duration-200",
          editingBlockId === block.id && "ring-2 ring-primary ring-offset-2"
        )}
      >
        {/* Drag handle and actions */}
        <div className="absolute -left-12 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="p-1 text-muted-foreground hover:text-foreground cursor-move"
            title="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </button>
        </div>

        <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => removeBlock(block.id)}
            className="h-8 w-8 p-0"
            title="Remove block"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Block content */}
        <BlockWrapper block={block} />
      </div>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading blocks...</span>
      </div>
    );
  }

  // Error state
  if (loadError) {
    return (
      <Card className="border-destructive">
        <CardContent className="p-6">
          <div className="flex items-center text-destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <p className="font-medium">Error loading blocks</p>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{loadError}</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Resume Content</h3>
          <p className="text-sm text-muted-foreground">
            Add and organize content blocks to build your resume
          </p>
        </div>
        <Button
          onClick={() => setIsAddingBlock(!isAddingBlock)}
          variant={isAddingBlock ? "secondary" : "default"}
          size="sm"
        >
          {isAddingBlock ? (
            <>
              <X className="mr-2 h-4 w-4" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Add Block
            </>
          )}
        </Button>
      </div>

      {/* Add Block Panel */}
      {isAddingBlock && (
        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Choose a block type to add:</h4>
            <div className="space-y-4">
              {blockCategories.map((category) => (
                <div key={category.name}>
                  <button
                    onClick={() => toggleCategory(category.name)}
                    className="flex items-center justify-between w-full text-left p-2 hover:bg-accent rounded-md transition-colors"
                  >
                    <span className="font-medium">{category.name}</span>
                    {expandedCategories.includes(category.name) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                  
                  {expandedCategories.includes(category.name) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 pl-2">
                      {category.types.map((type) => {
                        const metadata = blockMetadata[type];
                        const existingCount = blocks.filter(b => b.type === type).length;
                        const isDisabled = metadata.maxBlocks && existingCount >= metadata.maxBlocks;
                        
                        return (
                          <Button
                            key={type}
                            variant="outline"
                            size="sm"
                            onClick={() => handleAddBlock(type)}
                            disabled={isDisabled}
                            className="justify-start"
                          >
                            <Plus className="mr-2 h-3 w-3" />
                            {metadata.displayName}
                            {metadata.maxBlocks && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                ({existingCount}/{metadata.maxBlocks})
                              </span>
                            )}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blocks List */}
      {blocks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="mx-auto h-12 w-12 text-muted-foreground mb-4">
              <Plus className="h-full w-full" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No content blocks yet</h3>
            <p className="text-muted-foreground mb-4">
              Start building your resume by adding content blocks
            </p>
            <Button onClick={() => setIsAddingBlock(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Block
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {blocks.map((block, index) => renderBlock(block, index))}
        </div>
      )}
    </div>
  );
};