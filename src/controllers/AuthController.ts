import { Response } from 'express';
import { AuthenticatedRequest, UserResponse } from '../types';

export class AuthController {
  /**
   * Get current user information
   * Returns the guest user created automatically by IP
   */
  async getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    const user = req.user;

    const response: UserResponse = {
      id: user._id.toString(),
      guestId: user.guestId,
      ip: user.ip,
      createdAt: user.createdAt.toISOString(),
    };

    res.json(response);
  }
}
