import React from 'react';
import { BlockManager } from '@aaronbassett/block-party';
import { Button, Alert, Badge } from 'flowbite-react';
import { Plus, Trash2, Edit3, Save, X } from 'lucide-react';
import { getBlockConfig } from '../../blocks/registerBlocks';
import { BlockType } from '../../config/blockEditorConfig';
import { useBlockEditor } from './BlockEditorWrapper';
import { cn } from './BlockStyles';

/**
 * Demo component showing block editor with Tailwind and Flowbite styling
 */
export const BlockEditorDemo: React.FC = () => {
  const { blocks, addBlock, removeBlock } = useBlockEditor();
  const [selectedType, setSelectedType] = React.useState<BlockType>(BlockType.CONTACT);

  // Filter blocks by type for demo
  const contactBlocks = blocks.filter(b => b.type === BlockType.CONTACT);

  return (
    <div className="space-y-6 p-6">
      {/* Header with Flowbite components */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Resume Block Editor</h2>
          <p className="text-gray-600">Create and manage your resume content blocks</p>
        </div>
        <Badge color="info" size="sm">
          {blocks.length} blocks
        </Badge>
      </div>

      {/* Alert for demo */}
      <Alert color="info" icon={Edit3}>
        <span className="font-medium">Demo Mode:</span> This demonstrates Tailwind CSS and Flowbite integration with the block editor.
      </Alert>

      {/* Block type selector */}
      <div className="flex items-center gap-4">
        <label className="text-sm font-medium text-gray-700">Block Type:</label>
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value as BlockType)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value={BlockType.CONTACT}>Contact</option>
          <option value={BlockType.EXPERIENCE}>Experience</option>
          <option value={BlockType.EDUCATION}>Education</option>
          <option value={BlockType.SKILL}>Skill</option>
          <option value={BlockType.PROJECT}>Project</option>
        </select>
      </div>

      {/* Add block button with Flowbite styling */}
      <div className="flex gap-3">
        <Button
          color="blue"
          size="sm"
          onClick={() => addBlock(selectedType)}
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          Add {selectedType} Block
        </Button>
      </div>

      {/* Contact blocks section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Contact Blocks</h3>
        
        {contactBlocks.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <Plus className="h-full w-full" />
            </div>
            <p className="mt-2 text-sm font-medium text-gray-900">No contact blocks yet</p>
            <p className="mt-1 text-sm text-gray-500">Add a contact block to get started</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contactBlocks.map((block) => (
              <div
                key={block.id}
                className={cn(
                  'group relative rounded-lg border bg-white p-4 transition-all',
                  block.isEditing
                    ? 'border-blue-500 ring-2 ring-blue-500 ring-opacity-50'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                )}
              >
                {/* Block actions */}
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <Button
                    color="gray"
                    size="xs"
                    onClick={() => removeBlock(block.id)}
                    className="gap-1"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </Button>
                </div>

                {/* Block content would be rendered here */}
                <BlockManager
                  type={BlockType.CONTACT}
                  config={getBlockConfig(BlockType.CONTACT)}
                  className="block-content"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Keyboard shortcuts info */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Keyboard Shortcuts</h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <kbd className="rounded bg-gray-200 px-2 py-1">Tab</kbd> Navigate between blocks
          </div>
          <div>
            <kbd className="rounded bg-gray-200 px-2 py-1">Enter</kbd> Edit block
          </div>
          <div>
            <kbd className="rounded bg-gray-200 px-2 py-1">Esc</kbd> Cancel editing
          </div>
          <div>
            <kbd className="rounded bg-gray-200 px-2 py-1">Ctrl+S</kbd> Save block
          </div>
        </div>
      </div>
    </div>
  );
};