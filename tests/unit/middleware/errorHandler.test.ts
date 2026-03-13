/**
 * Unit tests for Error Handler Middleware
 * Tests different error types and consistent error response format
 */

import { Request, Response, NextFunction } from 'express';
import {
  errorHandler,
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ServerError,
} from '../../../src/middleware/errorHandler';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let statusMock: jest.Mock;
  let jsonMock: jest.Mock;

  beforeEach(() => {
    // Mock console.error to avoid cluttering test output
    jest.spyOn(console, 'error').mockImplementation(() => {});

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
      const error = new ValidationError('Validation failed');
      
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Validation failed');
      expect(error.name).toBe('ValidationError');
    });

    test('ValidationError uses default message', () => {
      const error = new ValidationError();
      
      expect(error.message).toBe('Validation failed');
    });

    test('AuthenticationError has status code 401', () => {
      const error = new AuthenticationError('Authentication required');
      
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Authentication required');
      expect(error.name).toBe('AuthenticationError');
    });

    test('AuthenticationError uses default message', () => {
      const error = new AuthenticationError();
      
      expect(error.message).toBe('Authentication required');
    });

    test('AuthorizationError has status code 403', () => {
      const error = new AuthorizationError('Access forbidden');
      
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access forbidden');
      expect(error.name).toBe('AuthorizationError');
    });

    test('AuthorizationError uses default message', () => {
      const error = new AuthorizationError();
      
      expect(error.message).toBe('Access forbidden');
    });

    test('NotFoundError has status code 404', () => {
      const error = new NotFoundError('Resource not found');
      
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('Resource not found');
      expect(error.name).toBe('NotFoundError');
    });

    test('NotFoundError uses default message', () => {
      const error = new NotFoundError();
      
      expect(error.message).toBe('Resource not found');
    });

    test('RateLimitError has status code 429', () => {
      const error = new RateLimitError('Rate limit exceeded');
      
      expect(error.statusCode).toBe(429);
      expect(error.message).toBe('Rate limit exceeded');
      expect(error.name).toBe('RateLimitError');
    });

    test('RateLimitError uses default message', () => {
      const error = new RateLimitError();
      
      expect(error.message).toBe('Rate limit exceeded');
    });

    test('ServerError has status code 500', () => {
      const error = new ServerError('Internal server error');
      
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Internal server error');
      expect(error.name).toBe('ServerError');
    });

    test('ServerError uses default message', () => {
      const error = new ServerError();
      
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('errorHandler middleware', () => {
    test('handles ValidationError with status 400', () => {
      const error = new ValidationError('Invalid input data');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Invalid input data',
        statusCode: 400,
      });
    });

    test('handles AuthenticationError with status 401', () => {
      const error = new AuthenticationError('Please log in');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(401);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Please log in',
        statusCode: 401,
      });
    });

    test('handles AuthorizationError with status 403', () => {
      const error = new AuthorizationError('You do not have permission');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'You do not have permission',
        statusCode: 403,
      });
    });

    test('handles NotFoundError with status 404', () => {
      const error = new NotFoundError('Idea not found');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Idea not found',
        statusCode: 404,
      });
    });

    test('handles RateLimitError with status 429', () => {
      const error = new RateLimitError('Too many requests');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(429);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Too many requests',
        statusCode: 429,
      });
    });

    test('handles ServerError with status 500', () => {
      const error = new ServerError('Database connection failed');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Database connection failed',
        statusCode: 500,
      });
    });

    test('handles unknown errors as 500', () => {
      const error = new Error('Unexpected error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Internal server error',
        statusCode: 500,
      });
    });

    test('logs error details', () => {
      const error = new ValidationError('Test error');
      const consoleErrorSpy = jest.spyOn(console, 'error');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(consoleErrorSpy).toHaveBeenCalled();
      const loggedData = consoleErrorSpy.mock.calls[0][1];
      expect(loggedData).toHaveProperty('name', 'ValidationError');
      expect(loggedData).toHaveProperty('message', 'Test error');
      expect(loggedData).toHaveProperty('path', '/test');
      expect(loggedData).toHaveProperty('method', 'GET');
    });

    test('returns consistent JSON format for all error types', () => {
      const errors = [
        new ValidationError('Validation error'),
        new AuthenticationError('Auth error'),
        new AuthorizationError('Authorization error'),
        new NotFoundError('Not found error'),
        new RateLimitError('Rate limit error'),
        new ServerError('Server error'),
      ];

      errors.forEach((error) => {
        jsonMock.mockClear();
        errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

        const response = jsonMock.mock.calls[0][0];
        expect(response).toHaveProperty('message');
        expect(response).toHaveProperty('statusCode');
        expect(typeof response.message).toBe('string');
        expect(typeof response.statusCode).toBe('number');
      });
    });

    test('handles error with special characters in message', () => {
      const error = new ValidationError('Error with "quotes" and <tags>');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Error with "quotes" and <tags>',
        statusCode: 400,
      });
    });

    test('handles error with very long message', () => {
      const longMessage = 'A'.repeat(1000);
      const error = new ValidationError(longMessage);

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        message: longMessage,
        statusCode: 400,
      });
    });

    test('handles error with empty message', () => {
      const error = new ApiError(400, '');

      errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

      expect(jsonMock).toHaveBeenCalledWith({
        message: '',
        statusCode: 400,
      });
    });
  });
});
