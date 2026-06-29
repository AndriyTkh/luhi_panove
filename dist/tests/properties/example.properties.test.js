"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fast_check_1 = __importDefault(require("fast-check"));
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
        fast_check_1.default.assert(fast_check_1.default.property(fast_check_1.default.string(), fast_check_1.default.string(), fast_check_1.default.string(), (a, b, c) => {
            // Property: (a + b) + c === a + (b + c)
            const left = (a + b) + c;
            const right = a + (b + c);
            expect(left).toBe(right);
        }), { numRuns: 100 });
    });
    test('example property: array length after push', () => {
        fast_check_1.default.assert(fast_check_1.default.property(fast_check_1.default.array(fast_check_1.default.integer()), fast_check_1.default.integer(), (arr, item) => {
            const originalLength = arr.length;
            arr.push(item);
            expect(arr.length).toBe(originalLength + 1);
        }), { numRuns: 100 });
    });
});
//# sourceMappingURL=example.properties.test.js.map