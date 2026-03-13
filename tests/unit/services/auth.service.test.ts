/**
 * Unit tests for AuthService
 * Tests IP-based guest user authentication with specific examples and edge cases
 */

import { AuthService } from '../../../src/services/AuthService';
import { User } from '../../../src/models/User';
import { AuthenticationError } from '../../../src/middleware/errorHandler';

describe('AuthService', () => {
  let authService: AuthService;

  beforeEach(() => {
    authService = new AuthService();
  });

  describe('findOrCreateGuestUser', () => {
    test('creates new user when IP does not exist', async () => {
      const ip = '192.168.1.100';
      
      const user = await authService.findOrCreateGuestUser(ip);
      
      expect(user).toBeDefined();
      expect(user.ip).toBe(ip);
      expect(user.guestId).toBeDefined();
      expect(user.createdAt).toBeDefined();
    });

    test('returns existing user when IP exists', async () => {
      const ip = '192.168.1.101';
      
      // Create first user
      const firstUser = await authService.findOrCreateGuestUser(ip);
      
      // Try to create again with same IP
      const secondUser = await authService.findOrCreateGuestUser(ip);
      
      expect(secondUser._id.toString()).toBe(firstUser._id.toString());
      expect(secondUser.ip).toBe(ip);
    });

    test('finds user by guestId when provided', async () => {
      const ip1 = '192.168.1.102';
      const ip2 = '192.168.1.103';
      
      // Create user with first IP
      const user1 = await authService.findOrCreateGuestUser(ip1);
      const guestId = user1.guestId!;
      
      // Try to find with different IP but same guestId
      const user2 = await authService.findOrCreateGuestUser(ip2, guestId);
      
      // Should return the same user (found by guestId, not IP)
      expect(user2._id.toString()).toBe(user1._id.toString());
      expect(user2.guestId).toBe(guestId);
    });

    test('creates new user when guestId does not exist', async () => {
      const ip = '192.168.1.104';
      const nonExistentGuestId = 'non-existent-uuid';
      
      const user = await authService.findOrCreateGuestUser(ip, nonExistentGuestId);
      
      expect(user).toBeDefined();
      expect(user.ip).toBe(ip);
      // Should create new guestId, not use the non-existent one
      expect(user.guestId).toBeDefined();
    });

    test('handles IPv6 addresses', async () => {
      const ipv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
      
      const user = await authService.findOrCreateGuestUser(ipv6);
      
      expect(user).toBeDefined();
      expect(user.ip).toBe(ipv6);
    });

    test('handles localhost IP', async () => {
      const localhost = '127.0.0.1';
      
      const user = await authService.findOrCreateGuestUser(localhost);
      
      expect(user).toBeDefined();
      expect(user.ip).toBe(localhost);
    });

    test('generates unique guestId for each new user', async () => {
      const user1 = await authService.findOrCreateGuestUser('192.168.1.105');
      const user2 = await authService.findOrCreateGuestUser('192.168.1.106');
      
      expect(user1.guestId).toBeDefined();
      expect(user2.guestId).toBeDefined();
      expect(user1.guestId).not.toBe(user2.guestId);
    });

    test('handles empty IP string gracefully', async () => {
      const emptyIp = '';
      
      const user = await authService.findOrCreateGuestUser(emptyIp);
      
      expect(user).toBeDefined();
      expect(user.ip).toBe(emptyIp);
    });
  });

  describe('getUserById', () => {
    test('returns user when ID exists', async () => {
      const createdUser = await authService.findOrCreateGuestUser('192.168.1.107');
      
      const foundUser = await authService.getUserById(createdUser._id.toString());
      
      expect(foundUser).toBeDefined();
      expect(foundUser!._id.toString()).toBe(createdUser._id.toString());
    });

    test('returns null when ID does not exist', async () => {
      const nonExistentId = '507f1f77bcf86cd799439011';
      
      const user = await authService.getUserById(nonExistentId);
      
      expect(user).toBeNull();
    });

    test('returns null for invalid ID format', async () => {
      const invalidId = 'invalid-id-format';
      
      const user = await authService.getUserById(invalidId);
      
      expect(user).toBeNull();
    });
  });

  describe('getUserByGuestId', () => {
    test('returns user when guestId exists', async () => {
      const createdUser = await authService.findOrCreateGuestUser('192.168.1.108');
      
      const foundUser = await authService.getUserByGuestId(createdUser.guestId!);
      
      expect(foundUser).toBeDefined();
      expect(foundUser!.guestId).toBe(createdUser.guestId);
    });

    test('returns null when guestId does not exist', async () => {
      const nonExistentGuestId = 'non-existent-guest-id';
      
      const user = await authService.getUserByGuestId(nonExistentGuestId);
      
      expect(user).toBeNull();
    });
  });
});
