/**
 * Request validation middleware
 */

import { createValidationError } from './error.middleware.js';

/**
 * Validate request against a schema
 * @param {object} schema - Validation schema
 * @param {string} source - Source to validate ('body', 'query', 'params')
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];
    const errors = [];
    
    // Check required fields
    if (schema.required) {
      for (const field of schema.required) {
        if (data[field] === undefined || data[field] === null || data[field] === '') {
          errors.push({
            field,
            message: `${field} is required`,
          });
        }
      }
    }
    
    // Check field types and constraints
    if (schema.fields) {
      for (const [field, rules] of Object.entries(schema.fields)) {
        const value = data[field];
        
        if (value === undefined || value === null) {
          continue; // Skip undefined fields (handled by required check)
        }
        
        // Type check
        if (rules.type) {
          const actualType = Array.isArray(value) ? 'array' : typeof value;
          if (actualType !== rules.type) {
            errors.push({
              field,
              message: `${field} must be of type ${rules.type}`,
            });
            continue;
          }
        }
        
        // String constraints
        if (rules.type === 'string') {
          if (rules.minLength && value.length < rules.minLength) {
            errors.push({
              field,
              message: `${field} must be at least ${rules.minLength} characters`,
            });
          }
          if (rules.maxLength && value.length > rules.maxLength) {
            errors.push({
              field,
              message: `${field} must be at most ${rules.maxLength} characters`,
            });
          }
          if (rules.pattern && !rules.pattern.test(value)) {
            errors.push({
              field,
              message: rules.patternMessage || `${field} has invalid format`,
            });
          }
          if (rules.enum && !rules.enum.includes(value)) {
            errors.push({
              field,
              message: `${field} must be one of: ${rules.enum.join(', ')}`,
            });
          }
        }
        
        // Number constraints
        if (rules.type === 'number') {
          if (rules.min !== undefined && value < rules.min) {
            errors.push({
              field,
              message: `${field} must be at least ${rules.min}`,
            });
          }
          if (rules.max !== undefined && value > rules.max) {
            errors.push({
              field,
              message: `${field} must be at most ${rules.max}`,
            });
          }
        }
        
        // Custom validator
        if (rules.validate) {
          const customError = rules.validate(value, data);
          if (customError) {
            errors.push({
              field,
              message: customError,
            });
          }
        }
      }
    }
    
    if (errors.length > 0) {
      return next(createValidationError(errors));
    }
    
    next();
  };
};

/**
 * Sanitize request body
 * Removes fields not in allowlist
 * @param {Array<string>} allowedFields - Fields to keep
 */
export const sanitize = (allowedFields) => {
  return (req, res, next) => {
    if (!req.body) {
      return next();
    }
    
    const sanitized = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        sanitized[field] = req.body[field];
      }
    }
    
    req.body = sanitized;
    next();
  };
};

// Common validation patterns
export const patterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
};

export default { validate, sanitize, patterns };
