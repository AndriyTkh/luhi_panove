import { Request, Response, NextFunction } from 'express';
/**
 * Middleware to authenticate guest users by IP
 * Automatically creates a user if one doesn't exist
 * Attaches user to request object
 */
export declare const requireAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if user not found
 */
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.d.ts.map