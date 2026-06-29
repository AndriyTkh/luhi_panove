"use strict";
/**
 * Unit tests for GeminiService
 * Tests AI integration with mock responses and error handling
 */
Object.defineProperty(exports, "__esModule", { value: true });
const GeminiService_1 = require("../../../src/services/GeminiService");
const errorHandler_1 = require("../../../src/middleware/errorHandler");
describe('GeminiService', () => {
    let geminiService;
    beforeEach(() => {
        geminiService = new GeminiService_1.GeminiService();
    });
    describe('formatPrompt', () => {
        test('formats prompt with title, description, and plan', () => {
            const iteration = {
                version: 1,
                title: 'Test Idea',
                description: 'Test Description',
                plan: ['Step 1', 'Step 2', 'Step 3'],
                ranking: { originality: 0, difficulty: 0, marketPotential: 0, scalability: 0 },
                createdAt: new Date(),
            };
            const prompt = geminiService.formatPrompt(iteration);
            expect(prompt).toContain('Test Idea');
            expect(prompt).toContain('Test Description');
            expect(prompt).toContain('1. Step 1');
            expect(prompt).toContain('2. Step 2');
            expect(prompt).toContain('3. Step 3');
        });
        test('handles empty plan array', () => {
            const iteration = {
                version: 1,
                title: 'Test Idea',
                description: 'Test Description',
                plan: [],
                ranking: { originality: 0, difficulty: 0, marketPotential: 0, scalability: 0 },
                createdAt: new Date(),
            };
            const prompt = geminiService.formatPrompt(iteration);
            expect(prompt).toContain('Test Idea');
            expect(prompt).toContain('Test Description');
            expect(prompt).toContain('No plan yet');
        });
        test('handles special characters in title and description', () => {
            const iteration = {
                version: 1,
                title: 'Test & "Special" <Characters>',
                description: 'Description with émojis 🚀 and ñ',
                plan: [],
                ranking: { originality: 0, difficulty: 0, marketPotential: 0, scalability: 0 },
                createdAt: new Date(),
            };
            const prompt = geminiService.formatPrompt(iteration);
            expect(prompt).toContain('Test & "Special" <Characters>');
            expect(prompt).toContain('Description with émojis 🚀 and ñ');
        });
        test('formats plan with numbered steps', () => {
            const iteration = {
                version: 1,
                title: 'Test',
                description: 'Test',
                plan: ['First', 'Second', 'Third'],
                ranking: { originality: 0, difficulty: 0, marketPotential: 0, scalability: 0 },
                createdAt: new Date(),
            };
            const prompt = geminiService.formatPrompt(iteration);
            expect(prompt).toContain('1. First');
            expect(prompt).toContain('2. Second');
            expect(prompt).toContain('3. Third');
        });
    });
    describe('parseAIResponse', () => {
        test('parses valid JSON response', () => {
            const response = JSON.stringify({
                title: 'Improved Title',
                description: 'Improved Description',
                plan: ['Step 1', 'Step 2', 'Step 3'],
            });
            const result = geminiService.parseAIResponse(response);
            expect(result.title).toBe('Improved Title');
            expect(result.description).toBe('Improved Description');
            expect(result.plan).toEqual(['Step 1', 'Step 2', 'Step 3']);
            expect(result.ranking).toEqual({
                originality: 0,
                difficulty: 0,
                marketPotential: 0,
                scalability: 0,
            });
        });
        test('extracts JSON from response with extra text', () => {
            const response = `Here is the improved idea:
      
      ${JSON.stringify({
                title: 'Improved Title',
                description: 'Improved Description',
                plan: ['Step 1', 'Step 2'],
            })}
      
      I hope this helps!`;
            const result = geminiService.parseAIResponse(response);
            expect(result.title).toBe('Improved Title');
            expect(result.description).toBe('Improved Description');
            expect(result.plan).toEqual(['Step 1', 'Step 2']);
        });
        test('trims whitespace from title and description', () => {
            const response = JSON.stringify({
                title: '  Improved Title  ',
                description: '  Improved Description  ',
                plan: ['Step 1'],
            });
            const result = geminiService.parseAIResponse(response);
            expect(result.title).toBe('Improved Title');
            expect(result.description).toBe('Improved Description');
        });
        test('filters out empty plan items', () => {
            const response = JSON.stringify({
                title: 'Title',
                description: 'Description',
                plan: ['Step 1', '', '  ', 'Step 2', null, 'Step 3'],
            });
            const result = geminiService.parseAIResponse(response);
            expect(result.plan).toEqual(['Step 1', 'Step 2', 'Step 3']);
        });
        test('throws ServerError when response is not JSON', () => {
            const response = 'This is not JSON';
            expect(() => geminiService.parseAIResponse(response)).toThrow(errorHandler_1.ServerError);
        });
        test('throws ServerError when title is missing', () => {
            const response = JSON.stringify({
                description: 'Description',
                plan: ['Step 1'],
            });
            expect(() => geminiService.parseAIResponse(response)).toThrow(errorHandler_1.ServerError);
        });
        test('throws ServerError when description is missing', () => {
            const response = JSON.stringify({
                title: 'Title',
                plan: ['Step 1'],
            });
            expect(() => geminiService.parseAIResponse(response)).toThrow(errorHandler_1.ServerError);
        });
        test('throws ServerError when plan is missing', () => {
            const response = JSON.stringify({
                title: 'Title',
                description: 'Description',
            });
            expect(() => geminiService.parseAIResponse(response)).toThrow(errorHandler_1.ServerError);
        });
        test('throws ServerError when plan is not an array', () => {
            const response = JSON.stringify({
                title: 'Title',
                description: 'Description',
                plan: 'Not an array',
            });
            expect(() => geminiService.parseAIResponse(response)).toThrow(errorHandler_1.ServerError);
        });
        test('throws ServerError when plan is empty after filtering', () => {
            const response = JSON.stringify({
                title: 'Title',
                description: 'Description',
                plan: ['', '  ', null],
            });
            expect(() => geminiService.parseAIResponse(response)).toThrow(errorHandler_1.ServerError);
        });
        test('handles plan with single item', () => {
            const response = JSON.stringify({
                title: 'Title',
                description: 'Description',
                plan: ['Single Step'],
            });
            const result = geminiService.parseAIResponse(response);
            expect(result.plan).toEqual(['Single Step']);
        });
    });
    describe('generateRanking', () => {
        test('generates ranking with all required fields', () => {
            const ranking = geminiService.generateRanking();
            expect(ranking).toHaveProperty('originality');
            expect(ranking).toHaveProperty('difficulty');
            expect(ranking).toHaveProperty('marketPotential');
            expect(ranking).toHaveProperty('scalability');
        });
        test('generates values between 0 and 100', () => {
            // Test multiple times to check randomness
            for (let i = 0; i < 10; i++) {
                const ranking = geminiService.generateRanking();
                expect(ranking.originality).toBeGreaterThanOrEqual(0);
                expect(ranking.originality).toBeLessThanOrEqual(100);
                expect(ranking.difficulty).toBeGreaterThanOrEqual(0);
                expect(ranking.difficulty).toBeLessThanOrEqual(100);
                expect(ranking.marketPotential).toBeGreaterThanOrEqual(0);
                expect(ranking.marketPotential).toBeLessThanOrEqual(100);
                expect(ranking.scalability).toBeGreaterThanOrEqual(0);
                expect(ranking.scalability).toBeLessThanOrEqual(100);
            }
        });
        test('generates different values on multiple calls', () => {
            const ranking1 = geminiService.generateRanking();
            const ranking2 = geminiService.generateRanking();
            // At least one value should be different (very high probability)
            const isDifferent = ranking1.originality !== ranking2.originality ||
                ranking1.difficulty !== ranking2.difficulty ||
                ranking1.marketPotential !== ranking2.marketPotential ||
                ranking1.scalability !== ranking2.scalability;
            expect(isDifferent).toBe(true);
        });
    });
    describe('improveIdea', () => {
        test('successfully improves idea with mocked response', async () => {
            const iteration = {
                version: 1,
                title: 'Original Idea',
                description: 'Original Description',
                plan: ['Original Step'],
                ranking: { originality: 0, difficulty: 0, marketPotential: 0, scalability: 0 },
                createdAt: new Date(),
            };
            const result = await geminiService.improveIdea(iteration);
            // Check that mock response is used (from setup.ts)
            expect(result.title).toBe('Improved Idea Title');
            expect(result.description).toContain('improved description');
            expect(result.plan).toBeInstanceOf(Array);
            expect(result.plan.length).toBeGreaterThan(0);
            expect(result.ranking).toBeDefined();
            expect(result.ranking.originality).toBeGreaterThanOrEqual(0);
            expect(result.ranking.originality).toBeLessThanOrEqual(100);
        });
        test('includes ranking in improved idea', async () => {
            const iteration = {
                version: 1,
                title: 'Test',
                description: 'Test',
                plan: [],
                ranking: { originality: 0, difficulty: 0, marketPotential: 0, scalability: 0 },
                createdAt: new Date(),
            };
            const result = await geminiService.improveIdea(iteration);
            expect(result.ranking).toBeDefined();
            expect(result.ranking.originality).toBeDefined();
            expect(result.ranking.difficulty).toBeDefined();
            expect(result.ranking.marketPotential).toBeDefined();
            expect(result.ranking.scalability).toBeDefined();
        });
    });
});
//# sourceMappingURL=gemini.service.test.js.map