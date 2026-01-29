# Frontend Agent Rules

## Architecture
- **Flow**: Hooks -> Components -> Pages
- **State Management**: Context API (no Redux/Zustand unless approved)
- **Routing**: React Router DOM v7+
- **UI Library**: Shadcn UI with Tailwind CSS

## File Structure
```
src/
├── components/     # Layout, route guards, feature components
├── pages/          # Page-level components (route targets)
├── hooks/          # Custom React hooks (all stateful logic)
├── common/         # Shared UI components (Button, Input, Card, etc.)
├── context/        # Context providers and consumers
├── utils/          # Pure utility functions
├── types/          # TypeScript type definitions
├── lib/            # Third-party library configs
└── assets/         # Static assets
```

## TypeScript Rules
- **Strict mode**: Always enabled
- **No `any`**: Never use `any` type
- **Explicit types**: All function parameters and returns must be typed
- **Interface over type**: Prefer interfaces for object shapes
- **No implicit undefined**: Check for null/undefined explicitly

## Component Rules
1. One component per file
2. Use `React.FC<Props>` or explicit function types
3. Props interface must be defined inline or above component
4. Default exports for page components only
5. Named exports for reusable components
6. **Use `.map()` over repeating elements** - Never repeat JSX tags manually

## DRY Rendering Pattern (CRITICAL)
Always use `.map()` with data objects instead of repeating JSX elements. This reduces code, improves maintainability, and prevents errors.

```typescript
// BAD - Repeating tags
<div>
  <div><span>Name:</span><span>{user.name}</span></div>
  <div><span>Email:</span><span>{user.email}</span></div>
  <div><span>Role:</span><span>{user.role}</span></div>
  <div><span>Status:</span><span>{user.status}</span></div>
</div>

// GOOD - Using map with data object
const userFields = [
  { label: 'Name', value: user.name },
  { label: 'Email', value: user.email },
  { label: 'Role', value: user.role },
  { label: 'Status', value: user.status },
];

<div>
  {userFields.map(({ label, value }) => (
    <div key={label}><span>{label}:</span><span>{value}</span></div>
  ))}
</div>

// BAD - Repeating buttons
<button onClick={handleEdit}>Edit</button>
<button onClick={handleDelete}>Delete</button>
<button onClick={handleView}>View</button>

// GOOD - Using map with actions array
const actions = [
  { label: 'Edit', onClick: handleEdit },
  { label: 'Delete', onClick: handleDelete },
  { label: 'View', onClick: handleView },
];

{actions.map(({ label, onClick }) => (
  <button key={label} onClick={onClick}>{label}</button>
))}

// GOOD - Table headers with map
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
];

<thead>
  <tr>
    {columns.map(({ key, label }) => (
      <th key={key}>{label}</th>
    ))}
  </tr>
</thead>
```

**Rules for map usage:**
- Always define data arrays/objects outside JSX or use `useMemo`
- Always provide unique `key` prop
- Extract complex render logic to separate components
- Use TypeScript interfaces for data structure

## Hook Rules
1. Custom hooks start with `use`
2. Must return typed object or tuple
3. Handle cleanup in useEffect
4. Memoize expensive computations
5. Use callbacks for function props

## Context Rules
1. Separate context per domain (auth, theme, etc.)
2. Always provide TypeScript types
3. Create custom hook for consumption
4. Throw error if used outside provider

## Import Order
1. React/external libraries
2. @/ aliased imports
3. Relative imports
4. Type imports (use `type` keyword)

## Styling
- Use Tailwind utility classes
- Use `cn()` utility for conditional classes
- Follow Shadcn theming with CSS variables
- Responsive design: mobile-first approach

## State Management
- Local state: `useState`
- Form state: controlled components
- Server state: custom hooks with fetch
- Global state: Context API only

## Testing
- Test files: `*.test.tsx` or `*.spec.tsx`
- Unit tests for hooks
- Integration tests for pages
- Mock Context providers in tests

## Performance
- Lazy load page components
- Memoize expensive calculations
- Use `useMemo` and `useCallback` appropriately
- Avoid inline functions in render

## Do NOT
- Use `any` type
- Skip TypeScript strict checks
- Create global CSS (except index.css)
- Use inline styles (use Tailwind)
- Mutate state directly
- Use deprecated lifecycle methods
- Skip error boundaries
