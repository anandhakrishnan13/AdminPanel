/**
 * Database Connection Module
 * Establishes MongoDB connection with proper pooling and error handling
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connection options
const options = {
  minPoolSize: parseInt(process.env.DB_MIN_POOL_SIZE) || 5,
  maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE) || 20,
  serverSelectionTimeoutMS: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 30000,
  socketTimeoutMS: 45000,
};

// MongoDB URI from environment
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/admin_rbac';

/**
 * Connect to MongoDB
 * @returns {Promise<void>}
 */
export const connectDB = async () => {
  try {
    // Enable debug mode in development
    if (process.env.NODE_ENV === 'development') {
      mongoose.set('debug', true);
    }

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, options);

    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    console.log(`📊 Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

/**
 * Disconnect from MongoDB
 * @returns {Promise<void>}
 */
export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 MongoDB Disconnected');
  } catch (error) {
    console.error('❌ MongoDB Disconnection Error:', error.message);
  }
};

/**
 * Get MongoDB connection status
 * @returns {string}
 */
export const getConnectionStatus = () => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  return states[mongoose.connection.readyState] || 'unknown';
};

// Connection event listeners
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

export default {
  connectDB,
  disconnectDB,
  getConnectionStatus,
};
