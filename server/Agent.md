# Backend Agent Rules

## Architecture
- **Pattern**: MVC (Model-View-Controller)
- **Runtime**: Node.js with ES Modules
- **Framework**: Express.js v5
- **Language**: JavaScript (ES2022+)

## File Structure
```
src/
├── controllers/    # Request handlers (HTTP layer)
├── models/         # Data models and database access
├── services/       # Business logic layer
├── routes/         # API route definitions
├── middlewares/    # Express middlewares
├── validators/     # Request validation schemas
├── utils/          # Utility functions
├── config/         # Configuration management
└── index.js        # Application entry point
```

## Naming Conventions
- Controllers: `user.controller.js`
- Models: `user.model.js`
- Services: `user.service.js`
- Routes: `user.routes.js`
- Middlewares: `auth.middleware.js`
- Validators: `user.validator.js`
- Utils: `response.util.js`

## Layer Responsibilities

### Controllers
- Parse request parameters
- Call service methods
- Send HTTP responses
- Handle HTTP-specific logic only

### Services
- Implement business logic
- Validate business rules
- Coordinate between models
- Throw application errors

### Models
- Define data structure
- Database CRUD operations
- Data transformations
- No business logic

## Error Handling
1. Use `AppError` class for operational errors
2. Wrap async handlers with try-catch or `asyncHandler`
3. Centralized error handler middleware
4. Never expose stack traces in production
5. Log all 5xx errors
6. Return consistent error format:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "User-friendly message",
    "details": []
  }
}
```

## Memory Leak Prevention
1. Clean up event listeners on shutdown
2. Close database connections properly
3. Clear intervals and timeouts
4. Use WeakMap for object caches
5. Implement graceful shutdown
6. Monitor memory usage

## I/O Efficiency
1. Use streaming for large files
2. Implement connection pooling
3. Use `.lean()` for read-only queries
4. Batch database operations
5. Cache frequently accessed data
6. Use async/await properly

## CPU Efficiency
1. Avoid blocking operations
2. Use worker threads for CPU-intensive tasks
3. Implement pagination for large datasets
4. Optimize database queries
5. Use appropriate data structures

## Security Requirements
1. Use Helmet for security headers
2. Configure CORS properly
3. Implement rate limiting
4. Validate all inputs
5. Sanitize user data
6. Use parameterized queries
7. Never log sensitive data
8. Implement authentication/authorization

## Race Condition Prevention
1. Use database transactions
2. Implement optimistic locking
3. Use mutex for critical sections
4. Make APIs idempotent

## Pagination
- Use cursor-based pagination (NOT offset)
- Default limit: 20, max: 100
- Return format:
```json
{
  "data": [],
  "meta": {
    "pagination": {
      "cursor": "next_cursor",
      "hasMore": true,
      "limit": 20
    }
  }
}
```

## Streaming
- Use for exports and large datasets
- Implement proper backpressure
- Handle stream errors

## Batch Processing
- Process in configurable batches
- Implement progress callbacks
- Handle partial failures
- Use parallel processing with limits

## Response Format
```json
// Success
{
  "success": true,
  "data": {},
  "meta": {}
}

// Error
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Message"
  }
}
```

## Code Quality
1. Use JSDoc for all public functions
2. Maximum function length: 50 lines
3. Maximum file length: 300 lines
4. No magic numbers - use constants
5. Single responsibility principle
6. DRY - Don't Repeat Yourself

## Do NOT
- Use synchronous I/O operations
- Store secrets in code
- Skip input validation
- Ignore error handling
- Use deprecated APIs
- Block the event loop
- Trust user input
- Log sensitive data
- Use eval() or similar
- Skip security headers
