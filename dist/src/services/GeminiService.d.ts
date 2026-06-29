import { Iteration, ImprovedIdea } from "../types";
export declare class GeminiService {
    private genAI;
    private model;
    private readonly timeout;
    constructor();
    improveIdea(iteration: Iteration): Promise<ImprovedIdea>;
    formatPrompt(iteration: Iteration): string;
    parseAIResponse(response: string): ImprovedIdea;
    /**
     * Validates ranking from AI response.
     * Falls back to 50 for any invalid/missing metric instead of random values.
     */
    private validateRanking;
}
//# sourceMappingURL=GeminiService.d.ts.map