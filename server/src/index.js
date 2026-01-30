/**
 * Server entry point
 * Initializes Express server with all middlewares and routes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { requestLogger } from './middlewares/logger.middleware.js';
import apiRoutes from './routes/index.js';
import { gracefulShutdown } from './utils/shutdown.util.js';
import { connectDB, disconnectDB, getConnectionStatus } from './config/database.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Track active connections for graceful shutdown
const connections = new Set();

// ===================
// Security Middlewares
// ===================

// Helmet for security headers
app.use(helmet());

// CORS configuration - Parse multiple origins from environment variable
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
  : ['http://localhost:5173'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// ===================
// Body Parsing
// ===================

app.use(express.json({ limit: '10kb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ===================
// Logging
// ===================

app.use(requestLogger);

// ===================
// Health Check
// ===================

app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      database: getConnectionStatus(),
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  });
});

// ===================
// API Routes
// ===================

app.use('/api', apiRoutes);

// ===================
// Error Handling
// ===================

app.use(notFoundHandler);
app.use(errorHandler);

// ===================
// Server Startup
// ===================

// Connect to database
await connectDB();

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Track connections for graceful shutdown
server.on('connection', (connection) => {
  connections.add(connection);
  connection.on('close', () => {
    connections.delete(connection);
  });
});

// ===================
// Graceful Shutdown
// ===================

process.on('SIGTERM', async () => {
  await disconnectDB();
  gracefulShutdown(server, connections);
});

process.on('SIGINT', async () => {
  await disconnectDB();
  gracefulShutdown(server, connections);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown(server, connections);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

export default app;
