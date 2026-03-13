import { Application } from 'express';
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
export declare function createApp(): Application;
//# sourceMappingURL=app.d.ts.map