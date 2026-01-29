/**
 * Response utility functions
 * Standardized API response formatting
 */

/**
 * Send success response
 * @param {import('express').Response} res
 * @param {object} data - Response data
 * @param {number} statusCode - HTTP status code
 * @param {object} meta - Additional metadata
 */
export const sendSuccess = (res, data, statusCode = 200, meta = null) => {
  const response = {
    success: true,
    data,
  };
  
  if (meta) {
    response.meta = meta;
  }
  
  res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {import('express').Response} res
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} code - Error code
 * @param {Array} details - Error details
 */
export const sendError = (res, message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) => {
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
  
  res.status(statusCode).json(response);
};

/**
 * Send paginated response with cursor
 * @param {import('express').Response} res
 * @param {Array} data - Response data
 * @param {object} pagination - Pagination info
 */
export const sendPaginated = (res, data, pagination) => {
  const response = {
    success: true,
    data,
    meta: {
      pagination: {
        cursor: pagination.nextCursor,
        hasMore: pagination.hasMore,
        limit: pagination.limit,
        total: pagination.total ?? undefined,
      },
    },
  };
  
  res.status(200).json(response);
};

export default {
  sendSuccess,
  sendError,
  sendPaginated,
};
