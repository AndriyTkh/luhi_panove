import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";
import { Iteration, ImprovedIdea, Ranking } from "../types";
import { ServerError, RateLimitError } from "../middleware/errorHandler";

const SYSTEM_INSTRUCTION = `
<role>
  You are an elite startup mentor and idea evaluation expert with 20+ years of experience 
  in product development, venture capital, and go-to-market strategy.
</role>

<core_task>
  You MUST perform TWO tasks for every request:
  1. IMPROVE the idea — make it more detailed, actionable, and well-structured.
  2. EVALUATE the idea — critically and honestly assess it across 4 metrics.
</core_task>

<evaluation_criteria>
  Score each metric from 0 to 100 based on REAL analysis, NOT random values:

  - originality (0-100): How novel is this idea? Does it solve a problem in a new way?
    0 = completely generic clone, 100 = groundbreaking, never-seen-before concept.

  - difficulty (0-100): How hard is it to execute? Consider technical complexity, resources, time.
    0 = trivial weekend project, 100 = requires massive capital and years of R&D.

  - marketPotential (0-100): Is there a real market? Can it generate significant revenue?
    0 = no addressable market, 100 = billion-dollar opportunity.

  - scalability (0-100): Can it grow without proportional cost increase?
    0 = fully manual, does not scale, 100 = infinitely scalable (e.g. pure software/platform).
</evaluation_criteria>

<output_format>
  You MUST output ONLY a single valid JSON object. 
  Explanatory text, markdown, code fences, and preambles are STRICTLY PROHIBITED.
  The JSON MUST match this exact structure:

  {
    "title": "string — improved, compelling title",
    "description": "string — detailed description with benefits and considerations",
    "plan": ["Step 1: ...", "Step 2: ...", "...at least 5 steps"],
    "ranking": {
      "originality": <integer 0-100>,
      "difficulty": <integer 0-100>,
      "marketPotential": <integer 0-100>,
      "scalability": <integer 0-100>
    }
  }
</output_format>

<constraints>
  - NEVER add text outside the JSON object.
  - NEVER use markdown formatting or code blocks.
  - ALWAYS provide at least 5 concrete steps in the plan.
  - ALWAYS base ranking scores on actual analysis of the idea content.
  - DO NOT use placeholder or random scores — justify them implicitly through the description.
</constraints>

<example>
  Input idea: "An app that reminds you to drink water"
  Expected output:
  {
    "title": "HydroSync — Adaptive Hydration Coach",
    "description": "A smart hydration app that personalizes water intake goals based on user weight, activity level, climate, and real-time health data. Unlike generic reminders, HydroSync learns your patterns and adjusts timing dynamically. Benefits include reduced fatigue, improved focus, and long-term health tracking.",
    "plan": [
      "Step 1: Define user onboarding flow collecting weight, activity level, and climate data",
      "Step 2: Build adaptive reminder algorithm based on intake history and calendar events",
      "Step 3: Integrate with Apple Health / Google Fit for activity data",
      "Step 4: Design gamification layer — streaks, badges, social challenges",
      "Step 5: Launch MVP on iOS with core tracking and smart reminders",
      "Step 6: Analyze retention data and iterate on notification timing models",
      "Step 7: Explore B2B channel — corporate wellness programs"
    ],
    "ranking": {
      "originality": 38,
      "difficulty": 42,
      "marketPotential": 61,
      "scalability": 85
    }
  }
</example>
`;

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private readonly timeout: number = 30000;

  constructor() {
    this.genAI = new GoogleGenerativeAI(config.gemini.apiKey);
    // System instruction встановлюється при ініціалізації моделі — найвищий пріоритет
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
      systemInstruction: SYSTEM_INSTRUCTION,
      generationConfig: {
        temperature: 0.2, // Мінімізує "креативність", максимізує дотримання формату
        responseMimeType: "application/json", // Примушує модель відповідати JSON
      },
    });
  }

  async improveIdea(iteration: Iteration): Promise<ImprovedIdea> {
    try {
      const prompt = this.formatPrompt(iteration);

      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new ServerError("Gemini AI request timeout after 30 seconds"));
        }, this.timeout);
      });

      const result = await Promise.race([
        this.model.generateContent(prompt),
        timeoutPromise,
      ]);

      const response = await result.response;
      const text = response.text();

      // parseAIResponse тепер також обробляє ranking з відповіді AI
      return this.parseAIResponse(text);
    } catch (error: any) {
      if (
        error?.message?.includes("quota") ||
        error?.message?.includes("rate limit")
      ) {
        throw new RateLimitError(
          "Gemini AI rate limit exceeded. Please try again later.",
        );
      }
      if (error instanceof ServerError) {
        throw error;
      }
      console.error("[GeminiService] Error improving idea:", error);
      throw new ServerError(
        `Failed to improve idea: ${error?.message || "Unknown error"}`,
      );
    }
  }

  formatPrompt(iteration: Iteration): string {
    const planText =
      iteration.plan.length > 0
        ? iteration.plan
            .map((step, index) => `${index + 1}. ${step}`)
            .join("\n")
        : "No plan provided yet.";

    // Промпт користувача містить лише дані — вся логіка у system_instruction
    return `
<idea_to_improve>
  <title>${iteration.title}</title>
  <description>${iteration.description}</description>
  <current_plan>
${planText}
  </current_plan>
</idea_to_improve>
    `.trim();
  }

  parseAIResponse(response: string): ImprovedIdea {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      if (!parsed.title || typeof parsed.title !== "string") {
        throw new Error("Invalid or missing title in response");
      }
      if (!parsed.description || typeof parsed.description !== "string") {
        throw new Error("Invalid or missing description in response");
      }
      if (!Array.isArray(parsed.plan)) {
        throw new Error("Invalid or missing plan in response");
      }

      const plan = parsed.plan.filter(
        (item: any) => typeof item === "string" && item.trim().length > 0,
      );
      if (plan.length === 0) {
        throw new Error("Plan must contain at least one item");
      }

      // Валідація та нормалізація ranking від AI
      const ranking = this.validateRanking(parsed.ranking);

      return {
        title: parsed.title.trim(),
        description: parsed.description.trim(),
        plan,
        ranking,
      };
    } catch (error: any) {
      console.error("[GeminiService] Error parsing AI response:", error);
      throw new ServerError(
        `Failed to parse AI response: ${error?.message || "Invalid format"}`,
      );
    }
  }

  /**
   * Validates ranking from AI response.
   * Falls back to 50 for any invalid/missing metric instead of random values.
   */
  private validateRanking(raw: any): Ranking {
    const clamp = (val: any): number => {
      const n = parseInt(val, 10);
      return isNaN(n) ? 50 : Math.min(100, Math.max(0, n));
    };

    return {
      originality: clamp(raw?.originality),
      difficulty: clamp(raw?.difficulty),
      marketPotential: clamp(raw?.marketPotential),
      scalability: clamp(raw?.scalability),
    };
  }
}
