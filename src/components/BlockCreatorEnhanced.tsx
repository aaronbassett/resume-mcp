/**
 * Enhanced Block Creator Component
 * 
 * Provides options to create new blocks or select from existing ones
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Database, PlusCircle, Search } from 'lucide-react';
import { BlockType, blockTypeConfigs } from '../config/blockEditorConfig';
import { blockRegistry } from '../blocks/registry';
import { cn } from '../lib/utils';
import { useBlockEditor } from './blocks/BlockEditorWrapper';
import { blockService } from '../lib/blockService';
import type { Block } from '../types/blocks';

interface BlockCreatorEnhancedProps {
  blockType: BlockType;
  onCreateNew?: (blockType: BlockType, data: any, name: string) => void;
  onSelectExisting?: (block: Block) => void;
  onBack?: () => void;
  userId?: string;
}

type ViewMode = 'choice' | 'create' | 'select';

export function BlockCreatorEnhanced({
  blockType,
  onCreateNew,
  onSelectExisting,
  onBack,
  userId,
}: BlockCreatorEnhancedProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('choice');
  const [blockName, setBlockName] = useState('');
  const [existingBlocks, setExistingBlocks] = useState<Block[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const blockEditor = useBlockEditor();
  const config = blockTypeConfigs[blockType];
  const blockConfig = blockRegistry.get(blockType);

  // Load existing blocks when selecting
  useEffect(() => {
    if (viewMode === 'select' && userId) {
      loadExistingBlocks();
    }
  }, [viewMode, userId]);

  const loadExistingBlocks = async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await blockService.getBlocksByUser(userId, {
        type: blockType,
      });
      
      if (response.data) {
        setExistingBlocks(response.data.blocks);
      }
    } catch (err) {
      setError('Failed to load existing blocks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = async () => {
    if (!blockName.trim()) {
      setError('Please enter a name for the block');
      return;
    }

    if (!blockConfig) {
      setError('Block configuration not found');
      return;
    }

    const newData = blockConfig.defaultData;
    
    if (onCreateNew) {
      onCreateNew(blockType, newData, blockName);
    } else if (blockEditor && userId) {
      // Create via block service
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await blockService.createBlock({
          type: blockType,
          data: newData,
          name: blockName,
          userId,
        });
        
        if (response.data) {
          blockEditor.addBlock({
            type: blockType,
            data: response.data.data,
            id: response.data.id,
          });
        }
      } catch (err) {
        setError('Failed to create block');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSelectExisting = (block: Block) => {
    if (onSelectExisting) {
      onSelectExisting(block);
    } else if (blockEditor) {
      blockEditor.addBlock({
        type: blockType,
        data: block.data,
        id: block.id,
      });
    }
  };

  // Filter existing blocks based on search
  const filteredBlocks = existingBlocks.filter(block =>
    block.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    JSON.stringify(block.data).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChoiceView = () => (
    <div className="p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Add {config.displayName}
      </h3>
      
      <div className="space-y-3">
        <button
          onClick={() => setViewMode('create')}
          className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left group"
        >
          <div className="flex items-center space-x-3">
            <PlusCircle className="w-6 h-6 text-blue-600 group-hover:text-blue-700" />
            <div>
              <h4 className="font-medium text-gray-900">Create New</h4>
              <p className="text-sm text-gray-500">
                Start with a fresh {config.displayName.toLowerCase()}
              </p>
            </div>
          </div>
        </button>

        {config.supportsMultiple && (
          <button
            onClick={() => setViewMode('select')}
            className="w-full p-4 border-2 border-gray-200 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all text-left group"
          >
            <div className="flex items-center space-x-3">
              <Database className="w-6 h-6 text-purple-600 group-hover:text-purple-700" />
              <div>
                <h4 className="font-medium text-gray-900">Select Existing</h4>
                <p className="text-sm text-gray-500">
                  Choose from your saved {config.displayName.toLowerCase()}s
                </p>
              </div>
            </div>
          </button>
        )}
      </div>
    </div>
  );

  const renderCreateView = () => (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setViewMode('choice')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          Create New {config.displayName}
        </h3>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Name *
          </label>
          <input
            type="text"
            value={blockName}
            onChange={(e) => setBlockName(e.target.value)}
            placeholder={`My ${config.displayName}`}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus
          />
          <p className="text-xs text-gray-500 mt-1">
            Give this {config.displayName.toLowerCase()} a memorable name
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          onClick={handleCreateNew}
          disabled={!blockName.trim() || isLoading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : 'Create Block'}
        </button>
      </div>
    </div>
  );

  const renderSelectView = () => (
    <div className="p-6 space-y-4">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => setViewMode('choice')}
          className="text-gray-500 hover:text-gray-700"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="text-lg font-semibold text-gray-900">
          Select Existing {config.displayName}
        </h3>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search blocks..."
          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Block List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Loading blocks...
          </div>
        ) : filteredBlocks.length > 0 ? (
          filteredBlocks.map((block) => (
            <button
              key={block.id}
              onClick={() => handleSelectExisting(block)}
              className="w-full p-3 border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left"
            >
              <h4 className="font-medium text-gray-900">{block.name}</h4>
              <p className="text-sm text-gray-500 mt-1">
                Created {new Date(block.created_at).toLocaleDateString()}
              </p>
            </button>
          ))
        ) : (
          <div className="py-8 text-center text-gray-500">
            {searchQuery ? 'No matching blocks found' : 'No existing blocks'}
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-96">
      {viewMode === 'choice' && renderChoiceView()}
      {viewMode === 'create' && renderCreateView()}
      {viewMode === 'select' && renderSelectView()}
      
      {onBack && viewMode === 'choice' && (
        <div className="px-6 pb-4">
          <button
            onClick={onBack}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to block types
          </button>
        </div>
      )}
    </div>
  );
}