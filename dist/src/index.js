"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("./config"));
const app_1 = require("./app");
const db_1 = require("./db");
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
async function startServer() {
    try {
        console.log('[Server] Starting Hackathon Backend API...');
        console.log(`[Server] Environment: ${config_1.default.nodeEnv}`);
        console.log(`[Server] Port: ${config_1.default.port}`);
        // Connect to MongoDB
        console.log('[Server] Connecting to database...');
        await (0, db_1.connectDatabase)();
        // Create Express application
        console.log('[Server] Initializing Express application...');
        const app = (0, app_1.createApp)();
        // Start HTTP server
        const server = app.listen(config_1.default.port, () => {
            console.log(`[Server] ✓ Server is running on port ${config_1.default.port}`);
            console.log(`[Server] ✓ Health check available at http://localhost:${config_1.default.port}/health`);
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
        (0, db_1.setupGracefulShutdown)();
        // Handle server errors
        server.on('error', (error) => {
            if (error.code === 'EADDRINUSE') {
                console.error(`[Server] Error: Port ${config_1.default.port} is already in use`);
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