"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const User_1 = require("../models/User");
const crypto_1 = require("crypto");
const errorHandler_1 = require("../middleware/errorHandler");
class AuthService {
    /**
     * Find or create a guest user based on IP address
     * Optionally uses guestId from cookie for more reliable identification
     */
    async findOrCreateGuestUser(ip, guestId) {
        try {
            let user = null;
            // First, try to find by guestId if provided
            if (guestId) {
                user = await User_1.User.findOne({ guestId });
            }
            // If not found by guestId, try to find by IP
            if (!user) {
                user = await User_1.User.findOne({ ip });
            }
            // If still not found, create a new guest user
            if (!user) {
                const newGuestId = (0, crypto_1.randomUUID)();
                user = await User_1.User.create({
                    ip,
                    guestId: newGuestId,
                });
            }
            return user;
        }
        catch (error) {
            throw new errorHandler_1.AuthenticationError('Failed to authenticate guest user');
        }
    }
    /**
     * Get user by ID
     */
    async getUserById(userId) {
        try {
            return await User_1.User.findById(userId);
        }
        catch (error) {
            return null;
        }
    }
    /**
     * Get user by guestId
     */
    async getUserByGuestId(guestId) {
        try {
            return await User_1.User.findOne({ guestId });
        }
        catch (error) {
            return null;
        }
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map