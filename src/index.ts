import config from './config';
import { createApp } from './app';
import { connectDatabase, setupGracefulShutdown } from './db';

/**
 * Entry point for the Hackathon Backend API
 * 
 * Startup sequence:
 * 1. Load and validate configuration (done in config module)
 * 2. Connect to MongoDB
 * 3. Create and configure Express app
 * 4. Start HTTP server
 * 5. Setup graceful shutdown handlers
 * 
 * Requirements: 13.5
 */
async function startServer(): Promise<void> {
  try {
    console.log('[Server] Starting Hackathon Backend API...');
    console.log(`[Server] Environment: ${config.nodeEnv}`);
    console.log(`[Server] Port: ${config.port}`);

    // Connect to MongoDB
    console.log('[Server] Connecting to database...');
    await connectDatabase();

    // Create Express application
    console.log('[Server] Initializing Express application...');
    const app = createApp();

    // Start HTTP server
    const server = app.listen(config.port, () => {
      console.log(`[Server] ✓ Server is running on port ${config.port}`);
      console.log(`[Server] ✓ Health check available at http://localhost:${config.port}/health`);
      console.log(`[Server] ✓ API endpoints:`);
      console.log(`[Server]   - POST   /ideas`);
      console.log(`[Server]   - GET    /ideas`);
      console.log(`[Server]   - GET    /ideas/:id`);
      console.log(`[Server]   - DELETE /ideas/:id`);
      console.log(`[Server]   - POST   /ideas/:id/improve`);
      console.log(`[Server]   - PATCH  /ideas/:id/iterations/:version`);
      console.log(`[Server]   - GET    /global-idea`);
      console.log('[Server] Ready to accept requests');
    });

    // Setup graceful shutdown
    setupGracefulShutdown();

    // Handle server errors
    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[Server] Error: Port ${config.port} is already in use`);
      } else {
        console.error('[Server] Server error:', error);
      }
      process.exit(1);
    });

  } catch (error) {
    console.error('[Server] Failed to start server:', error);
    process.exit(1);
  }
}

// Start the server
startServer();
