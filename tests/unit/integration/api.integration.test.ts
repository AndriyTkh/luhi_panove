/**
 * Integration tests for main API flows
 * Tests complete workflows: create → improve → edit → delete
 */

import request from 'supertest';
import express, { Express } from 'express';
import cookieParser from 'cookie-parser';
import { ideaRoutes } from '../../../src/routes/ideas';
import { autoIdentifyUser } from '../../../src/middleware/auth';
import { errorHandler } from '../../../src/middleware/errorHandler';

describe('API Integration Tests', () => {
  let app: Express;

  beforeEach(() => {
    // Create Express app with middleware
    app = express();
    app.use(express.json());
    app.use(cookieParser('test-secret'));
    app.use(autoIdentifyUser);
    app.use('/ideas', ideaRoutes);
    app.use(errorHandler);
  });

  describe('Complete Idea Lifecycle', () => {
    test('create → get → improve → edit → delete flow', async () => {
      // Step 1: Create an idea
      const createResponse = await request(app)
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
      const getResponse = await request(app)
        .get(`/ideas/${ideaId}`)
        .set('Cookie', cookies)
        .expect(200);

      expect(getResponse.body._id).toBe(ideaId);
      expect(getResponse.body.iterations).toHaveLength(1);

      // Step 3: Improve the idea with AI
      const improveResponse = await request(app)
        .post(`/ideas/${ideaId}/improve`)
        .set('Cookie', cookies)
        .expect(200);

      expect(improveResponse.body.iterations).toHaveLength(2);
      expect(improveResponse.body.iterations[1].version).toBe(2);
      expect(improveResponse.body.iterations[1].title).toBe('Improved Idea Title');

      // Step 4: Edit the second iteration
      const editResponse = await request(app)
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
      await request(app)
        .delete(`/ideas/${ideaId}`)
        .set('Cookie', cookies)
        .expect(204);

      // Step 6: Verify deletion
      await request(app)
        .get(`/ideas/${ideaId}`)
        .set('Cookie', cookies)
        .expect(404);
    });

    test('create multiple ideas and retrieve all', async () => {
      const response1 = await request(app)
        .post('/ideas')
        .send({ title: 'Idea 1', description: 'Description 1' })
        .expect(201);

      const cookies = response1.headers['set-cookie'];

      await request(app)
        .post('/ideas')
        .set('Cookie', cookies)
        .send({ title: 'Idea 2', description: 'Description 2' })
        .expect(201);

      await request(app)
        .post('/ideas')
        .set('Cookie', cookies)
        .send({ title: 'Idea 3', description: 'Description 3' })
        .expect(201);

      const getAllResponse = await request(app)
        .get('/ideas')
        .set('Cookie', cookies)
        .expect(200);

      expect(getAllResponse.body).toHaveLength(3);
      expect(getAllResponse.body[0].iterations[0].title).toBe('Idea 1');
      expect(getAllResponse.body[1].iterations[0].title).toBe('Idea 2');
      expect(getAllResponse.body[2].iterations[0].title).toBe('Idea 3');
    });

    test('multiple improvements create sequential versions', async () => {
      const createResponse = await request(app)
        .post('/ideas')
        .send({ title: 'Original', description: 'Original description' })
        .expect(201);

      const ideaId = createResponse.body._id;
      const cookies = createResponse.headers['set-cookie'];

      // First improvement
      await request(app)
        .post(`/ideas/${ideaId}/improve`)
        .set('Cookie', cookies)
        .expect(200);

      // Second improvement
      await request(app)
        .post(`/ideas/${ideaId}/improve`)
        .set('Cookie', cookies)
        .expect(200);

      // Third improvement
      const finalResponse = await request(app)
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
      const user1Response = await request(app)
        .post('/ideas')
        .send({ title: 'User 1 Idea', description: 'Description' })
        .expect(201);

      const ideaId = user1Response.body._id;

      // User 2 tries to access it (different IP, no cookie)
      await request(app)
        .get(`/ideas/${ideaId}`)
        .set('X-Forwarded-For', '10.0.0.2')
        .expect(403);
    });

    test('user cannot delete another user\'s idea', async () => {
      // User 1 creates an idea
      const user1Response = await request(app)
        .post('/ideas')
        .send({ title: 'User 1 Idea', description: 'Description' })
        .expect(201);

      const ideaId = user1Response.body._id;

      // User 2 tries to delete it
      await request(app)
        .delete(`/ideas/${ideaId}`)
        .set('X-Forwarded-For', '10.0.0.2')
        .expect(403);
    });

    test('user cannot edit another user\'s idea iteration', async () => {
      // User 1 creates an idea
      const user1Response = await request(app)
        .post('/ideas')
        .send({ title: 'User 1 Idea', description: 'Description' })
        .expect(201);

      const ideaId = user1Response.body._id;

      // User 2 tries to edit it
      await request(app)
        .patch(`/ideas/${ideaId}/iterations/1`)
        .set('X-Forwarded-For', '10.0.0.2')
        .send({ title: 'Hacked Title' })
        .expect(403);
    });
  });

  describe('Error Handling', () => {
    test('returns 404 for non-existent idea', async () => {
      const response = await request(app)
        .get('/ideas/507f1f77bcf86cd799439011')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    test('returns 400 for invalid idea creation', async () => {
      const response = await request(app)
        .post('/ideas')
        .send({
          // Missing required fields
        })
        .expect(400);

      expect(response.body).toHaveProperty('message');
    });

    test('returns 404 for editing non-existent iteration', async () => {
      const createResponse = await request(app)
        .post('/ideas')
        .send({ title: 'Test', description: 'Test' })
        .expect(201);

      const ideaId = createResponse.body._id;
      const cookies = createResponse.headers['set-cookie'];

      const response = await request(app)
        .patch(`/ideas/${ideaId}/iterations/999`)
        .set('Cookie', cookies)
        .send({ title: 'Updated' })
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('not found');
    });

    test('returns consistent error format', async () => {
      const response = await request(app)
        .get('/ideas/invalid-id')
        .expect(404);

      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('statusCode');
      expect(typeof response.body.message).toBe('string');
      expect(typeof response.body.statusCode).toBe('number');
    });
  });

  describe('Edge Cases', () => {
    test('handles empty title and description', async () => {
      const response = await request(app)
        .post('/ideas')
        .send({ title: '', description: '' })
        .expect(201);

      expect(response.body.iterations[0].title).toBe('');
      expect(response.body.iterations[0].description).toBe('');
    });

    test('handles very long title and description', async () => {
      const longTitle = 'A'.repeat(1000);
      const longDescription = 'B'.repeat(5000);

      const response = await request(app)
        .post('/ideas')
        .send({ title: longTitle, description: longDescription })
        .expect(201);

      expect(response.body.iterations[0].title).toBe(longTitle);
      expect(response.body.iterations[0].description).toBe(longDescription);
    });

    test('handles special characters in title and description', async () => {
      const specialTitle = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const specialDesc = '特殊字符 émojis 🚀 ñ';

      const response = await request(app)
        .post('/ideas')
        .send({ title: specialTitle, description: specialDesc })
        .expect(201);

      expect(response.body.iterations[0].title).toBe(specialTitle);
      expect(response.body.iterations[0].description).toBe(specialDesc);
    });

    test('preserves iteration order after multiple operations', async () => {
      const createResponse = await request(app)
        .post('/ideas')
        .send({ title: 'V1', description: 'V1 Description' })
        .expect(201);

      const ideaId = createResponse.body._id;
      const cookies = createResponse.headers['set-cookie'];

      // Add V2
      await request(app)
        .post(`/ideas/${ideaId}/improve`)
        .set('Cookie', cookies)
        .expect(200);

      // Edit V1
      await request(app)
        .patch(`/ideas/${ideaId}/iterations/1`)
        .set('Cookie', cookies)
        .send({ title: 'V1 Edited' })
        .expect(200);

      // Add V3
      await request(app)
        .post(`/ideas/${ideaId}/improve`)
        .set('Cookie', cookies)
        .expect(200);

      // Get final state
      const finalResponse = await request(app)
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
      const response1 = await request(app)
        .post('/ideas')
        .send({ title: 'Idea 1', description: 'Description 1' })
        .expect(201);

      const cookies = response1.headers['set-cookie'];

      // Use same cookie for second request
      const response2 = await request(app)
        .post('/ideas')
        .set('Cookie', cookies)
        .send({ title: 'Idea 2', description: 'Description 2' })
        .expect(201);

      // Both ideas should belong to same user
      const getAllResponse = await request(app)
        .get('/ideas')
        .set('Cookie', cookies)
        .expect(200);

      expect(getAllResponse.body).toHaveLength(2);
    });

    test('creates new user when no cookie is provided', async () => {
      const response1 = await request(app)
        .post('/ideas')
        .send({ title: 'User 1 Idea', description: 'Description' })
        .expect(201);

      const response2 = await request(app)
        .post('/ideas')
        .send({ title: 'User 2 Idea', description: 'Description' })
        .expect(201);

      // Different users should have different ideas
      expect(response1.body.userId).not.toBe(response2.body.userId);
    });
  });
});
