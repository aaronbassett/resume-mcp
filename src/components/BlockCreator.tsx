/**
 * Block Creator Component
 * 
 * Provides interface for creating new blocks via floating button or slash command
 */

import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { BlockType, blockTypeConfigs } from '../config/blockEditorConfig';
import { blockRegistry } from '../blocks/registry';
import { useBlockEditor } from './blocks/BlockEditorWrapper';
import { BlockCreatorEnhanced } from './BlockCreatorEnhanced';
import * as Icons from 'lucide-react';

interface BlockCreatorProps {
  onCreateBlock?: (blockType: BlockType, data?: any) => void;
  className?: string;
  userId?: string;
  enableSlashCommand?: boolean;
}

export function BlockCreator({ onCreateBlock, className, userId, enableSlashCommand = true }: BlockCreatorProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedBlockType, setSelectedBlockType] = useState<BlockType | null>(null);
  const [showEnhanced, setShowEnhanced] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const blockEditor = useBlockEditor();

  // Get available block types
  const availableBlockTypes = Object.values(BlockType).filter(type => 
    blockRegistry.has(type)
  );

  // Filter block types based on search
  const filteredBlockTypes = availableBlockTypes.filter(type => {
    const config = blockTypeConfigs[type];
    const searchLower = searchQuery.toLowerCase();
    return (
      config.displayName.toLowerCase().includes(searchLower) ||
      config.description.toLowerCase().includes(searchLower) ||
      type.toLowerCase().includes(searchLower)
    );
  });

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        setIsMenuOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        setIsMenuOpen(false);
        setSearchQuery('');
        setSelectedIndex(0);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredBlockTypes.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredBlockTypes.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredBlockTypes[selectedIndex]) {
            handleSelectBlockType(filteredBlockTypes[selectedIndex]);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen, selectedIndex, filteredBlockTypes]);

  const toggleMenu = () => {
    if (!isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        x: rect.left,
        y: rect.top - 300, // Position menu above button
      });
    }
    setIsMenuOpen(!isMenuOpen);
    setSearchQuery('');
    setSelectedIndex(0);
  };

  const handleSelectBlockType = (blockType: BlockType) => {
    const config = blockTypeConfigs[blockType];
    
    // For blocks that support multiple instances, show enhanced creator
    if (config.supportsMultiple && userId) {
      setSelectedBlockType(blockType);
      setShowEnhanced(true);
      setIsMenuOpen(false);
    } else {
      // For single instance blocks, create directly
      const blockConfig = blockRegistry.get(blockType);
      if (!blockConfig) return;

      const newBlockData = blockConfig.defaultData;
      
      if (onCreateBlock) {
        onCreateBlock(blockType, newBlockData);
      } else if (blockEditor) {
        blockEditor.addBlock({
          type: blockType,
          data: newBlockData,
        });
      }

      setIsMenuOpen(false);
      setSearchQuery('');
      setSelectedIndex(0);
    }
  };

  const getBlockIcon = (type: BlockType) => {
    const config = blockTypeConfigs[type];
    const iconName = config.icon;
    const Icon = (Icons as any)[iconName] || Icons.FileText;
    return <Icon className="w-5 h-5" />;
  };

  const handleEnhancedClose = () => {
    setShowEnhanced(false);
    setSelectedBlockType(null);
  };

  const handleCreateNew = (blockType: BlockType, data: any) => {
    if (onCreateBlock) {
      onCreateBlock(blockType, data);
    } else if (blockEditor) {
      blockEditor.addBlock({
        type: blockType,
        data,
      });
    }
    handleEnhancedClose();
  };

  return (
    <>
      {/* Floating Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className={cn(
          "fixed bottom-8 right-8 z-50",
          "w-14 h-14 rounded-full",
          "bg-blue-600 hover:bg-blue-700 text-white",
          "shadow-lg hover:shadow-xl",
          "flex items-center justify-center",
          "transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
          isMenuOpen && "rotate-45",
          className
        )}
        aria-label="Create new block"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Block Type Selection Menu */}
      {isMenuOpen && (
        <div
          ref={menuRef}
          className="fixed z-50 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            maxHeight: '400px',
          }}
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder="Search block types..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>

          {/* Block Type List */}
          <div className="overflow-y-auto max-h-80">
            {filteredBlockTypes.length > 0 ? (
              filteredBlockTypes.map((type, index) => {
                const config = blockTypeConfigs[type];
                const isSelected = index === selectedIndex;

                return (
                  <button
                    key={type}
                    onClick={() => handleSelectBlockType(type)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "w-full px-4 py-3 flex items-start space-x-3",
                      "hover:bg-gray-50 transition-colors",
                      "text-left border-b border-gray-100",
                      isSelected && "bg-blue-50"
                    )}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getBlockIcon(type)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">
                        {config.displayName}
                      </h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {config.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {config.category}
                        </span>
                        {config.supportsMultiple && (
                          <span className="text-xs text-gray-500">
                            Multiple allowed
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-8 text-center text-gray-500">
                No matching block types found
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
            <div className="flex items-center justify-between">
              <span>↑↓ Navigate • Enter Select • Esc Close</span>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setSearchQuery('');
                  setSelectedIndex(0);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Creator Modal */}
      {showEnhanced && selectedBlockType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={handleEnhancedClose}
          />
          
          {/* Modal */}
          <div className="relative z-10">
            <BlockCreatorEnhanced
              blockType={selectedBlockType}
              userId={userId}
              onCreateNew={handleCreateNew}
              onSelectExisting={(block) => {
                if (onCreateBlock) {
                  onCreateBlock(selectedBlockType, block.data);
                } else if (blockEditor) {
                  blockEditor.addBlock({
                    type: selectedBlockType,
                    data: block.data,
                    id: block.id,
                  });
                }
                handleEnhancedClose();
              }}
              onBack={handleEnhancedClose}
            />
          </div>
        </div>
      )}
    </>
  );
}