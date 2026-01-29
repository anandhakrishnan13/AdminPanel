/**
 * Application configuration
 * Centralized config management from environment variables
 */

export const config = {
  // Server
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  
  // Rate Limiting
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 min
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
  
  // Pagination
  defaultPageLimit: 20,
  maxPageLimit: 100,
  
  // JWT (if using authentication)
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  
  // Database (placeholder)
  databaseUrl: process.env.DATABASE_URL || '',
};

/**
 * Validate required environment variables
 */
export const validateConfig = () => {
  const requiredEnvVars = [];
  
  // Add required vars based on environment
  if (config.nodeEnv === 'production') {
    requiredEnvVars.push('JWT_SECRET', 'CORS_ORIGIN');
  }
  
  const missing = requiredEnvVars.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

export default config;
