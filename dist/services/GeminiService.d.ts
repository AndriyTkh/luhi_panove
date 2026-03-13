import { Iteration, ImprovedIdea, Ranking } from '../types';
/**
 * GeminiService handles integration with Google's Gemini AI API
 * for improving user ideas and generating rankings
 */
export declare class GeminiService {
    private genAI;
    private model;
    private readonly timeout;
    constructor();
    /**
     * Improves an idea by sending it to Gemini AI and parsing the response
     * @param iteration - The current iteration to improve
     * @returns Promise with improved idea including title, description, plan, and ranking
     * @throws ServerError for API failures
     * @throws RateLimitError for rate limit errors
     */
    improveIdea(iteration: Iteration): Promise<ImprovedIdea>;
    /**
     * Formats a prompt for Gemini AI with iteration data
     * @param iteration - The iteration to format into a prompt
     * @returns Formatted prompt string
     */
    formatPrompt(iteration: Iteration): string;
    /**
     * Parses AI response text into structured ImprovedIdea format
     * @param response - Raw text response from Gemini AI
     * @returns Parsed ImprovedIdea object
     * @throws ServerError if parsing fails
     */
    parseAIResponse(response: string): ImprovedIdea;
    /**
     * Generates ranking values for an idea
     * Returns random values between 0-100 for each metric
     * @returns Ranking object with originality, difficulty, marketPotential, and scalability
     */
    generateRanking(): Ranking;
}
//# sourceMappingURL=GeminiService.d.ts.map