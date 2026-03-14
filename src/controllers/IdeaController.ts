import { Response } from 'express';
import { AuthenticatedRequest, IdeaResponse, IterationResponse } from '../types';
import { IdeaService } from '../services/IdeaService';
import { GeminiService } from '../services/GeminiService';
import { ValidationError } from '../middleware/errorHandler';
import { IIdea } from '../models/Idea';

const { validationResult } = require('express-validator');

/**
 * IdeaController handles HTTP requests for idea management
 * Requirements: 3.1, 3.4, 4.1, 4.2, 5.1, 5.3, 6.1, 6.6, 7.1
 */
export class IdeaController {
  private ideaService: IdeaService;
  private geminiService: GeminiService;

  constructor() {
    this.ideaService = new IdeaService();
    this.geminiService = new GeminiService();
  }

  /**
   * Create a new idea with initial iteration, then immediately improve it via Gemini AI
   * POST /ideas
   * Requirements: 3.1, 3.4, 6.1, 6.6
   */
  async createIdea(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { title, description } = req.body;
    const userId = req.user._id.toString();

    // Create idea with initial iteration
    const idea = await this.ideaService.createIdea(userId, title, description);

    // Immediately improve the idea using Gemini AI
    const latestIteration = idea.iterations[idea.iterations.length - 1];
    const improvedIdea = await this.geminiService.improveIdea(latestIteration);

    // Add improved iteration
    const updatedIdea = await this.ideaService.addIteration(idea._id.toString(), {
      title: improvedIdea.title,
      description: improvedIdea.description,
      plan: improvedIdea.plan,
      ranking: improvedIdea.ranking,
    });

    // Format response
    const response = this.formatIdeaResponse(updatedIdea);

    res.status(201).json(response);
  }

  /**
   * Get all ideas for the authenticated user
   * GET /ideas
   * Requirements: 4.1
   */
  async getUserIdeas(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId = req.user._id.toString();

    // Get all user ideas
    const ideas = await this.ideaService.getUserIdeas(userId);

    // Format response
    const response = ideas.map(idea => this.formatIdeaResponse(idea));

    res.json(response);
  }

  /**
   * Get a specific idea by ID
   * GET /ideas/:id
   * Requirements: 4.2
   */
  async getIdeaById(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Validate ideaId parameter
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { id } = req.params;
    const ideaId = Array.isArray(id) ? id[0] : id;
    const userId = req.user._id.toString();

    // Get idea with ownership verification
    const idea = await this.ideaService.getIdeaById(ideaId, userId);

    // Format response
    const response = this.formatIdeaResponse(idea);

    res.json(response);
  }

  /**
   * Delete an idea
   * DELETE /ideas/:id
   * Requirements: 5.1, 5.3
   */
  async deleteIdea(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Validate ideaId parameter
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { id } = req.params;
    const ideaId = Array.isArray(id) ? id[0] : id;
    const userId = req.user._id.toString();

    // Delete idea with ownership verification
    await this.ideaService.deleteIdea(ideaId, userId);

    // Return 204 No Content
    res.status(204).send();
  }

  /**
   * Improve an idea using Gemini AI
   * POST /ideas/:id/improve
   * Requirements: 6.1, 6.6
   */
  async improveIdea(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Validate ideaId parameter
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { id } = req.params;
    const ideaId = Array.isArray(id) ? id[0] : id;
    const userId = req.user._id.toString();

    // Get idea with ownership verification
    const idea = await this.ideaService.getIdeaById(ideaId, userId);

    // Get the latest iteration
    const latestIteration = idea.iterations[idea.iterations.length - 1];

    // Improve idea using Gemini AI
    const improvedIdea = await this.geminiService.improveIdea(latestIteration);

    // Add new iteration with improved content
    const updatedIdea = await this.ideaService.addIteration(ideaId, {
      title: improvedIdea.title,
      description: improvedIdea.description,
      plan: improvedIdea.plan,
      ranking: improvedIdea.ranking,
    });

    // Format response with all iterations
    const response = this.formatIdeaResponse(updatedIdea);

    res.json(response);
  }

  /**
   * Edit a specific iteration of an idea
   * PATCH /ideas/:id/iterations/:version
   * Requirements: 7.1
   */
  async editIteration(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ValidationError(errors.array()[0].msg);
    }

    const { id, version } = req.params;
    const ideaId = Array.isArray(id) ? id[0] : id;
    const versionStr = Array.isArray(version) ? version[0] : version;
    const userId = req.user._id.toString();
    const updates = req.body;

    // Verify ownership first
    await this.ideaService.getIdeaById(ideaId, userId);

    // Update the iteration
    const updatedIdea = await this.ideaService.updateIteration(
      ideaId,
      parseInt(versionStr, 10),
      updates
    );

    // Format response
    const response = this.formatIdeaResponse(updatedIdea);

    res.json(response);
  }

  /**
   * Helper method to format idea for response
   */
  private formatIdeaResponse(idea: IIdea): IdeaResponse {
    return {
      id: idea._id.toString(),
      userId: idea.userId.toString(),
      iterations: idea.iterations.map(iteration => this.formatIterationResponse(iteration)),
      createdAt: idea.createdAt.toISOString(),
      updatedAt: idea.updatedAt.toISOString(),
    };
  }

  /**
   * Helper method to format iteration for response
   */
  private formatIterationResponse(iteration: any): IterationResponse {
    return {
      version: iteration.version,
      title: iteration.title,
      description: iteration.description,
      plan: iteration.plan,
      ranking: iteration.ranking,
      createdAt: iteration.createdAt.toISOString(),
    };
  }
}
