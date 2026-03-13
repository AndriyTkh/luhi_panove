import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { AuthenticationError } from './errorHandler';
import { AuthenticatedRequest } from '../types';

const authService = new AuthService();

/**
 * Extract IP address from request
 * Handles both direct connections and proxied requests
 */
function getClientIp(req: Request): string {
  // Check x-forwarded-for header (for proxied requests)
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) {
    const ips = Array.isArray(forwarded) ? forwarded[0] : forwarded;
    return ips.split(',')[0].trim();
  }

  // Check x-real-ip header
  const realIp = req.headers['x-real-ip'];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fallback to req.ip or socket address
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Middleware to authenticate guest users by IP
 * Automatically creates a user if one doesn't exist
 * Attaches user to request object
 */
export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = getClientIp(req);
    const guestId = req.cookies?.guestId; // Optional: read from cookie

    // Find or create guest user
    const user = await authService.findOrCreateGuestUser(ip, guestId);

    // Set guestId cookie if not already set
    if (!req.cookies?.guestId && user.guestId) {
      res.cookie('guestId', user.guestId, {
        httpOnly: true,
        maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        sameSite: 'lax',
      });
    }

    // Attach user to request
    (req as AuthenticatedRequest).user = user as any;

    next();
  } catch (error) {
    next(new AuthenticationError('Authentication failed'));
  }
};

/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if user not found
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const ip = getClientIp(req);
    const guestId = req.cookies?.guestId;

    const user = await authService.findOrCreateGuestUser(ip, guestId);

    if (user) {
      (req as AuthenticatedRequest).user = user as any;

      // Set guestId cookie if not already set
      if (!req.cookies?.guestId && user.guestId) {
        res.cookie('guestId', user.guestId, {
          httpOnly: true,
          maxAge: 365 * 24 * 60 * 60 * 1000,
          sameSite: 'lax',
        });
      }
    }

    next();
  } catch (error) {
    // Don't fail on optional auth
    next();
  }
};
