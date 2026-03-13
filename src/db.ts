import mongoose from 'mongoose';
import config from './config';

/**
 * Connect to MongoDB using Mongoose
 * Handles connection errors and provides graceful shutdown
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('[Database] Connected to MongoDB successfully');
    console.log(`[Database] Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('[Database] Failed to connect to MongoDB:', error);
    throw error;
  }
}

/**
 * Disconnect from MongoDB
 * Used for graceful shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.disconnect();
    console.log('[Database] Disconnected from MongoDB');
  } catch (error) {
    console.error('[Database] Error disconnecting from MongoDB:', error);
    throw error;
  }
}

/**
 * Setup graceful shutdown handlers
 * Ensures database connection is closed properly on process termination
 */
export function setupGracefulShutdown(): void {
  const shutdown = async (signal: string) => {
    console.log(`\n[Server] ${signal} received, starting graceful shutdown...`);
    try {
      await disconnectDatabase();
      console.log('[Server] Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      console.error('[Server] Error during graceful shutdown:', error);
      process.exit(1);
    }
  };

  // Handle different termination signals
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    console.error('[Server] Uncaught Exception:', error);
    shutdown('UNCAUGHT_EXCEPTION');
  });

  process.on('unhandledRejection', (reason, promise) => {
    console.error('[Server] Unhandled Rejection at:', promise, 'reason:', reason);
    shutdown('UNHANDLED_REJECTION');
  });
}
