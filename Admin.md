# Admin Project - Development Guidelines

## Project Structure

```
Admin/
├── frontend/                    # React TypeScript Frontend
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   ├── pages/              # Page-level components
│   │   ├── hooks/              # Custom React hooks
│   │   ├── common/             # Shared components across multiple pages
│   │   ├── utils/              # Utility functions and helpers
│   │   ├── context/            # Context API providers and types
│   │   ├── types/              # TypeScript type definitions
│   │   ├── lib/                # Third-party library configurations
│   │   └── assets/             # Static assets
│   └── ...
├── server/                      # Node.js Express Backend
│   ├── src/
│   │   ├── controllers/        # Request handlers (MVC - Controller)
│   │   ├── models/             # Data models (MVC - Model)
│   │   ├── services/           # Business logic layer
│   │   ├── routes/             # API route definitions
│   │   ├── middlewares/        # Express middlewares
│   │   ├── utils/              # Utility functions
│   │   ├── config/             # Configuration files
│   │   └── validators/         # Input validation schemas
│   └── ...
└── Admin.md                    # This file
```

---

## Frontend Rules

### 1. Architecture Flow
**Strictly follow: Hooks → Components → Pages**
- **Hooks**: All stateful logic and side effects
- **Components**: Presentational components receiving props
- **Pages**: Compose components and use hooks

### 2. TypeScript Strict Mode
```typescript
// tsconfig.json must have:
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

### 3. Component Guidelines
- All components must be typed with explicit return types
- Use `React.FC<Props>` or explicit function types
- Extract reusable components to `common/` folder
- One component per file
- Use PascalCase for component names
- **Use `.map()` over repeating elements** - Never repeat JSX tags manually

```typescript
// Correct
interface ButtonProps {
  label: string;
  onClick: () => void;
  disabled?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ label, onClick, disabled = false }) => {
  return <button onClick={onClick} disabled={disabled}>{label}</button>;
};
```

### 3.1 DRY Rendering Pattern (CRITICAL)
Always use `.map()` with data objects instead of repeating JSX elements:

```typescript
// BAD - Repeating tags (DO NOT DO THIS)
<div>
  <p>Name: {user.name}</p>
  <p>Email: {user.email}</p>
  <p>Role: {user.role}</p>
</div>

// GOOD - Data-driven rendering
const userFields = [
  { label: 'Name', value: user.name },
  { label: 'Email', value: user.email },
  { label: 'Role', value: user.role },
];

<div>
  {userFields.map(({ label, value }) => (
    <p key={label}>{label}: {value}</p>
  ))}
</div>

// GOOD - Table columns with map
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Status' },
];

<tr>
  {columns.map(col => <th key={col.key}>{col.label}</th>)}
</tr>

// GOOD - Navigation items with map
const navItems = [
  { path: '/', label: 'Home' },
  { path: '/users', label: 'Users' },
  { path: '/settings', label: 'Settings' },
];

{navItems.map(item => (
  <Link key={item.path} to={item.path}>{item.label}</Link>
))}
```

**Benefits:**
- Reduces code duplication
- Single source of truth for data
- Easy to add/remove items
- Type-safe with interfaces
- Easier maintenance

### 4. Hooks Guidelines
- Custom hooks must start with `use` prefix
- All hooks must have explicit return types
- Keep hooks focused on single responsibility
- Use proper cleanup in useEffect

```typescript
// Correct
interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  // implementation
};
```

### 5. Context API Rules
- Create separate context for each domain (auth, theme, etc.)
- Always provide default values
- Use custom hooks to consume context
- Type all context values explicitly

```typescript
// context/AuthContext.tsx
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: Credentials) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};
```

### 6. React Router Guidelines
- Define all routes in a central routes configuration
- Use lazy loading for page components
- Implement route guards for protected routes
- Type all route parameters

### 7. Shadcn UI Usage
- Use Shadcn components as base, customize via className
- Follow the component composition pattern
- Keep custom styles in component-specific CSS modules
- Use CSS variables for theming

### 8. File Naming Conventions
- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Utils: `camelCase.ts` (e.g., `formatDate.ts`)
- Types: `camelCase.types.ts` (e.g., `user.types.ts`)
- Context: `PascalCaseContext.tsx` (e.g., `AuthContext.tsx`)

---

## Backend Rules

### 1. MVC Architecture
- **Models**: Data structure and database interactions
- **Views**: Not applicable (API returns JSON)
- **Controllers**: Handle HTTP requests, delegate to services

### 2. Folder Structure Naming
```
controllers/    → user.controller.js
models/         → user.model.js
services/       → user.service.js
routes/         → user.routes.js
middlewares/    → auth.middleware.js
validators/     → user.validator.js
utils/          → response.util.js
```

### 3. Memory Leak Prevention
```javascript
// Always cleanup resources
class ResourceManager {
  constructor() {
    this.resources = new Map();
  }

