import { Idea, IIdea, IIteration } from '../models/Idea';
import { AuthorizationError, NotFoundError } from '../middleware/errorHandler';
import { Types } from 'mongoose';

export class IdeaService {
  /**
   * Create a new idea with initial iteration version 1
   * Requirements: 3.1, 3.2, 3.3
   */
  async createIdea(
    userId: string,
    title: string,
    description: string
  ): Promise<IIdea> {
    const initialIteration: IIteration = {
      version: 1,
      title,
      description,
      plan: [],
      ranking: {
        originality: 0,
        difficulty: 0,
        marketPotential: 0,
        scalability: 0,
      },
      createdAt: new Date(),
    };

    const idea = await Idea.create({
      userId: new Types.ObjectId(userId),
      iterations: [initialIteration],
    });

    return idea;
  }

  /**
   * Get all ideas for a specific user
   * Requirements: 4.1
   */
  async getUserIdeas(userId: string): Promise<IIdea[]> {
    const ideas = await Idea.find({ userId: new Types.ObjectId(userId) });
    return ideas;
  }

  /**
   * Get a specific idea by ID with ownership verification
   * Requirements: 4.2, 4.3
   */
  async getIdeaById(ideaId: string, userId: string): Promise<IIdea> {
    const idea = await Idea.findById(ideaId);

    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Verify ownership
    if (idea.userId.toString() !== userId) {
      throw new AuthorizationError('Access forbidden: You do not own this idea');
    }

    return idea;
  }

  /**
   * Delete an idea with ownership verification
   * Requirements: 5.1, 5.2
   */
  async deleteIdea(ideaId: string, userId: string): Promise<void> {
    const idea = await Idea.findById(ideaId);

    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Verify ownership
    if (idea.userId.toString() !== userId) {
      throw new AuthorizationError('Access forbidden: You do not own this idea');
    }

    await Idea.findByIdAndDelete(ideaId);
  }

  /**
   * Add a new iteration to an idea with auto-incremented version
   * Requirements: 6.2, 6.3
   */
  async addIteration(ideaId: string, iteration: Omit<IIteration, 'version' | 'createdAt'>): Promise<IIdea> {
    const idea = await Idea.findById(ideaId);

    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Calculate next version number
    const maxVersion = Math.max(...idea.iterations.map(it => it.version));
    const newVersion = maxVersion + 1;

    const newIteration: IIteration = {
      ...iteration,
      version: newVersion,
      createdAt: new Date(),
    };

    idea.iterations.push(newIteration);
    await idea.save();

    return idea;
  }

  /**
   * Update an existing iteration while preserving version and createdAt
   * Requirements: 7.1, 7.2, 7.3
   */
  async updateIteration(
    ideaId: string,
    version: number,
    updates: Partial<Omit<IIteration, 'version' | 'createdAt'>>
  ): Promise<IIdea> {
    const idea = await Idea.findById(ideaId);

    if (!idea) {
      throw new NotFoundError('Idea not found');
    }

    // Find the iteration by version
    const iterationIndex = idea.iterations.findIndex(it => it.version === version);

    if (iterationIndex === -1) {
      throw new NotFoundError(`Iteration with version ${version} not found`);
    }

    // Update only the specified fields, preserving version and createdAt
    const currentIteration = idea.iterations[iterationIndex];
    
    // Only update fields that are explicitly provided
    if (updates.title !== undefined) {
      currentIteration.title = updates.title;
    }
    if (updates.description !== undefined) {
      currentIteration.description = updates.description;
    }
    if (updates.plan !== undefined) {
      currentIteration.plan = updates.plan;
    }
    if (updates.ranking !== undefined) {
      currentIteration.ranking = updates.ranking;
    }

    await idea.save();

    return idea;
  }
}
