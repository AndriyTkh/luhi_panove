import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import config from './config';
import { errorHandler } from './middleware/errorHandler';
import { requireAuth } from './middleware/auth';
import ideaRoutes from './routes/ideas';
import globalIdeaRoutes from './routes/globalIdea';

/**
 * Create and configure Express application
 * Sets up middleware, routes, and error handling
 * 
 * Middleware pipeline order (as per design):
 * 1. Body parser (express.json, express.urlencoded)
 * 2. CORS
 * 3. Cookie parser (with signed cookie secret)
 * 4. Auto-identify user middleware (applied globally)
 * 5. Routes
 * 6. Error handler
 */
export function createApp(): Application {
  const app = express();

  // Body parser middleware - parse JSON and URL-encoded request bodies
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS middleware - allow cross-origin requests
  // Note: In production, configure specific origins instead of allowing all
  app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
  }));

  // Cookie parser middleware - parse cookies with secret for signed cookies
  app.use(cookieParser(config.cookie.secret));

  // Auto-identify user middleware - applied globally to all routes
  // Automatically creates or finds guest user based on IP and guestId cookie
  app.use(requireAuth);

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({ 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      environment: config.nodeEnv 
    });
  });

  // API Routes
  // Note: All routes now have user attached via global autoIdentifyUser middleware
  app.use('/ideas', ideaRoutes);
  app.use('/global-idea', globalIdeaRoutes);

  // 404 handler for undefined routes
  app.use((req, res) => {
    res.status(404).json({
      message: 'Route not found',
      statusCode: 404,
      path: req.path,
    });
  });

  // Error handler middleware (must be last)
  app.use(errorHandler);

  return app;
}
