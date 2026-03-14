import { Router, Request, Response, NextFunction } from 'express';
import { IdeaController } from '../controllers/IdeaController';
import {
  validateCreateIdea,
  validateIdeaId,
  validateEditIteration,
} from '../middleware/validation';

const router = Router();
const ideaController = new IdeaController();

/**
 * POST /ideas
 * Create a new idea with initial iteration
 * Requirements: 3.1, 3.4
 * Note: Auth middleware is applied globally in app.ts
 */
router.post('/', validateCreateIdea, (req: Request, res: Response, next: NextFunction) => {
  ideaController.createIdea(req as any, res).catch(next);
});

/**
 * GET /ideas
 * Get all ideas for the authenticated user
 * Requirements: 4.1
 * Note: Auth middleware is applied globally in app.ts
 */
router.get('/', (req: Request, res: Response, next: NextFunction) => {
  ideaController.getUserIdeas(req as any, res).catch(next);
});

/**
 * GET /ideas/:id
 * Get a specific idea by ID
 * Requirements: 4.2
 * Note: Auth middleware is applied globally in app.ts
 */
router.get('/:id', validateIdeaId, (req: Request, res: Response, next: NextFunction) => {
  ideaController.getIdeaById(req as any, res).catch(next);
});

/**
 * DELETE /ideas/:id
 * Delete an idea
 * Requirements: 5.1, 5.3
 * Note: Auth middleware is applied globally in app.ts
 */
router.delete('/:id', validateIdeaId, (req: Request, res: Response, next: NextFunction) => {
  ideaController.deleteIdea(req as any, res).catch(next);
});

/**
 * PATCH /ideas/:id/iterations/:version
 * Edit a specific iteration of an idea
 * Requirements: 7.1
 * Note: Auth middleware is applied globally in app.ts
 */
router.patch('/:id/iterations/:version', validateEditIteration, (req: Request, res: Response, next: NextFunction) => {
  ideaController.editIteration(req as any, res).catch(next);
});

export default router;
