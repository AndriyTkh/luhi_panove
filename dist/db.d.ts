/**
 * Connect to MongoDB using Mongoose
 * Handles connection errors and provides graceful shutdown
 */
export declare function connectDatabase(): Promise<void>;
/**
 * Disconnect from MongoDB
 * Used for graceful shutdown
 */
export declare function disconnectDatabase(): Promise<void>;
/**
 * Setup graceful shutdown handlers
 * Ensures database connection is closed properly on process termination
 */
export declare function setupGracefulShutdown(): void;
//# sourceMappingURL=db.d.ts.map