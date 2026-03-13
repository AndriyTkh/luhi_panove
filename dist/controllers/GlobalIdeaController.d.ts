import { Request, Response } from 'express';
/**
 * GlobalIdeaController handles HTTP requests for global ideas
 * Requirements: 8.1, 8.2, 8.3
 */
export declare class GlobalIdeaController {
    private globalIdeaService;
    constructor();
    /**
     * Get global idea for current date (public endpoint)
     * GET /global-idea
     * Requirements: 8.1, 8.2, 8.3, 8.4
     */
    getGlobalIdea(_req: Request, res: Response): Promise<void>;
    /**
     * Create a new global idea (admin only - optional)
     * POST /global-idea
     * Requirements: 8.1, 8.2
     */
    createGlobalIdea(req: Request, res: Response): Promise<void>;
    /**
     * Helper method to format global idea for response
     */
    private formatGlobalIdeaResponse;
}
//# sourceMappingURL=GlobalIdeaController.d.ts.map