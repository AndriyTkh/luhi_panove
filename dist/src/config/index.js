"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables from .env.local in development, .env in production
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv_1.default.config({ path: path_1.default.resolve(process.cwd(), envFile) });
/**
 * Validates that all required environment variables are present
 * Throws descriptive errors if any required variable is missing
 */
function validateConfig() {
    const requiredVars = ['MONGODB_URI', 'GEMINI_API_KEY', 'SESSION_SECRET', 'COOKIE_SECRET'];
    const missingVars = [];
    for (const varName of requiredVars) {
        const value = process.env[varName];
        if (!value || value.trim() === '') {
            missingVars.push(varName);
        }
    }
    if (missingVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingVars.join(', ')}\n` +
            `Please ensure all required variables are set in your .env file.`);
    }
}
// Validate configuration on module load (fail-fast), but skip in test environment
if (process.env.NODE_ENV !== 'test') {
    validateConfig();
}
// Export validated configuration object
const config = {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    mongodb: {
        uri: process.env.MONGODB_URI,
    },
    gemini: {
        apiKey: process.env.GEMINI_API_KEY,
    },
    session: {
        secret: process.env.SESSION_SECRET,
    },
    cookie: {
        secret: process.env.COOKIE_SECRET,
    },
};
exports.default = config;
//# sourceMappingURL=index.js.map