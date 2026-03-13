"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobalIdeaController = void 0;
const GlobalIdeaService_1 = require("../services/GlobalIdeaService");
const errorHandler_1 = require("../middleware/errorHandler");
const { validationResult } = require('express-validator');
/**
 * GlobalIdeaController handles HTTP requests for global ideas
 * Requirements: 8.1, 8.2, 8.3
 */
class GlobalIdeaController {
    constructor() {
        this.globalIdeaService = new GlobalIdeaService_1.GlobalIdeaService();
    }
    /**
     * Get global idea for current date (public endpoint)
     * GET /global-idea
     * Requirements: 8.1, 8.2, 8.3, 8.4
     */
    async getGlobalIdea(_req, res) {
        // Get current date
        const currentDate = new Date();
        // Get global idea for current date
        const globalIdea = await this.globalIdeaService.getIdeaForDate(currentDate);
        // Return 404 if no idea exists for current date
        if (!globalIdea) {
            throw new errorHandler_1.NotFoundError('No global idea found for today');
        }
        // Format response
        const response = this.formatGlobalIdeaResponse(globalIdea);
        res.json(response);
    }
    /**
     * Create a new global idea (admin only - optional)
     * POST /global-idea
     * Requirements: 8.1, 8.2
     */
    async createGlobalIdea(req, res) {
        // Validate request body
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            throw new errorHandler_1.ValidationError(errors.array()[0].msg);
        }
        const { title, description, examples } = req.body;
        // Create global idea
        const globalIdea = await this.globalIdeaService.createGlobalIdea(title, description, examples || []);
        // Format response
        const response = this.formatGlobalIdeaResponse(globalIdea);
        res.status(201).json(response);
    }
    /**
     * Helper method to format global idea for response
     */
    formatGlobalIdeaResponse(globalIdea) {
        return {
            title: globalIdea.title,
            description: globalIdea.description,
            examples: globalIdea.examples,
        };
    }
}
exports.GlobalIdeaController = GlobalIdeaController;
//# sourceMappingURL=GlobalIdeaController.js.map