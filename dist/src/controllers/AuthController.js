"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
class AuthController {
    /**
     * Get current user information
     * Returns the guest user created automatically by IP
     */
    async getCurrentUser(req, res) {
        const user = req.user;
        const response = {
            id: user._id.toString(),
            guestId: user.guestId,
            ip: user.ip,
            createdAt: user.createdAt.toISOString(),
        };
        res.json(response);
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=AuthController.js.map