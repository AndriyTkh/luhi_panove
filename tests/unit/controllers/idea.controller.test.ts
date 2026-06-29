/**
 * Unit tests for IdeaController POST /ideas
 * Verifies that the response includes verdict from Gemini AI
 */

import request from 'supertest';
import { createApp } from '../../../src/app';

describe('POST /ideas', () => {
  const app = createApp();

  test('returns 201 with verdict in the AI-improved iteration', async () => {
    const res = await request(app)
      .post('/ideas')
      .send({ title: 'My Startup Idea', description: 'An app that solves a real problem' });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('iterations');

    // iterations[1] is the AI-improved one
    const aiIteration = res.body.iterations[1];
    expect(aiIteration).toBeDefined();
    expect(aiIteration).toHaveProperty('verdict');
    expect(aiIteration.verdict).toHaveProperty('shortFeedback');
    expect(aiIteration.verdict).toHaveProperty('adviceAndDescription');
    expect(typeof aiIteration.verdict.shortFeedback).toBe('string');
    expect(typeof aiIteration.verdict.adviceAndDescription).toBe('string');
  });

  test('verdict fields are non-empty strings', async () => {
    const res = await request(app)
      .post('/ideas')
      .send({ title: 'SaaS Tool', description: 'Automates repetitive tasks for small businesses' });

    expect(res.status).toBe(201);

    const { verdict } = res.body.iterations[1];
    expect(verdict.shortFeedback.length).toBeGreaterThan(0);
    expect(verdict.adviceAndDescription.length).toBeGreaterThan(0);
  });

  test('original iteration (v1) does not include verdict', async () => {
    const res = await request(app)
      .post('/ideas')
      .send({ title: 'Raw Idea', description: 'Just the initial concept' });

    expect(res.status).toBe(201);
    expect(res.body.iterations[0].verdict).toBeUndefined();
  });
});
