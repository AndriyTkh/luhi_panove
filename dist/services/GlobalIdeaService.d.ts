import { IGlobalIdea } from '../models/GlobalIdea';
/**
 * GlobalIdeaService handles business logic for global ideas
 * Requirements: 8.1, 8.2, 8.3
 */
export declare class GlobalIdeaService {
    /**
     * Get global idea for a specific date
     * Requirements: 8.1, 8.2
     */
    getIdeaForDate(date: Date): Promise<IGlobalIdea | null>;
    /**
     * Create a new global idea
     * Requirements: 8.1, 8.2
     */
    createGlobalIdea(title: string, description: string, examples: string[]): Promise<IGlobalIdea>;
}
//# sourceMappingURL=GlobalIdeaService.d.ts.map