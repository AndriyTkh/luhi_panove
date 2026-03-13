"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const app_1 = require("./app");
const db_1 = require("./db");
/**
 * Start the server
 * Connects to database and starts Express server
 */
async function startServer() {
    try {
        console.log('[Server] Starting Hackathon Backend API...');
        console.log(`[Server] Environment: ${config_1.default.nodeEnv}`);
        // Connect to MongoDB
        await (0, db_1.connectDatabase)();
        // Create Express application
        const app = (0, app_1.createApp)();
        // Start listening
        const server = app.listen(config_1.default.port, () => {
            console.log(`[Server] Server is running on port ${config_1.default.port}`);
            console.log(`[Server] Health check: http://localhost:${config_1.default.port}/health`);
        });
        // Setup graceful shutdown handlers
        (0, db_1.setupGracefulShutdown)();
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`[Server] Port ${config_1.default.port} is already in use`);
            }
            else {
                console.error('[Server] Server error:', error);
            }
            process.exit(1);
        });
    }
    catch (error) {
        console.error('[Server] Failed to start server:', error);
        process.exit(1);
    }
}
// Start the server
startServer();
//# sourceMappingURL=index.js.map