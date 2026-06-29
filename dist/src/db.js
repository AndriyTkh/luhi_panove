"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDatabase = connectDatabase;
exports.disconnectDatabase = disconnectDatabase;
exports.setupGracefulShutdown = setupGracefulShutdown;
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("./config"));
/**
 * Connect to MongoDB using Mongoose
 * Handles connection errors and provides graceful shutdown
 */
async function connectDatabase() {
    try {
        await mongoose_1.default.connect(config_1.default.mongodb.uri);
        console.log('[Database] Connected to MongoDB successfully');
        console.log(`[Database] Database: ${mongoose_1.default.connection.name}`);
    }
    catch (error) {
        console.error('[Database] Failed to connect to MongoDB:', error);
        throw error;
    }
}
/**
 * Disconnect from MongoDB
 * Used for graceful shutdown
 */
async function disconnectDatabase() {
    try {
        await mongoose_1.default.disconnect();
        console.log('[Database] Disconnected from MongoDB');
    }
    catch (error) {
        console.error('[Database] Error disconnecting from MongoDB:', error);
        throw error;
    }
}
/**
 * Setup graceful shutdown handlers
 * Ensures database connection is closed properly on process termination
 */
function setupGracefulShutdown() {
    const shutdown = async (signal) => {
        console.log(`\n[Server] ${signal} received, starting graceful shutdown...`);
        try {
            await disconnectDatabase();
            console.log('[Server] Graceful shutdown completed');
            process.exit(0);
        }
        catch (error) {
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
//# sourceMappingURL=db.js.map