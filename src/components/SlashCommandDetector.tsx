/**
 * Slash Command Detector Component
 * 
 * Detects slash commands in text inputs and triggers block creation menu
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BlockType, blockTypeConfigs } from '../config/blockEditorConfig';
import { blockRegistry } from '../blocks/registry';
import { cn } from '../lib/utils';
import { useBlockEditor } from './blocks/BlockEditorWrapper';

interface SlashCommandDetectorProps {
  onSelectBlockType?: (blockType: BlockType, data?: any) => void;
  containerRef?: React.RefObject<HTMLElement>;
  enabled?: boolean;
}

interface MenuPosition {
  x: number;
  y: number;
}

export function SlashCommandDetector({ 
  onSelectBlockType, 
  containerRef,
  enabled = true 
}: SlashCommandDetectorProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<MenuPosition>({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeElement, setActiveElement] = useState<HTMLElement | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
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

  // Get caret position in viewport coordinates
  const getCaretPosition = useCallback((): MenuPosition | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    
    return {
      x: rect.left,
      y: rect.bottom + 5, // Position menu below cursor
    };
  }, []);

  // Detect slash command
  const detectSlashCommand = useCallback((e: KeyboardEvent) => {
    if (!enabled || e.key !== '/') return;

    const target = e.target as HTMLElement;
    const isEditable = 
      target.contentEditable === 'true' ||
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA';

    if (!isEditable) return;

    // Check if we're in the container (if specified)
    if (containerRef?.current && !containerRef.current.contains(target)) {
      return;
    }

    // Get the current text content before the slash
    let textBeforeCaret = '';
    
    if (target.contentEditable === 'true') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const textNode = range.startContainer;
        textBeforeCaret = textNode.textContent?.substring(0, range.startOffset) || '';
      }
    } else if ('selectionStart' in target) {
      const input = target as HTMLInputElement | HTMLTextAreaElement;
      textBeforeCaret = input.value.substring(0, input.selectionStart || 0);
    }

    // Only trigger if slash is at start of line or after whitespace
    const shouldTrigger = textBeforeCaret === '' || /\s$/.test(textBeforeCaret);
    
    if (shouldTrigger) {
      e.preventDefault();
      const position = getCaretPosition();
      if (position) {
        setMenuPosition(position);
        setIsMenuOpen(true);
        setSearchQuery('');
        setSelectedIndex(0);
        setActiveElement(target);
      }
    }
  }, [enabled, containerRef, getCaretPosition]);

  // Handle input after slash command
  const handleMenuInput = useCallback((e: KeyboardEvent) => {
    if (!isMenuOpen || !activeElement) return;

    // Handle special keys
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        closeMenu();
        break;
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
      case 'Backspace':
        if (searchQuery === '') {
          closeMenu();
        } else {
          setSearchQuery(prev => prev.slice(0, -1));
          setSelectedIndex(0);
        }
        break;
      default:
        // Add character to search if it's alphanumeric
        if (e.key.length === 1 && /[a-zA-Z0-9\s]/.test(e.key)) {
          e.preventDefault();
          setSearchQuery(prev => prev + e.key);
          setSelectedIndex(0);
        }
    }
  }, [isMenuOpen, activeElement, searchQuery, selectedIndex, filteredBlockTypes]);

  const handleSelectBlockType = (blockType: BlockType) => {
    const config = blockRegistry.get(blockType);
    if (!config) return;

    // Create new block with default data
    const newBlockData = config.defaultData;
    
    if (onSelectBlockType) {
      onSelectBlockType(blockType, newBlockData);
    } else if (blockEditor) {
      // Use block editor if available
      blockEditor.addBlock({
        type: blockType,
        data: newBlockData,
      });
    }

    closeMenu();
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setSearchQuery('');
    setSelectedIndex(0);
    setActiveElement(null);
  };

  // Set up event listeners
  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('keydown', detectSlashCommand);
    return () => document.removeEventListener('keydown', detectSlashCommand);
  }, [enabled, detectSlashCommand]);

  useEffect(() => {
    if (!isMenuOpen) return;

    document.addEventListener('keydown', handleMenuInput);
    return () => document.removeEventListener('keydown', handleMenuInput);
  }, [isMenuOpen, handleMenuInput]);

  // Handle click outside
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        closeMenu();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const getBlockIcon = (type: BlockType) => {
    const config = blockTypeConfigs[type];
    // This is simplified - in a real app you'd import actual Lucide icons
    return <div className="w-4 h-4 bg-gray-300 rounded" />;
  };

  if (!isMenuOpen) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-50 w-72 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden"
      style={{
        left: `${menuPosition.x}px`,
        top: `${menuPosition.y}px`,
        maxHeight: '300px',
      }}
    >
      {/* Search Display */}
      <div className="px-3 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-gray-500">/</span>
          <span className="font-medium text-gray-900">{searchQuery}</span>
          <span className="text-gray-400 text-xs">
            {filteredBlockTypes.length} results
          </span>
        </div>
      </div>

      {/* Block Type List */}
      <div className="overflow-y-auto max-h-64">
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
                  "w-full px-3 py-2 flex items-center space-x-3",
                  "hover:bg-gray-50 transition-colors",
                  "text-left",
                  isSelected && "bg-blue-50"
                )}
              >
                <div className="flex-shrink-0">
                  {getBlockIcon(type)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 text-sm truncate">
                    {config.displayName}
                  </h4>
                  <p className="text-xs text-gray-500 truncate">
                    {config.description}
                  </p>
                </div>
              </button>
            );
          })
        ) : (
          <div className="px-3 py-4 text-center text-sm text-gray-500">
            No matching blocks
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 bg-gray-50 border-t border-gray-200 text-xs text-gray-500">
        <span>↑↓ Navigate • Enter Select • Esc Cancel</span>
      </div>
    </div>
  );
}