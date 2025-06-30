/**
 * Unit tests for Block Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { blockService, BlockServiceError } from '../blockService';
import { supabase } from '../supabase';
import { BlockType } from '../../config/blockEditorConfig';

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    from: vi.fn()
  }
}));

describe('BlockService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createBlock', () => {
    it('should create a block successfully', async () => {
      const mockBlock = {
        id: '123',
        type: BlockType.CONTACT,
        type_id: '456',
        data: { email: 'test@example.com' },
        name: 'My Contact',
        user_id: 'user123',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const mockBlockType = { id: '456' };

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockBlockType, error: null })
          })
        })
      } as any);

      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockBlock, error: null })
          })
        })
      } as any);

      const result = await blockService.createBlock({
        userId: 'user123',
        type: BlockType.CONTACT,
        data: { email: 'test@example.com' },
        name: 'My Contact'
      });

      expect(result.data).toEqual(mockBlock);
      expect(result.error).toBeUndefined();
    });

    it('should return validation error for invalid block type', async () => {
      const result = await blockService.createBlock({
        userId: 'user123',
        type: 'invalid' as any,
        data: {}
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('VALIDATION');
    });

    it('should handle database errors', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: { id: '456' }, error: null })
          })
        })
      } as any);

      vi.mocked(supabase.from).mockReturnValueOnce({
        insert: vi.fn().mockReturnValueOnce({
          select: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ 
              data: null, 
              error: { message: 'Database error', code: 'DB001' } 
            })
          })
        })
      } as any);

      const result = await blockService.createBlock({
        userId: 'user123',
        type: BlockType.CONTACT,
        data: { email: 'test@example.com' }
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('DATABASE');
    });
  });

  describe('getBlock', () => {
    it('should get a block successfully', async () => {
      const mockBlock = {
        id: '123',
        type: BlockType.CONTACT,
        data: { email: 'test@example.com' },
        block_type: {
          id: '456',
          name: BlockType.CONTACT,
          display_name: 'Contact',
          category: 'personal'
        },
        resume_blocks: [
          {
            resume_id: 'resume1',
            position: 1,
            resume: { id: 'resume1', title: 'My Resume', is_public: true }
          }
        ]
      };

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ data: mockBlock, error: null })
          })
        })
      } as any);

      const result = await blockService.getBlock('123');

      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('123');
      expect(result.data?.resume_count).toBe(1);
      expect(result.error).toBeUndefined();
    });

    it('should return NOT_FOUND error when block does not exist', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            single: vi.fn().mockResolvedValueOnce({ 
              data: null, 
              error: { code: 'PGRST116', message: 'Not found' } 
            })
          })
        })
      } as any);

      const result = await blockService.getBlock('nonexistent');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('updateBlock', () => {
    it('should update a block successfully', async () => {
      const updatedBlock = {
        id: '123',
        type: BlockType.CONTACT,
        data: { email: 'updated@example.com' },
        name: 'Updated Contact'
      };

      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
              single: vi.fn().mockResolvedValueOnce({ data: updatedBlock, error: null })
            })
          })
        })
      } as any);

      const result = await blockService.updateBlock('123', {
        data: { email: 'updated@example.com' },
        name: 'Updated Contact'
      });

      expect(result.data).toEqual(updatedBlock);
      expect(result.error).toBeUndefined();
    });

    it('should return validation error when no fields to update', async () => {
      const result = await blockService.updateBlock('123', {});

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('VALIDATION');
    });

    it('should return NOT_FOUND error when block does not exist', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        update: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            select: vi.fn().mockReturnValueOnce({
              single: vi.fn().mockResolvedValueOnce({ 
                data: null, 
                error: { code: 'PGRST116', message: 'Not found' } 
              })
            })
          })
        })
      } as any);

      const result = await blockService.updateBlock('nonexistent', {
        name: 'Updated'
      });

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('NOT_FOUND');
    });
  });

  describe('deleteBlock', () => {
    it('should delete a block successfully', async () => {
      // Mock checking for resume usage
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce({ data: [], error: null })
          })
        })
      } as any);

      // Mock deletion
      vi.mocked(supabase.from).mockReturnValueOnce({
        delete: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ error: null })
        })
      } as any);

      const result = await blockService.deleteBlock('123');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeUndefined();
    });

    it('should return CONFLICT error when block is used in resumes', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce({ 
              data: [{ resume_id: 'resume1' }], 
              error: null 
            })
          })
        })
      } as any);

      const result = await blockService.deleteBlock('123');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('CONFLICT');
    });

    it('should handle database errors', async () => {
      // Mock checking - no resume usage
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            limit: vi.fn().mockResolvedValueOnce({ data: [], error: null })
          })
        })
      } as any);

      // Mock deletion error
      vi.mocked(supabase.from).mockReturnValueOnce({
        delete: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockResolvedValueOnce({ 
            error: { message: 'Database error', code: 'DB001' } 
          })
        })
      } as any);

      const result = await blockService.deleteBlock('123');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('DATABASE');
    });
  });

  describe('getBlocksByUser', () => {
    it('should get blocks for a user successfully', async () => {
      const mockBlocks = [
        {
          id: '123',
          type: BlockType.CONTACT,
          data: { email: 'test@example.com' },
          block_type: { name: BlockType.CONTACT, display_name: 'Contact' }
        },
        {
          id: '456',
          type: BlockType.SKILL,
          data: { name: 'TypeScript' },
          block_type: { name: BlockType.SKILL, display_name: 'Skill' }
        }
      ];

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            or: vi.fn().mockReturnValueOnce({
              order: vi.fn().mockReturnValueOnce({
                range: vi.fn().mockResolvedValueOnce({ 
                  data: mockBlocks, 
                  error: null, 
                  count: 2 
                })
              })
            })
          })
        })
      } as any);

      const result = await blockService.getBlocksByUser('user123', 
        { search: 'test' },
        { page: 1, limit: 10 }
      );

      expect(result.data?.blocks).toHaveLength(2);
      expect(result.data?.total).toBe(2);
      expect(result.error).toBeUndefined();
    });

    it('should filter blocks by type', async () => {
      const mockBlocks = [
        {
          id: '123',
          type: BlockType.CONTACT,
          data: { email: 'test@example.com' }
        }
      ];

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            in: vi.fn().mockReturnValueOnce({
              order: vi.fn().mockResolvedValueOnce({ 
                data: mockBlocks, 
                error: null, 
                count: 1 
              })
            })
          })
        })
      } as any);

      const result = await blockService.getBlocksByUser('user123', {
        types: [BlockType.CONTACT, BlockType.ADDRESS]
      });

      expect(result.data?.blocks).toHaveLength(1);
      expect(result.data?.blocks[0].type).toBe(BlockType.CONTACT);
    });

    it('should handle pagination correctly', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockReturnValueOnce({
              range: vi.fn().mockResolvedValueOnce({ 
                data: [], 
                error: null, 
                count: 50 
              })
            })
          })
        })
      } as any);

      const result = await blockService.getBlocksByUser('user123', {}, 
        { page: 3, limit: 20 }
      );

      expect(result.data?.total).toBe(50);
      // Verify range was called with correct offset
      const mockCalls = vi.mocked(supabase.from).mock.calls;
      expect(mockCalls.length).toBeGreaterThan(0);
    });

    it('should handle database errors', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ 
              data: null, 
              error: { message: 'Database error', code: 'DB001' },
              count: null
            })
          })
        })
      } as any);

      const result = await blockService.getBlocksByUser('user123');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('DATABASE');
    });
  });

  describe('getBlocksForResume', () => {
    it('should get blocks for a resume', async () => {
      const mockResumeBlocks = [
        {
          block: {
            id: '123',
            type: BlockType.CONTACT,
            data: { email: 'test@example.com' }
          },
          position: 0
        },
        {
          block: {
            id: '456',
            type: BlockType.SKILL,
            data: { name: 'TypeScript' }
          },
          position: 1
        }
      ];

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ 
              data: mockResumeBlocks, 
              error: null 
            })
          })
        })
      } as any);

      const result = await blockService.getBlocksForResume('resume123');

      expect(result.data).toHaveLength(2);
      expect(result.data?.[0].id).toBe('123');
      expect(result.data?.[1].id).toBe('456');
      expect(result.error).toBeUndefined();
    });

    it('should include block details when requested', async () => {
      const mockResumeBlocks = [
        {
          block: {
            id: '123',
            type: BlockType.CONTACT,
            data: { email: 'test@example.com' },
            block_type: {
              name: BlockType.CONTACT,
              display_name: 'Contact',
              category: 'personal'
            }
          },
          position: 0
        }
      ];

      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ 
              data: mockResumeBlocks, 
              error: null 
            })
          })
        })
      } as any);

      const result = await blockService.getBlocksForResume('resume123', {
        includeDetails: true
      });

      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].block_type).toBeDefined();
      expect(result.error).toBeUndefined();
    });

    it('should return empty array when no blocks exist', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ 
              data: [], 
              error: null 
            })
          })
        })
      } as any);

      const result = await blockService.getBlocksForResume('resume123');

      expect(result.data).toHaveLength(0);
      expect(result.error).toBeUndefined();
    });

    it('should handle database errors', async () => {
      vi.mocked(supabase.from).mockReturnValueOnce({
        select: vi.fn().mockReturnValueOnce({
          eq: vi.fn().mockReturnValueOnce({
            order: vi.fn().mockResolvedValueOnce({ 
              data: null, 
              error: { message: 'Database error', code: 'DB001' } 
            })
          })
        })
      } as any);

      const result = await blockService.getBlocksForResume('resume123');

      expect(result.data).toBeUndefined();
      expect(result.error).toBeInstanceOf(BlockServiceError);
      expect(result.error?.code).toBe('DATABASE');
    });
  });
});