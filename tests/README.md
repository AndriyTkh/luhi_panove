# Testing Framework Setup

This directory contains the testing infrastructure for the Hackathon Backend API.

## Overview

The testing framework uses a dual approach:
- **Unit Tests**: Test specific examples, edge cases, and error conditions
- **Property-Based Tests**: Verify universal properties across generated inputs using fast-check

## Technology Stack

- **Jest**: Testing framework with TypeScript support via ts-jest
- **fast-check**: Property-based testing library (minimum 100 iterations per test)
- **mongodb-memory-server**: In-memory MongoDB for isolated testing
- **Supertest**: HTTP assertion library for API endpoint testing

## Directory Structure

```
tests/
├── setup.ts                    # Global test setup and mocks
├── unit/                       # Unit tests
│   ├── controllers/           # Controller tests
│   ├── services/              # Service tests
│   ├── middleware/            # Middleware tests
│   └── models/                # Model tests
└── properties/                # Property-based tests
    ├── authentication.properties.test.ts
    ├── ideaManagement.properties.test.ts
    ├── aiImprovement.properties.test.ts
    ├── dataIntegrity.properties.test.ts
    ├── errorHandling.properties.test.ts
    └── configuration.properties.test.ts
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run only unit tests
npm run test:unit

# Run only property-based tests
npm run test:properties
```

## Test Setup (setup.ts)

The setup file configures:

1. **MongoDB Memory Server**: Provides an in-memory MongoDB instance for each test suite
   - Automatically starts before all tests
   - Clears data after each test
   - Stops after all tests complete

2. **Gemini AI Mock**: Mocks the @google/generative-ai library
   - Returns predefined improved idea data
   - Prevents actual API calls during testing
   - Consistent responses for predictable testing

## Writing Tests

### Unit Tests

Unit tests should focus on:
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, special characters)
- Error conditions (validation failures, authorization errors)
- Integration points (database, external services)

Example:
```typescript
describe('IdeaService', () => {
  test('creates idea with initial iteration', async () => {
    const idea = await ideaService.createIdea(
      userId,
      'Test Idea',
      'Test Description'
    );
    
    expect(idea.iterations).toHaveLength(1);
    expect(idea.iterations[0].version).toBe(1);
  });
});
```

### Property-Based Tests

Property tests should:
- Reference the corresponding property from design.md
- Use minimum 100 iterations (configured via numRuns)
- Test universal properties that hold for all valid inputs
- Include property number and description in comments

Example:
```typescript
/**
 * Feature: hackathon-backend-api
 * Property 7: Idea Creation with Initial Iteration
 * 
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4**
 */
test('idea creation always produces exactly one iteration', () => {
  fc.assert(
    fc.property(
      fc.string({ minLength: 1 }),
      fc.string({ minLength: 1 }),
      async (title, description) => {
        const idea = await ideaService.createIdea(userId, title, description);
        expect(idea.iterations).toHaveLength(1);
        expect(idea.iterations[0].version).toBe(1);
      }
    ),
    { numRuns: 100 }
  );
});
```

## Coverage Goals

- Line coverage: >80%
- Branch coverage: >75%
- Function coverage: >85%
- Property tests: 100% of correctness properties from design.md

## Mocking Strategy

1. **MongoDB**: mongodb-memory-server provides real MongoDB instance (no mocking needed)
2. **Gemini AI**: Mocked in setup.ts with predefined responses
3. **Express Request/Response**: Use supertest for integration tests, mock objects for unit tests
4. **Environment Variables**: Use test-specific .env or mock process.env

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: The setup file automatically clears database after each test
3. **Async/Await**: Always use async/await for asynchronous operations
4. **Descriptive Names**: Test names should clearly describe what is being tested
5. **Arrange-Act-Assert**: Structure tests with clear setup, execution, and verification phases
6. **No Real External Calls**: Mock all external services (Gemini AI, etc.)

## Troubleshooting

### MongoDB Memory Server Timeout

If you see "Instance failed to start within 10000ms":
- The timeout has been increased to 60 seconds in setup.ts
- Ensure you have enough disk space and memory
- Check that no other MongoDB instances are blocking the port

### Test Timeout

If tests timeout:
- Individual test timeout is set to 60 seconds in jest.config.js
- Increase timeout for specific tests using: `test('name', async () => {...}, 90000)`

### Mock Not Working

If Gemini AI mock isn't applied:
- Ensure the mock is defined before importing the module that uses it
- Check that the mock path matches the actual import path
- Verify jest.mock() is called at the top level, not inside a test
