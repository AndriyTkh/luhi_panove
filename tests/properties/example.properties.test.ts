import fc from 'fast-check';

/**
 * Example property-based test demonstrating the setup
 * 
 * Feature: hackathon-backend-api
 * 
 * This is a placeholder test to verify the testing framework is properly configured.
 * Actual property tests should be implemented based on the design document properties.
 */

describe('Example Property Tests', () => {
  test('example property: string concatenation is associative', () => {
    fc.assert(
      fc.property(
        fc.string(),
        fc.string(),
        fc.string(),
        (a, b, c) => {
          // Property: (a + b) + c === a + (b + c)
          const left = (a + b) + c;
          const right = a + (b + c);
          expect(left).toBe(right);
        }
      ),
      { numRuns: 100 }
    );
  });

  test('example property: array length after push', () => {
    fc.assert(
      fc.property(
        fc.array(fc.integer()),
        fc.integer(),
        (arr, item) => {
          const originalLength = arr.length;
          arr.push(item);
          expect(arr.length).toBe(originalLength + 1);
        }
      ),
      { numRuns: 100 }
    );
  });
});
