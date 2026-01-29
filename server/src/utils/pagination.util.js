/**
 * Pagination utility functions
 * Implements cursor-based pagination for efficient data retrieval
 */

import config from '../config/index.js';

/**
 * Parse pagination parameters from request query
 * @param {object} query - Request query object
 * @returns {object} Parsed pagination params
 */
export const parsePaginationParams = (query) => {
  const cursor = query.cursor || null;
  let limit = parseInt(query.limit, 10) || config.defaultPageLimit;
  
  // Enforce maximum limit
  if (limit > config.maxPageLimit) {
    limit = config.maxPageLimit;
  }
  
  if (limit < 1) {
    limit = 1;
  }
  
  return { cursor, limit };
};

/**
 * Apply cursor-based pagination to an array
 * @param {Array} items - Array of items
 * @param {string|null} cursor - Current cursor (item id)
 * @param {number} limit - Number of items per page
 * @param {string} idField - Field to use as cursor reference
 * @returns {object} Paginated result
 */
export const paginateArray = (items, cursor, limit, idField = 'id') => {
  let startIndex = 0;
  
  if (cursor) {
    const cursorIndex = items.findIndex(item => item[idField] === cursor);
    if (cursorIndex !== -1) {
      startIndex = cursorIndex + 1;
    }
  }
  
  const paginatedItems = items.slice(startIndex, startIndex + limit + 1);
  const hasMore = paginatedItems.length > limit;
  const data = hasMore ? paginatedItems.slice(0, -1) : paginatedItems;
  const nextCursor = hasMore ? data[data.length - 1][idField] : null;
  
  return {
    data,
    pagination: {
      nextCursor,
      hasMore,
      limit,
      total: items.length,
    },
  };
};

/**
 * Create pagination result for database queries
 * @param {Array} items - Query result items
 * @param {number} limit - Requested limit
 * @param {string} idField - Field to use as cursor
 * @returns {object} Paginated result
 */
export const createPaginationResult = (items, limit, idField = 'id') => {
  const hasMore = items.length > limit;
  const data = hasMore ? items.slice(0, -1) : items;
  const nextCursor = hasMore && data.length > 0 ? data[data.length - 1][idField] : null;
  
  return {
    data,
    pagination: {
      nextCursor,
      hasMore,
      limit,
    },
  };
};

export default {
  parsePaginationParams,
  paginateArray,
  createPaginationResult,
};
