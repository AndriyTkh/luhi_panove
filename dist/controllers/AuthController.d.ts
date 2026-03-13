import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
export declare class AuthController {
    /**
     * Get current user information
     * Returns the guest user created automatically by IP
     */
    getCurrentUser(req: AuthenticatedRequest, res: Response): Promise<void>;
}
//# sourceMappingURL=AuthController.d.ts.map