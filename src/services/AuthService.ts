import { User, IUser } from '../models/User';
import { randomUUID } from 'crypto';
import { AuthenticationError } from '../middleware/errorHandler';

export class AuthService {
  /**
   * Find or create a guest user based on IP address
   * Optionally uses guestId from cookie for more reliable identification
   */
  async findOrCreateGuestUser(ip: string, guestId?: string): Promise<IUser> {
    try {
      let user: IUser | null = null;

      // First, try to find by guestId if provided
      if (guestId) {
        user = await User.findOne({ guestId });
      }

      // If not found by guestId, try to find by IP
      if (!user) {
        user = await User.findOne({ ip });
      }

      // If still not found, create a new guest user
      if (!user) {
        const newGuestId = randomUUID();
        user = await User.create({
          ip,
          guestId: newGuestId,
        });
      }

      return user;
    } catch (error) {
      throw new AuthenticationError('Failed to authenticate guest user');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<IUser | null> {
    try {
      return await User.findById(userId);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get user by guestId
   */
  async getUserByGuestId(guestId: string): Promise<IUser | null> {
    try {
      return await User.findOne({ guestId });
    } catch (error) {
      return null;
    }
  }
}
