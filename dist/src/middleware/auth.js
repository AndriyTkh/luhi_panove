"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = void 0;
const AuthService_1 = require("../services/AuthService");
const errorHandler_1 = require("./errorHandler");
const authService = new AuthService_1.AuthService();
/**
 * Extract IP address from request
 * Handles both direct connections and proxied requests
 */
function getClientIp(req) {
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
const requireAuth = async (req, res, next) => {
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
        req.user = user;
        next();
    }
    catch (error) {
        next(new errorHandler_1.AuthenticationError('Authentication failed'));
    }
};
exports.requireAuth = requireAuth;
/**
 * Optional authentication middleware
 * Attempts to authenticate but doesn't fail if user not found
 */
const optionalAuth = async (req, res, next) => {
    try {
        const ip = getClientIp(req);
        const guestId = req.cookies?.guestId;
        const user = await authService.findOrCreateGuestUser(ip, guestId);
        if (user) {
            req.user = user;
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
    }
    catch (error) {
        // Don't fail on optional auth
        next();
    }
};
exports.optionalAuth = optionalAuth;
//# sourceMappingURL=auth.js.map