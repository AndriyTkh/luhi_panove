import { Request, Response, NextFunction } from 'express';
/**
 * Base API Error class with status code and message
 */
export declare class ApiError extends Error {
    readonly statusCode: number;
    constructor(statusCode: number, message: string);
}
/**
 * 400 Bad Request - Validation errors
 */
export declare class ValidationError extends ApiError {
    constructor(message?: string);
}
/**
 * 401 Unauthorized - Authentication errors
 */
export declare class AuthenticationError extends ApiError {
    constructor(message?: string);
}
/**
 * 403 Forbidden - Authorization errors
 */
export declare class AuthorizationError extends ApiError {
    constructor(message?: string);
}
/**
 * 404 Not Found - Resource not found errors
 */
export declare class NotFoundError extends ApiError {
    constructor(message?: string);
}
/**
 * 429 Too Many Requests - Rate limiting errors
 */
export declare class RateLimitError extends ApiError {
    constructor(message?: string);
}
/**
 * 500 Internal Server Error - Server errors
 */
export declare class ServerError extends ApiError {
    constructor(message?: string);
}
/**
 * Centralized error handler middleware
 * Catches all errors and formats them into consistent JSON responses
 */
export declare const errorHandler: (err: Error, req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandler.d.ts.map