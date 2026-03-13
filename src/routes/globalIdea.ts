import { Router, Request, Response, NextFunction } from 'express';
import { GlobalIdeaController } from '../controllers/GlobalIdeaController';
import { validateCreateGlobalIdea } from '../middleware/validation';

const router = Router();
const globalIdeaController = new GlobalIdeaController();

/**
 * GET /global-idea
 * Get global idea for current date (public endpoint - no authentication required)
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  globalIdeaController.getGlobalIdea(req, res).catch(next);
});

/**
 * POST /global-idea
 * Create a new global idea (optional - for admin use)
 * Requirements: 8.1, 8.2
 */
router.post('/', validateCreateGlobalIdea, (req: Request, res: Response, next: NextFunction) => {
  globalIdeaController.createGlobalIdea(req, res).catch(next);
});

export default router;
