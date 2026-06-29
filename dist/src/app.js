"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const config_1 = __importDefault(require("./config"));
const errorHandler_1 = require("./middleware/errorHandler");
const auth_1 = require("./middleware/auth");
const ideas_1 = __importDefault(require("./routes/ideas"));
const globalIdea_1 = __importDefault(require("./routes/globalIdea"));
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
function createApp() {
    const app = (0, express_1.default)();
    // Body parser middleware - parse JSON and URL-encoded request bodies
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    // CORS middleware - allow cross-origin requests
    // Note: In production, configure specific origins instead of allowing all
    app.use((0, cors_1.default)({
        origin: '*',
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'],
    }));
    // Cookie parser middleware - parse cookies with secret for signed cookies
    app.use((0, cookie_parser_1.default)(config_1.default.cookie.secret));
    // Auto-identify user middleware - applied globally to all routes
    // Automatically creates or finds guest user based on IP and guestId cookie
    app.use(auth_1.requireAuth);
    // Health check endpoint
    app.get('/health', (_req, res) => {
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            environment: config_1.default.nodeEnv
        });
    });
    // API Routes
    // Note: All routes now have user attached via global autoIdentifyUser middleware
    app.use('/ideas', ideas_1.default);
    app.use('/global-idea', globalIdea_1.default);
    // 404 handler for undefined routes
    app.use((req, res) => {
        res.status(404).json({
            message: 'Route not found',
            statusCode: 404,
            path: req.path,
        });
    });
    // Error handler middleware (must be last)
    app.use(errorHandler_1.errorHandler);
    return app;
}
//# sourceMappingURL=app.js.map