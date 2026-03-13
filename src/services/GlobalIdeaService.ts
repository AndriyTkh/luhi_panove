import { GlobalIdea, IGlobalIdea } from '../models/GlobalIdea';

/**
 * GlobalIdeaService handles business logic for global ideas
 * Requirements: 8.1, 8.2, 8.3
 */
export class GlobalIdeaService {
  /**
   * Get global idea for a specific date
   * Requirements: 8.1, 8.2
   */
  async getIdeaForDate(date: Date): Promise<IGlobalIdea | null> {
    // Normalize date to start of day (00:00:00) for consistent matching
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    // Find global idea for the specified date
    const globalIdea = await GlobalIdea.findOne({
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    return globalIdea;
  }

  /**
   * Create a new global idea
   * Requirements: 8.1, 8.2
   */
  async createGlobalIdea(
    title: string,
    description: string,
    examples: string[]
  ): Promise<IGlobalIdea> {
    // Use current date normalized to start of day
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const globalIdea = await GlobalIdea.create({
      date,
      title,
      description,
      examples,
    });

    return globalIdea;
  }
}
