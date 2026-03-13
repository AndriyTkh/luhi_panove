/**
 * Unit tests for IdeaService
 * Tests CRUD operations with specific examples and edge cases
 */

import { IdeaService } from '../../../src/services/IdeaService';
import { AuthService } from '../../../src/services/AuthService';
import { AuthorizationError, NotFoundError } from '../../../src/middleware/errorHandler';

describe('IdeaService', () => {
  let ideaService: IdeaService;
  let authService: AuthService;
  let userId: string;
  let otherUserId: string;

  beforeEach(async () => {
    ideaService = new IdeaService();
    authService = new AuthService();
    
    // Create test users
    const user = await authService.findOrCreateGuestUser('192.168.1.1');
    userId = user._id.toString();
    
    const otherUser = await authService.findOrCreateGuestUser('192.168.1.2');
    otherUserId = otherUser._id.toString();
  });

  describe('createIdea', () => {
    test('creates idea with initial iteration version 1', async () => {
      const title = 'Test Idea';
      const description = 'Test Description';
      
      const idea = await ideaService.createIdea(userId, title, description);
      
      expect(idea).toBeDefined();
      expect(idea.userId.toString()).toBe(userId);
      expect(idea.iterations).toHaveLength(1);
      expect(idea.iterations[0].version).toBe(1);
      expect(idea.iterations[0].title).toBe(title);
      expect(idea.iterations[0].description).toBe(description);
      expect(idea.iterations[0].plan).toEqual([]);
      expect(idea.iterations[0].ranking).toEqual({
        originality: 0,
        difficulty: 0,
        marketPotential: 0,
        scalability: 0,
      });
    });

    test('creates idea with empty title', async () => {
      const idea = await ideaService.createIdea(userId, '', 'Description');
      
      expect(idea.iterations[0].title).toBe('');
    });

    test('creates idea with empty description', async () => {
      const idea = await ideaService.createIdea(userId, 'Title', '');
      
      expect(idea.iterations[0].description).toBe('');
    });

    test('creates idea with very long title', async () => {
      const longTitle = 'A'.repeat(1000);
      
      const idea = await ideaService.createIdea(userId, longTitle, 'Description');
      
      expect(idea.iterations[0].title).toBe(longTitle);
    });

    test('creates idea with special characters', async () => {
      const specialTitle = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const specialDesc = '特殊字符 émojis 🚀 ñ';
      
      const idea = await ideaService.createIdea(userId, specialTitle, specialDesc);
      
      expect(idea.iterations[0].title).toBe(specialTitle);
      expect(idea.iterations[0].description).toBe(specialDesc);
    });

    test('sets createdAt timestamp automatically', async () => {
      const before = new Date();
      const idea = await ideaService.createIdea(userId, 'Title', 'Description');
      const after = new Date();
      
      expect(idea.iterations[0].createdAt).toBeDefined();
      expect(idea.iterations[0].createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(idea.iterations[0].createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe('getUserIdeas', () => {
    test('returns empty array when user has no ideas', async () => {
      const ideas = await ideaService.getUserIdeas(userId);
      
      expect(ideas).toEqual([]);
    });

    test('returns all ideas for user', async () => {
      await ideaService.createIdea(userId, 'Idea 1', 'Description 1');
      await ideaService.createIdea(userId, 'Idea 2', 'Description 2');
      await ideaService.createIdea(userId, 'Idea 3', 'Description 3');
      
      const ideas = await ideaService.getUserIdeas(userId);
      
      expect(ideas).toHaveLength(3);
      expect(ideas[0].iterations[0].title).toBe('Idea 1');
      expect(ideas[1].iterations[0].title).toBe('Idea 2');
      expect(ideas[2].iterations[0].title).toBe('Idea 3');
    });

    test('returns only ideas belonging to specific user', async () => {
      await ideaService.createIdea(userId, 'User 1 Idea', 'Description');
      await ideaService.createIdea(otherUserId, 'User 2 Idea', 'Description');
      
      const ideas = await ideaService.getUserIdeas(userId);
      
      expect(ideas).toHaveLength(1);
      expect(ideas[0].iterations[0].title).toBe('User 1 Idea');
    });
  });

  describe('getIdeaById', () => {
    test('returns idea when it belongs to user', async () => {
      const created = await ideaService.createIdea(userId, 'Test', 'Description');
      
      const idea = await ideaService.getIdeaById(created._id.toString(), userId);
      
      expect(idea).toBeDefined();
      expect(idea._id.toString()).toBe(created._id.toString());
    });

    test('throws NotFoundError when idea does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      await expect(
        ideaService.getIdeaById(nonExistentId, userId)
      ).rejects.toThrow(NotFoundError);
    });

    test('throws AuthorizationError when idea belongs to different user', async () => {
      const created = await ideaService.createIdea(userId, 'Test', 'Description');
      
      await expect(
        ideaService.getIdeaById(created._id.toString(), otherUserId)
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe('deleteIdea', () => {
    test('deletes idea when it belongs to user', async () => {
      const created = await ideaService.createIdea(userId, 'Test', 'Description');
      
      await ideaService.deleteIdea(created._id.toString(), userId);
      
      await expect(
        ideaService.getIdeaById(created._id.toString(), userId)
      ).rejects.toThrow(NotFoundError);
    });

    test('throws NotFoundError when idea does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      await expect(
        ideaService.deleteIdea(nonExistentId, userId)
      ).rejects.toThrow(NotFoundError);
    });

    test('throws AuthorizationError when idea belongs to different user', async () => {
      const created = await ideaService.createIdea(userId, 'Test', 'Description');
      
      await expect(
        ideaService.deleteIdea(created._id.toString(), otherUserId)
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe('addIteration', () => {
    test('adds new iteration with incremented version', async () => {
      const created = await ideaService.createIdea(userId, 'Original', 'Original Description');
      
      const updated = await ideaService.addIteration(created._id.toString(), {
        title: 'Improved',
        description: 'Improved Description',
        plan: ['Step 1', 'Step 2'],
        ranking: {
          originality: 75,
          difficulty: 60,
          marketPotential: 80,
          scalability: 70,
        },
      });
      
      expect(updated.iterations).toHaveLength(2);
      expect(updated.iterations[1].version).toBe(2);
      expect(updated.iterations[1].title).toBe('Improved');
      expect(updated.iterations[1].description).toBe('Improved Description');
      expect(updated.iterations[1].plan).toEqual(['Step 1', 'Step 2']);
    });

    test('adds multiple iterations with sequential versions', async () => {
      const created = await ideaService.createIdea(userId, 'Original', 'Description');
      
      await ideaService.addIteration(created._id.toString(), {
        title: 'V2',
        description: 'V2 Description',
        plan: [],
        ranking: { originality: 50, difficulty: 50, marketPotential: 50, scalability: 50 },
      });
      
      const updated = await ideaService.addIteration(created._id.toString(), {
        title: 'V3',
        description: 'V3 Description',
        plan: [],
        ranking: { originality: 60, difficulty: 60, marketPotential: 60, scalability: 60 },
      });
      
      expect(updated.iterations).toHaveLength(3);
      expect(updated.iterations[0].version).toBe(1);
      expect(updated.iterations[1].version).toBe(2);
      expect(updated.iterations[2].version).toBe(3);
    });

    test('throws NotFoundError when idea does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      await expect(
        ideaService.addIteration(nonExistentId, {
          title: 'Test',
          description: 'Test',
          plan: [],
          ranking: { originality: 0, difficulty: 0, marketPotential: 0, scalability: 0 },
        })
      ).rejects.toThrow(NotFoundError);
    });

    test('handles empty plan array', async () => {
      const created = await ideaService.createIdea(userId, 'Test', 'Description');
      
      const updated = await ideaService.addIteration(created._id.toString(), {
        title: 'Improved',
        description: 'Improved',
        plan: [],
        ranking: { originality: 50, difficulty: 50, marketPotential: 50, scalability: 50 },
      });
      
      expect(updated.iterations[1].plan).toEqual([]);
    });

    test('handles boundary ranking values (0 and 100)', async () => {
      const created = await ideaService.createIdea(userId, 'Test', 'Description');
      
      const updated = await ideaService.addIteration(created._id.toString(), {
        title: 'Improved',
        description: 'Improved',
        plan: [],
        ranking: { originality: 0, difficulty: 100, marketPotential: 0, scalability: 100 },
      });
      
      expect(updated.iterations[1].ranking).toEqual({
        originality: 0,
        difficulty: 100,
        marketPotential: 0,
        scalability: 100,
      });
    });
  });

  describe('updateIteration', () => {
    test('updates title only', async () => {
      const created = await ideaService.createIdea(userId, 'Original', 'Original Description');
      const originalCreatedAt = created.iterations[0].createdAt;
      
      const updated = await ideaService.updateIteration(
        created._id.toString(),
        1,
        { title: 'Updated Title' }
      );
      
      expect(updated.iterations[0].title).toBe('Updated Title');
      expect(updated.iterations[0].description).toBe('Original Description');
      expect(updated.iterations[0].version).toBe(1);
      expect(updated.iterations[0].createdAt).toEqual(originalCreatedAt);
    });

    test('updates description only', async () => {
      const created = await ideaService.createIdea(userId, 'Title', 'Original Description');
      
      const updated = await ideaService.updateIteration(
        created._id.toString(),
        1,
        { description: 'Updated Description' }
      );
      
      expect(updated.iterations[0].title).toBe('Title');
      expect(updated.iterations[0].description).toBe('Updated Description');
    });

    test('updates plan only', async () => {
      const created = await ideaService.createIdea(userId, 'Title', 'Description');
      
      const updated = await ideaService.updateIteration(
        created._id.toString(),
        1,
        { plan: ['New Step 1', 'New Step 2'] }
      );
      
      expect(updated.iterations[0].plan).toEqual(['New Step 1', 'New Step 2']);
    });

    test('updates multiple fields at once', async () => {
      const created = await ideaService.createIdea(userId, 'Original', 'Original Description');
      
      const updated = await ideaService.updateIteration(
        created._id.toString(),
        1,
        {
          title: 'Updated Title',
          description: 'Updated Description',
          plan: ['Step 1', 'Step 2', 'Step 3'],
        }
      );
      
      expect(updated.iterations[0].title).toBe('Updated Title');
      expect(updated.iterations[0].description).toBe('Updated Description');
      expect(updated.iterations[0].plan).toEqual(['Step 1', 'Step 2', 'Step 3']);
    });

    test('preserves version number', async () => {
      const created = await ideaService.createIdea(userId, 'Title', 'Description');
      
      const updated = await ideaService.updateIteration(
        created._id.toString(),
        1,
        { title: 'Updated' }
      );
      
      expect(updated.iterations[0].version).toBe(1);
    });

    test('preserves createdAt timestamp', async () => {
      const created = await ideaService.createIdea(userId, 'Title', 'Description');
      const originalCreatedAt = created.iterations[0].createdAt;
      
      // Wait a bit to ensure timestamp would change if not preserved
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updated = await ideaService.updateIteration(
        created._id.toString(),
        1,
        { title: 'Updated' }
      );
      
      expect(updated.iterations[0].createdAt).toEqual(originalCreatedAt);
    });

    test('throws NotFoundError when idea does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      await expect(
        ideaService.updateIteration(nonExistentId, 1, { title: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });

    test('throws NotFoundError when iteration version does not exist', async () => {
      const created = await ideaService.createIdea(userId, 'Title', 'Description');
      
      await expect(
        ideaService.updateIteration(created._id.toString(), 999, { title: 'Updated' })
      ).rejects.toThrow(NotFoundError);
    });

    test('updates specific iteration in multi-iteration idea', async () => {
      const created = await ideaService.createIdea(userId, 'V1', 'V1 Description');
      await ideaService.addIteration(created._id.toString(), {
        title: 'V2',
        description: 'V2 Description',
        plan: [],
        ranking: { originality: 50, difficulty: 50, marketPotential: 50, scalability: 50 },
      });
      
      const updated = await ideaService.updateIteration(
        created._id.toString(),
        1,
        { title: 'V1 Updated' }
      );
      
      expect(updated.iterations[0].title).toBe('V1 Updated');
      expect(updated.iterations[1].title).toBe('V2'); // Should not change
    });
  });
});
