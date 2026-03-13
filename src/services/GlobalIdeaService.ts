import { GlobalIdea, IGlobalIdea } from "../models/GlobalIdea";

/**
 * GlobalIdeaService handles business logic for global ideas
 * Requirements: 8.1, 8.2, 8.3
 */
export class GlobalIdeaService {
  /**
   * Convert Date → YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  /**
   * Get global idea for a specific date
   * Requirements: 8.1, 8.2
   */
  async getIdeaForDate(date: Date): Promise<IGlobalIdea | null> {
    const formattedDate = this.formatDate(date);

    const globalIdea = await GlobalIdea.findOne({
      date: formattedDate,
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
    examples: string[],
  ): Promise<IGlobalIdea> {
    const date = this.formatDate(new Date());

    const globalIdea = await GlobalIdea.create({
      date,
      title,
      description,
      examples,
    });

    return globalIdea;
  }
}
