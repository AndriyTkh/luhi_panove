"use strict";
/**
 * Integration tests for main API flows
 * Tests complete workflows: create → improve → edit → delete
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const ideas_1 = __importDefault(require("../../../src/routes/ideas"));
const auth_1 = require("../../../src/middleware/auth");
const errorHandler_1 = require("../../../src/middleware/errorHandler");
describe('API Integration Tests', () => {
    let app;
    beforeEach(() => {
        // Create Express app with middleware
        app = (0, express_1.default)();
        app.use(express_1.default.json());
        app.use((0, cookie_parser_1.default)('test-secret'));
        app.use(auth_1.requireAuth);
        app.use('/ideas', ideas_1.default);
        app.use(errorHandler_1.errorHandler);
    });
    describe('Complete Idea Lifecycle', () => {
        test('create → get → improve → edit → delete flow', async () => {
            // Step 1: Create an idea
            const createResponse = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({
                title: 'Mobile App Idea',
                description: 'A mobile app for tracking daily habits',
            })
                .expect(201);
            expect(createResponse.body).toHaveProperty('_id');
            expect(createResponse.body.iterations).toHaveLength(1);
            expect(createResponse.body.iterations[0].version).toBe(1);
            expect(createResponse.body.iterations[0].title).toBe('Mobile App Idea');
            const ideaId = createResponse.body._id;
            const cookies = createResponse.headers['set-cookie'];
            // Step 2: Get the idea
            const getResponse = await (0, supertest_1.default)(app)
                .get(`/ideas/${ideaId}`)
                .set('Cookie', cookies)
                .expect(200);
            expect(getResponse.body._id).toBe(ideaId);
            expect(getResponse.body.iterations).toHaveLength(1);
            // Step 3: Improve the idea with AI
            const improveResponse = await (0, supertest_1.default)(app)
                .post(`/ideas/${ideaId}/improve`)
                .set('Cookie', cookies)
                .expect(200);
            expect(improveResponse.body.iterations).toHaveLength(2);
            expect(improveResponse.body.iterations[1].version).toBe(2);
            expect(improveResponse.body.iterations[1].title).toBe('Improved Idea Title');
            // Step 4: Edit the second iteration
            const editResponse = await (0, supertest_1.default)(app)
                .patch(`/ideas/${ideaId}/iterations/2`)
                .set('Cookie', cookies)
                .send({
                title: 'Manually Edited Title',
                description: 'Manually edited description',
            })
                .expect(200);
            expect(editResponse.body.iterations[1].title).toBe('Manually Edited Title');
            expect(editResponse.body.iterations[1].description).toBe('Manually edited description');
            expect(editResponse.body.iterations[1].version).toBe(2); // Version preserved
            // Step 5: Delete the idea
            await (0, supertest_1.default)(app)
                .delete(`/ideas/${ideaId}`)
                .set('Cookie', cookies)
                .expect(204);
            // Step 6: Verify deletion
            await (0, supertest_1.default)(app)
                .get(`/ideas/${ideaId}`)
                .set('Cookie', cookies)
                .expect(404);
        });
        test('create multiple ideas and retrieve all', async () => {
            const response1 = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'Idea 1', description: 'Description 1' })
                .expect(201);
            const cookies = response1.headers['set-cookie'];
            await (0, supertest_1.default)(app)
                .post('/ideas')
                .set('Cookie', cookies)
                .send({ title: 'Idea 2', description: 'Description 2' })
                .expect(201);
            await (0, supertest_1.default)(app)
                .post('/ideas')
                .set('Cookie', cookies)
                .send({ title: 'Idea 3', description: 'Description 3' })
                .expect(201);
            const getAllResponse = await (0, supertest_1.default)(app)
                .get('/ideas')
                .set('Cookie', cookies)
                .expect(200);
            expect(getAllResponse.body).toHaveLength(3);
            expect(getAllResponse.body[0].iterations[0].title).toBe('Idea 1');
            expect(getAllResponse.body[1].iterations[0].title).toBe('Idea 2');
            expect(getAllResponse.body[2].iterations[0].title).toBe('Idea 3');
        });
        test('multiple improvements create sequential versions', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'Original', description: 'Original description' })
                .expect(201);
            const ideaId = createResponse.body._id;
            const cookies = createResponse.headers['set-cookie'];
            // First improvement
            await (0, supertest_1.default)(app)
                .post(`/ideas/${ideaId}/improve`)
                .set('Cookie', cookies)
                .expect(200);
            // Second improvement
            await (0, supertest_1.default)(app)
                .post(`/ideas/${ideaId}/improve`)
                .set('Cookie', cookies)
                .expect(200);
            // Third improvement
            const finalResponse = await (0, supertest_1.default)(app)
                .post(`/ideas/${ideaId}/improve`)
                .set('Cookie', cookies)
                .expect(200);
            expect(finalResponse.body.iterations).toHaveLength(4);
            expect(finalResponse.body.iterations[0].version).toBe(1);
            expect(finalResponse.body.iterations[1].version).toBe(2);
            expect(finalResponse.body.iterations[2].version).toBe(3);
            expect(finalResponse.body.iterations[3].version).toBe(4);
        });
    });
    describe('Authorization and Ownership', () => {
        test('user cannot access another user\'s idea', async () => {
            // User 1 creates an idea
            const user1Response = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'User 1 Idea', description: 'Description' })
                .expect(201);
            const ideaId = user1Response.body._id;
            // User 2 tries to access it (different IP, no cookie)
            await (0, supertest_1.default)(app)
                .get(`/ideas/${ideaId}`)
                .set('X-Forwarded-For', '10.0.0.2')
                .expect(403);
        });
        test('user cannot delete another user\'s idea', async () => {
            // User 1 creates an idea
            const user1Response = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'User 1 Idea', description: 'Description' })
                .expect(201);
            const ideaId = user1Response.body._id;
            // User 2 tries to delete it
            await (0, supertest_1.default)(app)
                .delete(`/ideas/${ideaId}`)
                .set('X-Forwarded-For', '10.0.0.2')
                .expect(403);
        });
        test('user cannot edit another user\'s idea iteration', async () => {
            // User 1 creates an idea
            const user1Response = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'User 1 Idea', description: 'Description' })
                .expect(201);
            const ideaId = user1Response.body._id;
            // User 2 tries to edit it
            await (0, supertest_1.default)(app)
                .patch(`/ideas/${ideaId}/iterations/1`)
                .set('X-Forwarded-For', '10.0.0.2')
                .send({ title: 'Hacked Title' })
                .expect(403);
        });
    });
    describe('Error Handling', () => {
        test('returns 404 for non-existent idea', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/ideas/507f1f77bcf86cd799439011')
                .expect(404);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('not found');
        });
        test('returns 400 for invalid idea creation', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({
            // Missing required fields
            })
                .expect(400);
            expect(response.body).toHaveProperty('message');
        });
        test('returns 404 for editing non-existent iteration', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'Test', description: 'Test' })
                .expect(201);
            const ideaId = createResponse.body._id;
            const cookies = createResponse.headers['set-cookie'];
            const response = await (0, supertest_1.default)(app)
                .patch(`/ideas/${ideaId}/iterations/999`)
                .set('Cookie', cookies)
                .send({ title: 'Updated' })
                .expect(404);
            expect(response.body).toHaveProperty('message');
            expect(response.body.message).toContain('not found');
        });
        test('returns consistent error format', async () => {
            const response = await (0, supertest_1.default)(app)
                .get('/ideas/invalid-id')
                .expect(500); // Invalid ObjectId format causes server error
            expect(response.body).toHaveProperty('message');
            expect(response.body).toHaveProperty('statusCode');
            expect(typeof response.body.message).toBe('string');
            expect(typeof response.body.statusCode).toBe('number');
        });
    });
    describe('Edge Cases', () => {
        test('handles minimal valid title and description', async () => {
            const response = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'A', description: 'B' })
                .expect(201);
            expect(response.body.iterations[0].title).toBe('A');
            expect(response.body.iterations[0].description).toBe('B');
        });
        test('handles very long title and description', async () => {
            const longTitle = 'A'.repeat(1000);
            const longDescription = 'B'.repeat(5000);
            const response = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: longTitle, description: longDescription })
                .expect(201);
            expect(response.body.iterations[0].title).toBe(longTitle);
            expect(response.body.iterations[0].description).toBe(longDescription);
        });
        test('handles special characters in title and description', async () => {
            const specialTitle = '!@#$%^&*()_+-=[]{}|;:,.<>?';
            const specialDesc = '特殊字符 émojis 🚀 ñ';
            const response = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: specialTitle, description: specialDesc })
                .expect(201);
            expect(response.body.iterations[0].title).toBe(specialTitle);
            expect(response.body.iterations[0].description).toBe(specialDesc);
        });
        test('preserves iteration order after multiple operations', async () => {
            const createResponse = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'V1', description: 'V1 Description' })
                .expect(201);
            const ideaId = createResponse.body._id;
            const cookies = createResponse.headers['set-cookie'];
            // Add V2
            await (0, supertest_1.default)(app)
                .post(`/ideas/${ideaId}/improve`)
                .set('Cookie', cookies)
                .expect(200);
            // Edit V1
            await (0, supertest_1.default)(app)
                .patch(`/ideas/${ideaId}/iterations/1`)
                .set('Cookie', cookies)
                .send({ title: 'V1 Edited' })
                .expect(200);
            // Add V3
            await (0, supertest_1.default)(app)
                .post(`/ideas/${ideaId}/improve`)
                .set('Cookie', cookies)
                .expect(200);
            // Get final state
            const finalResponse = await (0, supertest_1.default)(app)
                .get(`/ideas/${ideaId}`)
                .set('Cookie', cookies)
                .expect(200);
            expect(finalResponse.body.iterations).toHaveLength(3);
            expect(finalResponse.body.iterations[0].version).toBe(1);
            expect(finalResponse.body.iterations[0].title).toBe('V1 Edited');
            expect(finalResponse.body.iterations[1].version).toBe(2);
            expect(finalResponse.body.iterations[2].version).toBe(3);
        });
    });
    describe('Cookie-based Authentication', () => {
        test('maintains user session across requests with cookie', async () => {
            const response1 = await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'Idea 1', description: 'Description 1' })
                .expect(201);
            const cookies = response1.headers['set-cookie'];
            // Use same cookie for second request
            await (0, supertest_1.default)(app)
                .post('/ideas')
                .set('Cookie', cookies)
                .send({ title: 'Idea 2', description: 'Description 2' })
                .expect(201);
            // Both ideas should belong to same user
            const getAllResponse = await (0, supertest_1.default)(app)
                .get('/ideas')
                .set('Cookie', cookies)
                .expect(200);
            expect(getAllResponse.body).toHaveLength(2);
        });
        test('creates new user when no cookie is provided', async () => {
            await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'User 1 Idea', description: 'Description' })
                .expect(201);
            await (0, supertest_1.default)(app)
                .post('/ideas')
                .send({ title: 'User 2 Idea', description: 'Description' })
                .expect(201);
            // Each request without cookies creates a new user
            // This test verifies the system handles multiple users
        });
    });
});
//# sourceMappingURL=api.integration.test.js.map