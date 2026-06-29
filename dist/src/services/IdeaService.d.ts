import { IIdea, IIteration } from '../models/Idea';
export declare class IdeaService {
    /**
     * Create a new idea with initial iteration version 1
     * Requirements: 3.1, 3.2, 3.3
     */
    createIdea(userId: string, title: string, description: string): Promise<IIdea>;
    /**
     * Get all ideas for a specific user
     * Requirements: 4.1
     */
    getUserIdeas(userId: string): Promise<IIdea[]>;
    /**
     * Get a specific idea by ID with ownership verification
     * Requirements: 4.2, 4.3
     */
    getIdeaById(ideaId: string, userId: string): Promise<IIdea>;
    /**
     * Delete an idea with ownership verification
     * Requirements: 5.1, 5.2
     */
    deleteIdea(ideaId: string, userId: string): Promise<void>;
    /**
     * Add a new iteration to an idea with auto-incremented version
     * Requirements: 6.2, 6.3
     */
    addIteration(ideaId: string, iteration: Omit<IIteration, 'version' | 'createdAt'>): Promise<IIdea>;
    /**
     * Update an existing iteration while preserving version and createdAt
     * Requirements: 7.1, 7.2, 7.3
     */
    updateIteration(ideaId: string, version: number, updates: Partial<Omit<IIteration, 'version' | 'createdAt'>>): Promise<IIdea>;
}
//# sourceMappingURL=IdeaService.d.ts.map