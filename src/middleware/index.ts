// Error handling exports
export {
  ApiError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  RateLimitError,
  ServerError,
  errorHandler,
} from './errorHandler';

// Auth middleware exports
export { requireAuth, optionalAuth } from './auth';
