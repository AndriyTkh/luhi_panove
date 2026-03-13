"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ServerError = exports.RateLimitError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApiError = void 0;
/**
 * Base API Error class with status code and message
 */
class ApiError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.ApiError = ApiError;
/**
 * 400 Bad Request - Validation errors
 */
class ValidationError extends ApiError {
    constructor(message = 'Validation failed') {
        super(400, message);
    }
}
exports.ValidationError = ValidationError;
/**
 * 401 Unauthorized - Authentication errors
 */
class AuthenticationError extends ApiError {
    constructor(message = 'Authentication required') {
        super(401, message);
    }
}
exports.AuthenticationError = AuthenticationError;
/**
 * 403 Forbidden - Authorization errors
 */
class AuthorizationError extends ApiError {
    constructor(message = 'Access forbidden') {
        super(403, message);
    }
}
exports.AuthorizationError = AuthorizationError;
/**
 * 404 Not Found - Resource not found errors
 */
class NotFoundError extends ApiError {
    constructor(message = 'Resource not found') {
        super(404, message);
    }
}
exports.NotFoundError = NotFoundError;
/**
 * 429 Too Many Requests - Rate limiting errors
 */
class RateLimitError extends ApiError {
    constructor(message = 'Rate limit exceeded') {
        super(429, message);
    }
}
exports.RateLimitError = RateLimitError;
/**
 * 500 Internal Server Error - Server errors
 */
class ServerError extends ApiError {
    constructor(message = 'Internal server error') {
        super(500, message);
    }
}
exports.ServerError = ServerError;
/**
 * Centralized error handler middleware
 * Catches all errors and formats them into consistent JSON responses
 */
const errorHandler = (err, req, res, _next) => {
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
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map