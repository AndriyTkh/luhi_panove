"use strict";
/**
 * Unit tests for Error Handler Middleware
 * Tests different error types and consistent error response format
 */
Object.defineProperty(exports, "__esModule", { value: true });
const errorHandler_1 = require("../../../src/middleware/errorHandler");
describe('Error Handler Middleware', () => {
    let mockRequest;
    let mockResponse;
    let mockNext;
    let statusMock;
    let jsonMock;
    beforeEach(() => {
        // Mock console.error to avoid cluttering test output
        jest.spyOn(console, 'error').mockImplementation(() => { });
        statusMock = jest.fn().mockReturnThis();
        jsonMock = jest.fn();
        mockRequest = {
            path: '/test',
            method: 'GET',
        };
        mockResponse = {
            status: statusMock,
            json: jsonMock,
        };
        mockNext = jest.fn();
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    describe('ApiError classes', () => {
        test('ValidationError has status code 400', () => {
            const error = new errorHandler_1.ValidationError('Validation failed');
            expect(error.statusCode).toBe(400);
            expect(error.message).toBe('Validation failed');
            expect(error.name).toBe('ValidationError');
        });
        test('ValidationError uses default message', () => {
            const error = new errorHandler_1.ValidationError();
            expect(error.message).toBe('Validation failed');
        });
        test('AuthenticationError has status code 401', () => {
            const error = new errorHandler_1.AuthenticationError('Authentication required');
            expect(error.statusCode).toBe(401);
            expect(error.message).toBe('Authentication required');
            expect(error.name).toBe('AuthenticationError');
        });
        test('AuthenticationError uses default message', () => {
            const error = new errorHandler_1.AuthenticationError();
            expect(error.message).toBe('Authentication required');
        });
        test('AuthorizationError has status code 403', () => {
            const error = new errorHandler_1.AuthorizationError('Access forbidden');
            expect(error.statusCode).toBe(403);
            expect(error.message).toBe('Access forbidden');
            expect(error.name).toBe('AuthorizationError');
        });
        test('AuthorizationError uses default message', () => {
            const error = new errorHandler_1.AuthorizationError();
            expect(error.message).toBe('Access forbidden');
        });
        test('NotFoundError has status code 404', () => {
            const error = new errorHandler_1.NotFoundError('Resource not found');
            expect(error.statusCode).toBe(404);
            expect(error.message).toBe('Resource not found');
            expect(error.name).toBe('NotFoundError');
        });
        test('NotFoundError uses default message', () => {
            const error = new errorHandler_1.NotFoundError();
            expect(error.message).toBe('Resource not found');
        });
        test('RateLimitError has status code 429', () => {
            const error = new errorHandler_1.RateLimitError('Rate limit exceeded');
            expect(error.statusCode).toBe(429);
            expect(error.message).toBe('Rate limit exceeded');
            expect(error.name).toBe('RateLimitError');
        });
        test('RateLimitError uses default message', () => {
            const error = new errorHandler_1.RateLimitError();
            expect(error.message).toBe('Rate limit exceeded');
        });
        test('ServerError has status code 500', () => {
            const error = new errorHandler_1.ServerError('Internal server error');
            expect(error.statusCode).toBe(500);
            expect(error.message).toBe('Internal server error');
            expect(error.name).toBe('ServerError');
        });
        test('ServerError uses default message', () => {
            const error = new errorHandler_1.ServerError();
            expect(error.message).toBe('Internal server error');
        });
    });
    describe('errorHandler middleware', () => {
        test('handles ValidationError with status 400', () => {
            const error = new errorHandler_1.ValidationError('Invalid input data');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Invalid input data',
                statusCode: 400,
            });
        });
        test('handles AuthenticationError with status 401', () => {
            const error = new errorHandler_1.AuthenticationError('Please log in');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(statusMock).toHaveBeenCalledWith(401);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Please log in',
                statusCode: 401,
            });
        });
        test('handles AuthorizationError with status 403', () => {
            const error = new errorHandler_1.AuthorizationError('You do not have permission');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(statusMock).toHaveBeenCalledWith(403);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'You do not have permission',
                statusCode: 403,
            });
        });
        test('handles NotFoundError with status 404', () => {
            const error = new errorHandler_1.NotFoundError('Idea not found');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Idea not found',
                statusCode: 404,
            });
        });
        test('handles RateLimitError with status 429', () => {
            const error = new errorHandler_1.RateLimitError('Too many requests');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(statusMock).toHaveBeenCalledWith(429);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Too many requests',
                statusCode: 429,
            });
        });
        test('handles ServerError with status 500', () => {
            const error = new errorHandler_1.ServerError('Database connection failed');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Database connection failed',
                statusCode: 500,
            });
        });
        test('handles unknown errors as 500', () => {
            const error = new Error('Unexpected error');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Internal server error',
                statusCode: 500,
            });
        });
        test('logs error details', () => {
            const error = new errorHandler_1.ValidationError('Test error');
            const consoleErrorSpy = jest.spyOn(console, 'error');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(consoleErrorSpy).toHaveBeenCalled();
            const loggedData = consoleErrorSpy.mock.calls[0][1];
            expect(loggedData).toHaveProperty('name', 'ValidationError');
            expect(loggedData).toHaveProperty('message', 'Test error');
            expect(loggedData).toHaveProperty('path', '/test');
            expect(loggedData).toHaveProperty('method', 'GET');
        });
        test('returns consistent JSON format for all error types', () => {
            const errors = [
                new errorHandler_1.ValidationError('Validation error'),
                new errorHandler_1.AuthenticationError('Auth error'),
                new errorHandler_1.AuthorizationError('Authorization error'),
                new errorHandler_1.NotFoundError('Not found error'),
                new errorHandler_1.RateLimitError('Rate limit error'),
                new errorHandler_1.ServerError('Server error'),
            ];
            errors.forEach((error) => {
                jsonMock.mockClear();
                (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
                const response = jsonMock.mock.calls[0][0];
                expect(response).toHaveProperty('message');
                expect(response).toHaveProperty('statusCode');
                expect(typeof response.message).toBe('string');
                expect(typeof response.statusCode).toBe('number');
            });
        });
        test('handles error with special characters in message', () => {
            const error = new errorHandler_1.ValidationError('Error with "quotes" and <tags>');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Error with "quotes" and <tags>',
                statusCode: 400,
            });
        });
        test('handles error with very long message', () => {
            const longMessage = 'A'.repeat(1000);
            const error = new errorHandler_1.ValidationError(longMessage);
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(jsonMock).toHaveBeenCalledWith({
                message: longMessage,
                statusCode: 400,
            });
        });
        test('handles error with empty message', () => {
            const error = new errorHandler_1.ApiError(400, '');
            (0, errorHandler_1.errorHandler)(error, mockRequest, mockResponse, mockNext);
            expect(jsonMock).toHaveBeenCalledWith({
                message: '',
                statusCode: 400,
            });
        });
    });
});
//# sourceMappingURL=errorHandler.test.js.map