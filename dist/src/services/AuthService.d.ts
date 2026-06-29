import { IUser } from '../models/User';
export declare class AuthService {
    /**
     * Find or create a guest user based on IP address
     * Optionally uses guestId from cookie for more reliable identification
     */
    findOrCreateGuestUser(ip: string, guestId?: string): Promise<IUser>;
    /**
     * Get user by ID
     */
    getUserById(userId: string): Promise<IUser | null>;
    /**
     * Get user by guestId
     */
    getUserByGuestId(guestId: string): Promise<IUser | null>;
}
//# sourceMappingURL=AuthService.d.ts.map