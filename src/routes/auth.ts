import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { requireAuth } from '../middleware/auth';

const router = Router();
const authController = new AuthController();

/**
 * GET /auth/me
 * Get current user information
 * Automatically creates a guest user if one doesn't exist
 */
router.get('/me', requireAuth, (req, res, next) => {
  authController.getCurrentUser(req as any, res).catch(next);
});

export default router;