  // Use WeakMap for object references
  // Clear intervals and timeouts
  // Close database connections properly
  // Implement proper stream cleanup
}

// Event listener cleanup
process.on('SIGTERM', async () => {
  await cleanupResources();
  process.exit(0);
});
```

### 4. I/O Efficiency
```javascript
// Use streaming for large data
const streamData = (req, res) => {
  const stream = createReadStream(filePath);
  stream.pipe(res);
};

// Use connection pooling for databases
// Implement request batching where applicable
// Use async/await properly - avoid blocking
```

### 5. CPU Efficiency
```javascript
// Use worker threads for CPU-intensive tasks
import { Worker } from 'worker_threads';

// Implement caching strategies
// Use pagination for large datasets
// Avoid nested loops on large data
```

### 6. Security Measures
```javascript
// Required middlewares
- helmet() for security headers
- cors() with proper configuration
- rate limiting
- input validation
- SQL injection prevention
- XSS protection
- CSRF protection

// Environment variables for secrets
// Never log sensitive data
// Implement proper authentication/authorization
```

### 7. Race Condition Prevention
```javascript
// Use database transactions
// Implement optimistic locking
// Use mutex/semaphore for critical sections
// Implement idempotency keys for APIs
```

### 8. Error Handling
```javascript
// Centralized error handler
class AppError extends Error {
  constructor(message, statusCode, code) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

// Global error handler middleware
const errorHandler = (err, req, res, next) => {
  // Log error
  // Send appropriate response
  // Don't leak sensitive info
};

// Always use try-catch in async functions
// Implement proper error boundaries
```

### 9. Cursor Pagination
```javascript
// Implement cursor-based pagination for performance
const paginateWithCursor = async (cursor, limit) => {
  const query = cursor 
    ? { _id: { $gt: cursor } } 
    : {};
  
  const results = await Model.find(query)
    .limit(limit + 1)
    .lean();
  
  const hasMore = results.length > limit;
  const data = hasMore ? results.slice(0, -1) : results;
  const nextCursor = hasMore ? data[data.length - 1]._id : null;
  
  return { data, nextCursor, hasMore };
};
```

### 10. Batch Processing
```javascript
// Process large datasets in batches
const batchProcess = async (items, batchSize, processor) => {
  const results = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(batch.map(processor));
    results.push(...batchResults);
  }
  return results;
};
```

### 11. Streaming Responses
```javascript
// Stream large responses
const streamResponse = async (req, res, dataGenerator) => {
  res.setHeader('Content-Type', 'application/json');
  res.write('[');
  
  let first = true;
  for await (const item of dataGenerator) {
    if (!first) res.write(',');
    res.write(JSON.stringify(item));
    first = false;
  }
  
  res.write(']');
  res.end();
};
```

### 12. Lean Queries (MongoDB)
```javascript
// Always use .lean() for read-only queries
const users = await User.find().lean();

// Use projection to limit fields
const user = await User.findById(id).select('name email').lean();
```

### 13. Code Quality Standards
- Use ESLint with recommended rules
- Implement JSDoc comments for all public functions
- Follow single responsibility principle
- Maximum function length: 50 lines
- Maximum file length: 300 lines
- No magic numbers - use constants
- Meaningful variable names

---

## API Response Standards

```javascript
// Success response
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": {
      "cursor": "...",
      "hasMore": true,
      "limit": 20
    }
  }
}

// Error response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "User friendly message",
    "details": [ ... ]
  }
}
```

---

## Environment Configuration

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Admin
```

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=
JWT_SECRET=
CORS_ORIGIN=http://localhost:5173
```

---

## Git Commit Guidelines
- Use conventional commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`
- Keep commits atomic and focused
- Write meaningful commit messages
