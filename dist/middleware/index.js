"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.optionalAuth = exports.requireAuth = exports.errorHandler = exports.ServerError = exports.RateLimitError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.ApiError = void 0;
// Error handling exports
var errorHandler_1 = require("./errorHandler");
Object.defineProperty(exports, "ApiError", { enumerable: true, get: function () { return errorHandler_1.ApiError; } });
Object.defineProperty(exports, "ValidationError", { enumerable: true, get: function () { return errorHandler_1.ValidationError; } });
Object.defineProperty(exports, "AuthenticationError", { enumerable: true, get: function () { return errorHandler_1.AuthenticationError; } });
Object.defineProperty(exports, "AuthorizationError", { enumerable: true, get: function () { return errorHandler_1.AuthorizationError; } });
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return errorHandler_1.NotFoundError; } });
Object.defineProperty(exports, "RateLimitError", { enumerable: true, get: function () { return errorHandler_1.RateLimitError; } });
Object.defineProperty(exports, "ServerError", { enumerable: true, get: function () { return errorHandler_1.ServerError; } });
Object.defineProperty(exports, "errorHandler", { enumerable: true, get: function () { return errorHandler_1.errorHandler; } });
// Auth middleware exports
var auth_1 = require("./auth");
Object.defineProperty(exports, "requireAuth", { enumerable: true, get: function () { return auth_1.requireAuth; } });
Object.defineProperty(exports, "optionalAuth", { enumerable: true, get: function () { return auth_1.optionalAuth; } });
//# sourceMappingURL=index.js.map