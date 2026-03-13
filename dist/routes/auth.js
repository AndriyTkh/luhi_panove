"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthController_1 = require("../controllers/AuthController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const authController = new AuthController_1.AuthController();
/**
 * GET /auth/me
 * Get current user information
 * Automatically creates a guest user if one doesn't exist
 */
router.get('/me', auth_1.requireAuth, (req, res, next) => {
    authController.getCurrentUser(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=auth.js.map