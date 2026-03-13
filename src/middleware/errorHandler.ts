import { Request, Response, NextFunction } from 'express';

/**
 * Base API Error class with status code and message
 */
export class ApiError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * 400 Bad Request - Validation errors
 */
export class ValidationError extends ApiError {
  constructor(message: string = 'Validation failed') {
    super(400, message);
  }
}

/**
 * 401 Unauthorized - Authentication errors
 */
export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication required') {
    super(401, message);
  }
}

/**
 * 403 Forbidden - Authorization errors
 */
export class AuthorizationError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(403, message);
  }
}

/**
 * 404 Not Found - Resource not found errors
 */
export class NotFoundError extends ApiError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

/**
 * 429 Too Many Requests - Rate limiting errors
 */
export class RateLimitError extends ApiError {
  constructor(message: string = 'Rate limit exceeded') {
    super(429, message);
  }
}

/**
 * 500 Internal Server Error - Server errors
 */
export class ServerError extends ApiError {
  constructor(message: string = 'Internal server error') {
    super(500, message);
  }
}

/**
 * Centralized error handler middleware
 * Catches all errors and formats them into consistent JSON responses
 */
export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Log error for debugging
  console.error('[Error Handler]', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  // Handle ApiError instances
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      message: err.message,
      statusCode: err.statusCode,
    });
    return;
  }

  // Handle unknown errors as 500
  res.status(500).json({
    message: 'Internal server error',
    statusCode: 500,
  });
};
