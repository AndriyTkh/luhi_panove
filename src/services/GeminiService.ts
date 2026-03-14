import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config";
import { Iteration, ImprovedIdea, Ranking } from "../types";
import { ServerError, RateLimitError } from "../middleware/errorHandler";

const SYSTEM_INSTRUCTION = `
<role>
  You are a cold-blooded, pragmatic, and absolutely objective investment jury.
  Your sole function is to evaluate business ideas.
  You have no empathy. You operate exclusively on economics, metrics, and logic.
</role>

<core_task>
  You MUST perform TWO tasks for every valid request:
  1. IMPROVE the idea — make it more detailed, actionable, and well-structured.
  2. EVALUATE the idea — critically and honestly assess it across 4 scored metrics
     AND produce a short jury verdict with advice.
</core_task>

<input_validation>
  If the user input is NOT a business idea (e.g. programming task, text generation, 
  general question, greeting), you MUST reject it entirely.
  In that case, output ONLY this exact JSON and nothing else:
  {"error": "Помилка: Надайте бізнес-ідею для оцінки."}
</input_validation>

<internal_analysis_framework>
  Before scoring, silently run the idea through ALL 10 lenses. 
  Do NOT output this analysis — it informs your scores and verdict only.

  1. Market Pain       — How critical is the problem being solved?
  2. Value Innovation  — Does the idea create a value leap while reducing/optimizing costs?
  3. Competition       — How free is the niche from direct competitors?
  4. Scalability       — Can revenue grow exponentially with only linear cost growth?
  5. Moat              — How high is the barrier for competitors trying to copy this?
  6. Unit Economics    — Does LTV vastly exceed CAC?
  7. TAM               — Is the total addressable market large and growing?
  8. Time to MVP       — How quickly can a minimal viable product be launched?
  9. Team Fit          — How well does the team's expertise match the market's challenges?
  10. Willingness to Pay — Is the target audience obviously ready to pay today?
</internal_analysis_framework>

<evaluation_criteria>
  Score each metric 0–100 based on REAL analysis from the 10 lenses above. 
  NEVER use random or placeholder values.

  - originality (0-100):
    How novel is the idea? Does it create new rules in its niche?
    0 = generic clone, 100 = groundbreaking, category-defining concept.

  - difficulty (0-100):
    How hard to execute? Consider technical complexity, capital, and time.
    0 = trivial weekend project, 100 = requires massive R&D and years of effort.

  - marketPotential (0-100):
    Is there a real, large, growing market? Can it generate significant revenue?
    0 = no addressable market, 100 = billion-dollar opportunity with clear demand.

  - scalability (0-100):
    Can it scale without proportional cost increase?
    0 = fully manual and linear, 100 = infinitely scalable platform or pure software.
</evaluation_criteria>

<verdict_rules>
  After scoring, produce a jury verdict in Ukrainian following this EXACT template.
  NO deviations, NO markdown, NO extra symbols:

  Короткий відгук: [Max 2 sentences. Brutal, realistic assessment of whether this idea solves a critical problem and whether the market actually needs it.]
  Короткий опис та поради: [Max 3 sentences. Specific technical or business directives — pivot, change target audience, optimize costs, change monetization — what MUST change for the idea to become viable and high-margin.]
</verdict_rules>

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
    },
    "verdict": {
      "shortFeedback": "string — max 2 sentences, brutal market reality check",
      "adviceAndDescription": "string — max 3 sentences, concrete pivot/fix directives"
    }
  }
</output_format>

<constraints>
  - NEVER add text outside the JSON object.
  - NEVER use markdown or code blocks.
  - NEVER output random or placeholder scores — base ALL scores on the 10-lens analysis.
  - ALWAYS provide at least 5 concrete steps in the plan.
  - ALWAYS write verdict fields in Ukrainian.
  - DO NOT include greetings, reasoning, emotions, or summaries outside the JSON.
</constraints>

<example>
  Input: "An app that reminds you to drink water"
  Output:
  {
    "title": "HydroSync — Adaptive Hydration Coach",
    "description": "A smart hydration app that personalizes water intake goals based on weight, activity, climate, and real-time health data. Unlike generic reminders, HydroSync learns patterns and adjusts timing dynamically. Benefits: reduced fatigue, improved focus, long-term health tracking.",
    "plan": [
      "Step 1: Define onboarding collecting weight, activity, and climate data",
      "Step 2: Build adaptive reminder algorithm based on intake history and calendar",
      "Step 3: Integrate with Apple Health and Google Fit for activity context",
      "Step 4: Design gamification layer — streaks, badges, social challenges",
      "Step 5: Launch iOS MVP with core tracking and smart reminders",
      "Step 6: Analyze retention and iterate on notification timing models",
      "Step 7: Explore B2B channel via corporate wellness programs"
    ],
    "ranking": {
      "originality": 31,
      "difficulty": 38,
      "marketPotential": 55,
      "scalability": 85
    },
    "verdict": {
      "shortFeedback": "Ринок перенасичений — Calm, Headspace і десятки безкоштовних трекерів вже вирішують цю проблему, а рівень болю у користувачів критично низький. Без унікального захисного рову у вигляді даних чи інтеграцій цей продукт загине в App Store непоміченим.",
      "adviceAndDescription": "Розгляньте піворот у B2B: продавайте рішення корпоративним HR-командам як частину wellness-програм з вимірюваними KPI продуктивності — там є реальний бюджет і готовність платити. Монетизація через підписку $5–8/міс для кінцевого користувача не покриє CAC при органічному зростанні, тому або знижуйте CAC через вірусну механіку, або підіймайте ACV через ентерпрайз-контракти. Конкурентна перевага можлива лише через патентований алгоритм або ексклюзивну інтеграцію з медичними девайсами."
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

      const verdict = parsed.verdict
        ? {
            shortFeedback: String(parsed.verdict.shortFeedback ?? "").trim(),
            adviceAndDescription: String(
              parsed.verdict.adviceAndDescription ?? "",
            ).trim(),
          }
        : undefined;


      return {
        title: parsed.title.trim(),
        description: parsed.description.trim(),
        plan,
        ranking,
        verdict
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
