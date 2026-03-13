import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
/**
 * IdeaController handles HTTP requests for idea management
 * Requirements: 3.1, 3.4, 4.1, 4.2, 5.1, 5.3, 6.1, 6.6, 7.1
 */
export declare class IdeaController {
    private ideaService;
    private geminiService;
    constructor();
    /**
     * Create a new idea with initial iteration
     * POST /ideas
     * Requirements: 3.1, 3.4
     */
    createIdea(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get all ideas for the authenticated user
     * GET /ideas
     * Requirements: 4.1
     */
    getUserIdeas(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Get a specific idea by ID
     * GET /ideas/:id
     * Requirements: 4.2
     */
    getIdeaById(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Delete an idea
     * DELETE /ideas/:id
     * Requirements: 5.1, 5.3
     */
    deleteIdea(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Improve an idea using Gemini AI
     * POST /ideas/:id/improve
     * Requirements: 6.1, 6.6
     */
    improveIdea(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Edit a specific iteration of an idea
     * PATCH /ideas/:id/iterations/:version
     * Requirements: 7.1
     */
    editIteration(req: AuthenticatedRequest, res: Response): Promise<void>;
    /**
     * Helper method to format idea for response
     */
    private formatIdeaResponse;
    /**
     * Helper method to format iteration for response
     */
    private formatIterationResponse;
}
//# sourceMappingURL=IdeaController.d.ts.map