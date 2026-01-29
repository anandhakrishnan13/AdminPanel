/**
 * Graceful shutdown utility
 * Handles cleanup of resources before process termination
 */

// Track resources that need cleanup
const cleanupTasks = [];

/**
 * Register a cleanup task
 * @param {string} name - Name of the resource
 * @param {Function} cleanup - Cleanup function
 */
export const registerCleanup = (name, cleanup) => {
  cleanupTasks.push({ name, cleanup });
};

/**
 * Execute graceful shutdown
 * @param {import('http').Server} server - HTTP server instance
 * @param {Set} connections - Active connections set
 */
export const gracefulShutdown = async (server, connections) => {
  console.log('Received shutdown signal. Starting graceful shutdown...');
  
  // Stop accepting new connections
  server.close(() => {
    console.log('HTTP server closed.');
  });
  
  // Close existing connections
  for (const connection of connections) {
    connection.destroy();
  }
  connections.clear();
  
  // Execute cleanup tasks
  for (const task of cleanupTasks) {
    try {
      console.log(`Cleaning up: ${task.name}`);
      await task.cleanup();
      console.log(`Cleanup complete: ${task.name}`);
    } catch (error) {
      console.error(`Cleanup failed for ${task.name}:`, error);
    }
  }
  
  // Clear any pending intervals/timeouts
  // This is a safety measure - specific cleanup should be registered
  
  console.log('Graceful shutdown complete.');
  process.exit(0);
};

export default { gracefulShutdown, registerCleanup };
