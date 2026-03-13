import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config';
import { Iteration, ImprovedIdea, Ranking } from '../types';
import { ServerError, RateLimitError } from '../middleware/errorHandler';

/**
 * GeminiService handles integration with Google's Gemini AI API
 * for improving user ideas and generating rankings
 */
export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly timeout: number = 30000; // 30 seconds

  constructor() {
    // Initialize Google Generative AI client with API key
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    // Use gemini-2.5-flash - stable, fast, and supports up to 1M tokens
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  /**
   * Improves an idea by sending it to Gemini AI and parsing the response
   * @param iteration - The current iteration to improve
   * @returns Promise with improved idea including title, description, plan, and ranking
   * @throws ServerError for API failures
   * @throws RateLimitError for rate limit errors
   */
  async improveIdea(iteration: Iteration): Promise<ImprovedIdea> {
    try {
      // Format the prompt with iteration data
      const prompt = this.formatPrompt(iteration);

      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new ServerError('Gemini AI request timeout after 30 seconds'));
        }, this.timeout);
      });

      // Race between API call and timeout
      const result = await Promise.race([
        this.model.generateContent(prompt),
        timeoutPromise,
      ]);

      // Extract text from response
      const response = await result.response;
      const text = response.text();

      // Parse AI response into structured format
      const improvedIdea = this.parseAIResponse(text);

      // Generate ranking values
      improvedIdea.ranking = this.generateRanking();

      return improvedIdea;
    } catch (error: any) {
      // Handle rate limit errors
      if (error?.message?.includes('quota') || error?.message?.includes('rate limit')) {
        throw new RateLimitError('Gemini AI rate limit exceeded. Please try again later.');
      }

      // Handle timeout errors
      if (error instanceof ServerError) {
        throw error;
      }

      // Handle other errors
      console.error('[GeminiService] Error improving idea:', error);
      throw new ServerError(`Failed to improve idea: ${error?.message || 'Unknown error'}`);
    }
  }

  /**
   * Formats a prompt for Gemini AI with iteration data
   * @param iteration - The iteration to format into a prompt
   * @returns Formatted prompt string
   */
  formatPrompt(iteration: Iteration): string {
    const planText = iteration.plan.length > 0 
      ? iteration.plan.map((step, index) => `${index + 1}. ${step}`).join('\n')
      : 'No plan yet';

    return `You are an expert idea improvement assistant. Your task is to take a user's idea and improve it by making it more detailed, actionable, and well-structured.

Current Idea:
Title: ${iteration.title}
Description: ${iteration.description}
Current Plan:
${planText}

Please improve this idea by:
1. Refining the title to be more compelling and clear
2. Expanding the description with more details, potential benefits, and considerations
3. Creating a detailed, actionable plan with at least 5-7 concrete steps

Respond in the following JSON format (and ONLY JSON, no additional text):
{
  "title": "Improved title here",
  "description": "Detailed improved description here",
  "plan": [
    "Step 1: Detailed action item",
    "Step 2: Detailed action item",
    "Step 3: Detailed action item",
    "Step 4: Detailed action item",
    "Step 5: Detailed action item"
  ]
}`;
  }

  /**
   * Parses AI response text into structured ImprovedIdea format
   * @param response - Raw text response from Gemini AI
   * @returns Parsed ImprovedIdea object
   * @throws ServerError if parsing fails
   */
  parseAIResponse(response: string): ImprovedIdea {
    try {
      // Extract JSON from response (handle cases where AI adds extra text)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);

      // Validate required fields
      if (!parsed.title || typeof parsed.title !== 'string') {
        throw new Error('Invalid or missing title in response');
      }
      if (!parsed.description || typeof parsed.description !== 'string') {
        throw new Error('Invalid or missing description in response');
      }
      if (!Array.isArray(parsed.plan)) {
        throw new Error('Invalid or missing plan in response');
      }

      // Ensure plan has at least some items
      const plan = parsed.plan.filter((item: any) => typeof item === 'string' && item.trim().length > 0);
      if (plan.length === 0) {
        throw new Error('Plan must contain at least one item');
      }

      return {
        title: parsed.title.trim(),
        description: parsed.description.trim(),
        plan: plan,
        ranking: {
          originality: 0,
          difficulty: 0,
          marketPotential: 0,
          scalability: 0,
        }, // Will be set by generateRanking
      };
    } catch (error: any) {
      console.error('[GeminiService] Error parsing AI response:', error);
      throw new ServerError(`Failed to parse AI response: ${error?.message || 'Invalid format'}`);
    }
  }

  /**
   * Generates ranking values for an idea
   * Returns random values between 0-100 for each metric
   * @returns Ranking object with originality, difficulty, marketPotential, and scalability
   */
  generateRanking(): Ranking {
    // Generate random values between 0-100 for each metric
    // In a real implementation, this could use AI to analyze the idea
    // or use more sophisticated algorithms
    return {
      originality: Math.floor(Math.random() * 101), // 0-100
      difficulty: Math.floor(Math.random() * 101),
      marketPotential: Math.floor(Math.random() * 101),
      scalability: Math.floor(Math.random() * 101),
    };
  }
}
