import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local in development, .env in production
const envFile = process.env.NODE_ENV === 'production' ? '.env' : '.env.local';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

interface Config {
  port: number;
  nodeEnv: string;
  mongodb: {
    uri: string;
  };
  gemini: {
    apiKey: string;
  };
  session: {
    secret: string;
  };
  cookie: {
    secret: string;
  };
}

/**
 * Validates that all required environment variables are present
 * Throws descriptive errors if any required variable is missing
 */
function validateConfig(): void {
  const requiredVars = ['MONGODB_URI', 'GEMINI_API_KEY', 'SESSION_SECRET', 'COOKIE_SECRET'];

  const missingVars: string[] = [];

  for (const varName of requiredVars) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missingVars.push(varName);
    }
  }

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
        `Please ensure all required variables are set in your .env file.`
    );
  }
}

// Validate configuration on module load (fail-fast), but skip in test environment
if (process.env.NODE_ENV !== 'test') {
  validateConfig();
}

// Export validated configuration object
const config: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongodb: {
    uri: process.env.MONGODB_URI!,
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY!,
  },
  session: {
    secret: process.env.SESSION_SECRET!,
  },
  cookie: {
    secret: process.env.COOKIE_SECRET!,
  },
};

export default config;
