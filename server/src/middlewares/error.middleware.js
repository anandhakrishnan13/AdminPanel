/**
 * Error handling middleware
 * Centralized error handling for the application
 */

/**
 * Custom application error class
 */
export class AppError extends Error {
  /**
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   * @param {string} code - Error code
   * @param {Array} details - Error details
   */
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Validation error factory
 */
export const createValidationError = (details) => {
  return new AppError(
    'Validation failed',
    400,
    'VALIDATION_ERROR',
    details
  );
};

/**
 * Not found error factory
 */
export const createNotFoundError = (resource) => {
  return new AppError(
    `${resource} not found`,
    404,
    'NOT_FOUND'
  );
};

/**
 * Unauthorized error factory
 */
export const createUnauthorizedError = (message = 'Unauthorized') => {
  return new AppError(
    message,
    401,
    'UNAUTHORIZED'
  );
};

/**
 * Forbidden error factory
 */
export const createForbiddenError = (message = 'Forbidden') => {
  return new AppError(
    message,
    403,
    'FORBIDDEN'
  );
};

/**
 * Not found route handler
 */
export const notFoundHandler = (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404, 'ROUTE_NOT_FOUND'));
};

/**
 * Global error handler middleware
 */
export const errorHandler = (err, req, res, next) => {
  // Default values
  let statusCode = err.statusCode || 500;
  let code = err.code || 'INTERNAL_ERROR';
  let message = err.message || 'An unexpected error occurred';
  let details = err.details || null;
  
  // Log error (in production, use proper logging)
  if (statusCode >= 500) {
    console.error('Server Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }
  
  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && !err.isOperational) {
    message = 'An unexpected error occurred';
    details = null;
  }
  
  // Handle specific error types
  if (err.name === 'SyntaxError' && err.status === 400) {
    statusCode = 400;
    code = 'INVALID_JSON';
    message = 'Invalid JSON in request body';
  }
  
  if (err.name === 'ValidationError') {
    statusCode = 400;
    code = 'VALIDATION_ERROR';
  }
  
  const response = {
    success: false,
    error: {
      code,
      message,
    },
  };
  
  if (details) {
    response.error.details = details;
  }
  
  // Add stack trace in development
  if (process.env.NODE_ENV === 'development' && err.stack) {
    response.error.stack = err.stack;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Async handler wrapper to catch async errors
 * @param {Function} fn - Async route handler
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export default {
  AppError,
  errorHandler,
  notFoundHandler,
  asyncHandler,
  createValidationError,
  createNotFoundError,
  createUnauthorizedError,
  createForbiddenError,
};
