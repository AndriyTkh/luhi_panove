import { Request, Response } from 'express';
import { GlobalIdeaService } from '../services/GlobalIdeaService';
import { GlobalIdeaResponse } from '../types';
import { NotFoundError, ValidationError } from '../middleware/errorHandler';
import { IGlobalIdea } from '../models/GlobalIdea';

const { validationResult } = require('express-validator');

/**
 * GlobalIdeaController handles HTTP requests for global ideas
 * Requirements: 8.1, 8.2, 8.3
 */
export class GlobalIdeaController {
  private globalIdeaService: GlobalIdeaService;

  constructor() {
    this.globalIdeaService = new GlobalIdeaService();
  }

  /**
   * Get global idea for current date (public endpoint)
   * GET /global-idea
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async getGlobalIdea(_req: Request, res: Response): Promise<void> {
    // Get current date
    const currentDate = new Date();

    // Get global idea for current date
    const globalIdea = await this.globalIdeaService.getIdeaForDate(currentDate);

    // Return 404 if no idea exists for current date
    if (!globalIdea) {
      throw new NotFoundError('No global idea found for today');
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
  async createGlobalIdea(req: Request, res: Response): Promise<void> {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { title, description, examples } = req.body;

    // Create global idea
    const globalIdea = await this.globalIdeaService.createGlobalIdea(
      title,
      description,
      examples || []
    );

    // Format response
    const response = this.formatGlobalIdeaResponse(globalIdea);

    res.status(201).json(response);
  }

  /**
   * Helper method to format global idea for response
   */
  private formatGlobalIdeaResponse(globalIdea: IGlobalIdea): GlobalIdeaResponse {
    return {
      title: globalIdea.title,
      description: globalIdea.description,
      examples: globalIdea.examples,
    };
  }
}
