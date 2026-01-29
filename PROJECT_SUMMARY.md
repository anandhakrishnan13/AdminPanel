# Project Summary: Full-Stack Admin Panel with RBAC

## Overview
Created a complete full-stack admin application with Role-Based Access Control (RBAC) system. The project consists of a React TypeScript frontend and Node.js Express backend, following strict architectural patterns and best practices.

---

## What We Built

### 1. **Project Structure**
```
Admin/
├── .gitignore                    # Single comprehensive gitignore
├── Admin.md                      # Main development guidelines (NOT in git)
├── frontend/                     # React + TypeScript + Vite + Shadcn UI
│   ├── Agent.md                 # Frontend-specific rules (NOT in git)
│   ├── src/
│   │   ├── components/          # Layout, UserModal, ProtectedRoute, Sidebar, Breadcrumb
│   │   ├── pages/               # Dashboard, Users, Login, Settings, NotFound
│   │   ├── hooks/               # useFetch, useDebounce, useWindowSize, useLocalStorage
│   │   ├── common/              # Button, Input, Select, Card, Badge, etc.
│   │   ├── context/             # AuthContext, ThemeContext
│   │   ├── utils/               # Utility functions (formatDate, debounce, etc.)
│   │   ├── types/               # TypeScript type definitions
│   │   └── lib/                 # Shadcn utils (cn function)
│   └── components.json          # Shadcn UI configuration
└── server/                       # Node.js + Express (JavaScript)
    ├── Agent.md                 # Backend-specific rules (NOT in git)
    └── src/
        ├── controllers/         # user.controller.js
        ├── models/              # user.model.js, data.js (dummy data)
        ├── services/            # user.service.js (business logic)
        ├── routes/              # user.routes.js, index.js
        ├── middlewares/         # error, auth, validation, logger
        ├── validators/          # user.validator.js
        ├── utils/               # pagination, streaming, batch, response, shutdown
        ├── config/              # Configuration management
        └── index.js             # Express server entry point
```

---

## Key Features Implemented

### **RBAC (Role-Based Access Control)**
- **5-Level Hierarchy:**
  1. **Super Admin** (Level 1) - Full access, can assign all roles
  2. **Admin** (Level 2) - Access granted by Super Admin
  3. **Head of Department (HOD)** (Level 3) - Department-level access
  4. **Manager** (Level 4) - Team management
  5. **Employee** (Level 5) - Basic access

- **Nested Permissions System:**
  - 3-level hierarchy: Main → Sub → Sub-Sub permissions
  - Parent permission required to access child permissions
  - Example: `users` → `users.edit` → `users.edit.role`

### **Frontend Features**
1. **Login Page** (`src/pages/Login.tsx`)
   - Mock authentication (email: `superadmin@company.com`, password: `password123`)
   - Form validation
   - Redirects to dashboard after login

2. **Dashboard** (`src/pages/Dashboard.tsx`)
   - Stats cards with icons
   - Activity overview
   - Responsive grid layout

3. **Users Page** (`src/pages/Users.tsx`)
   - **CRITICAL:** Current logged-in user is HIDDEN from the list (even Super Admin)
   - User cannot see/edit their own data here
   - Table with columns: Name, Email, Role, Last Login, Status
   - Filters: Search, Role filter, Status filter
   - Edit button opens UserModal with pre-filled data
   - Self-edit prevention: Clicking edit on own user redirects to Settings
   - Shows all users except current user

4. **UserModal** (`src/components/UserModal.tsx`)
   - Works for both Create and Edit modes
   - Responsive masonry layout: Left (User Details) | Right (Permissions)
   - **Report Code:** Manual input field (8-char alphanumeric uppercase, required)
   - Fields: Name, Email, Password, Department, Role, Reporting Manager, Status, Permissions
   - Nested permission checkboxes with parent-child validation
   - ScrollArea for both columns to maintain equal height

5. **Settings Page** (`src/pages/Settings.tsx`)
   - **Only place users can edit themselves**
   - Editable: Name, Password
   - Visible but NOT editable: Email (read-only with `cursor-not-allowed`)
   - Logout button (redirects to `/login`)

6. **Layout** (`src/components/Layout.tsx`)
   - Shadcn Sidebar (collapsible)
   - Navigation: Dashboard, Users, Settings
   - **Breadcrumb:** Shows only current page name (no "Dashboard >" prefix)
   - Theme toggle (Light/Dark)
   - Responsive for mobile and desktop

7. **Context API**
   - `AuthContext`: User authentication, mock login, logout
   - `ThemeContext`: Theme management (light/dark/system)

### **Backend Features**
1. **MVC Architecture**
   - Models: Single User schema (user.schema.js with embedded role/department)
   - Services: Business logic + DB queries (user.service.js, auth.service.js)
   - Controllers: HTTP handlers with MongoDB error handling (user.controller.js)
   - Routes: API endpoints (user.routes.js)

2. **Dummy Data** (`server/src/models/data.js`)
   - 10 users with all roles (Super Admin, Admin, 3 HODs, 2 Managers, 2 Employees)
   - 5 departments (Engineering, HR, Finance, Marketing, Operations)
   - 5 roles with hierarchy
   - Nested permissions structure (7 main permissions with children)
   - Each user has `reportCode` field (8-char alphanumeric)

3. **Best Practices Implemented**
   - Cursor-based pagination (NOT offset)
   - Streaming responses for large datasets
   - Batch processing utilities
   - Centralized error handling (AppError class)
   - Security middlewares: Helmet, CORS, rate limiting
   - Graceful shutdown handling
   - Input validation
   - Memory leak prevention patterns

4. **API Endpoints**
   - `GET /api/users` - List users (paginated)
   - `GET /api/users/:id` - Get single user
   - `POST /api/users` - Create user
   - `PUT /api/users/:id` - Update user
   - `DELETE /api/users/:id` - Delete user
   - `GET /api/users/stats` - User statistics
   - `GET /api/users/export` - Stream all users

---

## Important Technical Decisions

### **1. DRY Rendering Pattern (Map-Based Rendering)**
**Rule Added:** Always use `.map()` instead of repeating JSX elements.

```typescript
// BAD - Repeating
<div><span>Name:</span><span>{user.name}</span></div>
<div><span>Email:</span><span>{user.email}</span></div>

// GOOD - Using map
const fields = [
  { label: 'Name', value: user.name },
  { label: 'Email', value: user.email }
];
{fields.map(({ label, value }) => (
  <div key={label}><span>{label}:</span><span>{value}</span></div>
))}
```

### **2. Self-Edit Prevention**
- Users CANNOT see themselves in the Users list
- Users CANNOT edit their own permissions
- Self-management limited to Settings page (name + password only)
- This prevents privilege escalation

### **3. Report Code Management**
- Changed from auto-generated to **manual assignment**
- Admin manually enters 8-character alphanumeric code (uppercase)
- Validation: Required, must match `/^[A-Z0-9]+$/`, max 8 chars
- Input auto-converts to uppercase

### **4. Responsive Design**
- All components use responsive Tailwind classes
- Modal: `max-w-full md:max-w-4xl`
- Buttons: `w-full sm:w-auto`
- Grids: `grid-cols-1 lg:grid-cols-2`
- ScrollArea for long content

### **5. TypeScript Strict Mode**
- All files follow strict TypeScript rules
- No `any` types allowed
- Explicit return types required
- Null checks enforced

---

## Files Created/Modified

### **Frontend (Key Files)**
- `src/pages/Users.tsx` - User management page (hides current user)
- `src/pages/Login.tsx` - Login page with mock auth
- `src/pages/Settings.tsx` - Self-edit page (name, password, logout)
- `src/pages/Dashboard.tsx` - Dashboard with stats
- `src/components/UserModal.tsx` - Create/Edit user modal (responsive, manual report code)
- `src/components/Layout.tsx` - Sidebar + Breadcrumb layout
- `src/context/AuthContext.tsx` - Authentication context (mock login)
- `src/types/index.ts` - All TypeScript types (User, Role, Permission, etc.)
- `src/App.tsx` - Routes: `/login`, `/`, `/users`, `/settings`

### **Backend (Key Files)**
- `src/models/data.js` - Dummy data (10 users, 5 roles, permissions, departments)
- `src/index.js` - Express server with security middlewares
- `src/controllers/user.controller.js` - User CRUD handlers
- `src/services/user.service.js` - Business logic
- `src/utils/pagination.util.js` - Cursor pagination
- `src/utils/stream.util.js` - Streaming responses
- `src/middlewares/error.middleware.js` - Centralized error handling

### **Configuration Files**
- `.gitignore` - Single comprehensive gitignore (ignores Agent.md files)
- `Admin.md` - Main development guidelines (NOT in git)
- `frontend/Agent.md` - Frontend rules (NOT in git)
- `server/Agent.md` - Backend rules (NOT in git)
- `frontend/package.json` - Dependencies: React Router, Shadcn UI, etc.
- `server/package.json` - Dependencies: Express, Helmet, CORS, etc.

---

## Current State

### **Completed ✅**
1. Full frontend structure with Shadcn UI
2. Full backend MVC structure with MongoDB integration
3. Login page with mock authentication
4. Users page with self-hiding logic
5. Settings page with logout
6. User creation/editing modal with manual report code
7. Responsive design for all screen sizes
8. Breadcrumb showing only current page
9. Context API for auth and theme
10. MongoDB database with single User schema (embedded role/department)
11. Database seeding script with bcrypt password hashing
12. Service layer with transactions for data integrity
13. MongoDB error handling in controllers
14. Auth service with login and password change functionality
15. Git repository initialized and committed

### **Git Status**
- **Last commit:** `d184902` - "feat: initial commit - full-stack admin panel with RBAC"
- **Pending commit:** MongoDB integration with single schema, bcrypt, seeding
- **Branch:** master

---

## How to Run

```bash
# Frontend
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173

# Backend
cd server
npm install
npm run dev
# Runs on http://localhost:3000

# Login Credentials
Email: superadmin@company.com
Password: password123
```

---

## What Needs to Be Done Next

### **Immediate Next Steps**
1. **Connect Frontend to Backend API**
   - Replace mock data in `Users.tsx` with API calls
   - Use `useFetch` hook for API requests
   - Update `AuthContext` to call real `/api/auth/login` endpoint

2. **Database Integration**
   - Choose database (MongoDB recommended for nested permissions)
   - Replace in-memory `data.js` with actual database
   - Implement Mongoose models
   - Add database connection in `server/src/config/index.js`

3. **Authentication & Authorization**
   - Implement JWT token generation on login
   - Add token verification middleware
   - Implement refresh token mechanism
   - Add protected route middleware

4. **Permission-Based UI Rendering**
   - Hide/show sidebar items based on user permissions
   - Disable buttons user doesn't have permission for
   - Create `usePermission` hook to check permissions

5. **Additional Features to Implement**
   - Departments page (CRUD operations)
   - Roles page (create custom roles with permissions)
   - Reports page (generate user reports by reportCode)
   - Audit logs page (track all actions)
   - User profile page with avatar upload

### **Backend Enhancements**
1. Add MongoDB/PostgreSQL connection
2. Implement actual JWT authentication
3. Add file upload for user avatars
4. Implement email notifications
5. Add data validation with Joi or Zod
6. Implement rate limiting per user
7. Add comprehensive logging with Winston
8. Add unit and integration tests

### **Frontend Enhancements**
1. Add form validation library (React Hook Form + Zod)
2. Add toast notifications (Sonner)
3. Add loading states and skeletons
4. Add error boundaries
5. Implement infinite scroll for user list
6. Add export functionality (CSV, PDF)
7. Add bulk operations (delete multiple users)
8. Add advanced filters and sorting

### **Production Readiness**
1. Add Docker configuration (Dockerfile, docker-compose.yml)
2. Add CI/CD pipeline (GitHub Actions)
3. Add environment-specific configs
4. Add health check endpoints
5. Add monitoring (Prometheus, Grafana)
6. Add API documentation (Swagger/OpenAPI)
7. Add SSL/TLS configuration
8. Add backup and recovery procedures

---

## Important Constraints & Rules

### **User Behavior Rules**
1. ✅ User CANNOT see themselves in Users list
2. ✅ User CANNOT edit their own permissions
3. ✅ User can ONLY edit name/password in Settings
4. ✅ Email is visible but not editable anywhere
5. ✅ Report code must be manually assigned by admin

### **Permission Rules**
1. ✅ Nested permissions require parent permission
2. ✅ Super Admin will get all permissions from database (not hardcoded)
3. ✅ Permission hierarchy enforced in UI (checkboxes)

### **Code Standards**
1. ✅ TypeScript strict mode enforced
2. ✅ No `any` types allowed
3. ✅ Use map-based rendering (no repeating JSX)
4. ✅ Follow Hooks → Components → Pages flow
5. ✅ One component per file
6. ✅ Explicit return types on all functions

---

## Quick Reference

### **Tech Stack**
- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS, Shadcn UI, React Router v7
- **Backend:** Node.js 18+, Express 5, JavaScript (ES Modules), MongoDB, Mongoose
- **State:** Context API (no Redux)
- **UI:** Shadcn UI components with Tailwind
- **Auth:** JWT (to be implemented)
- **Database:** MongoDB with Mongoose ODM

### **Key Dependencies**
**Frontend:**
- `react-router-dom` - Routing
- `clsx` + `tailwind-merge` - Class merging
- `lucide-react` - Icons

**Backend:**
- `express` - Web framework
- `helmet` - Security headers
- `cors` - CORS handling
- `express-rate-limit` - Rate limiting
- `dotenv` - Environment variables
- `mongoose` - MongoDB ODM
- `bcrypt` - Password hashing

### **Environment Variables**
**Frontend (.env):**
```
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Admin
```

**Backend (.env):**
```
NODE_ENV=development
PORT=3000
CORS_ORIGIN=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/admin_rbac
DB_MIN_POOL_SIZE=5
DB_MAX_POOL_SIZE=20
DB_CONNECTION_TIMEOUT=30000

# Security
BCRYPT_SALT_ROUNDS=12
JWT_SECRET=your-secret-key
```

---

## Database Architecture & Single I/O Pattern

### **MongoDB Integration**
- **Database:** MongoDB (Document-oriented NoSQL)
- **ODM:** Mongoose for schema validation and queries
- **Connection:** Pooled connections (min: 5, max: 20)
- **Transactions:** Full ACID compliance with MongoDB sessions
- **Location:** `server/src/config/database.js`

### **Single I/O Strategy: Database Transactions**
All write operations (Create, Update, Delete) use MongoDB transactions to ensure data integrity:

**Transaction Benefits:**
- ✅ **Atomicity:** All operations succeed or fail together
- ✅ **Consistency:** Data integrity maintained across collections
- ✅ **Isolation:** Concurrent operations don't interfere
- ✅ **Durability:** Committed changes are permanent

**Example Transaction Flow (Create User):**
```javascript
const session = await mongoose.startSession();
session.startTransaction();

try {
  // 1. Validate role exists
  const role = await Role.findById(data.roleId).session(session);
  
  // 2. Validate department exists
  const dept = await Department.findById(data.departmentId).session(session);
  
  // 3. Validate reporting manager exists
  const manager = await User.findById(data.reportingManagerId).session(session);
  
  // 4. Create user document
  const [user] = await User.create([data], { session });
  
  // 5. Commit transaction (single I/O write)
  await session.commitTransaction();
  return user;
} catch (error) {
  // Rollback all changes if any step fails
  await session.abortTransaction();
  throw error;
} finally {
  session.endSession();
}
```

### **Password Security**
- **Library:** bcrypt (industry standard)
- **Salt Rounds:** 12 (configurable via `BCRYPT_SALT_ROUNDS`)
- **Storage:** Only hashed passwords stored, never plain text
- **Selection:** Password field excluded from queries by default (`select: false`)
- **Pre-save Hook:** Automatic hashing in Mongoose schema

### **Schema Design**

**Single Schema Architecture:** `server/src/models/schemas/user.schema.js`

#### **User Schema (with Embedded Data)**
- **Collection:** `users` (SINGLE collection - no separate collections!)
- **Architecture:** Denormalized with embedded documents
- **Indexes:** 
  - `email` (unique)
  - `reportCode` (unique)
  - `role.code + status` (compound for filtering)
  - `department.code` (for department queries)
  - `reportingManagerId` (for hierarchy queries)

**Embedded Fields:**
- **role** (embedded object):
  - `name` - Role name (e.g., "Super Admin")
  - `code` - Role code (e.g., "SUPER_ADMIN")
  - `level` - Hierarchy level (1-5)
  - `description` - Role description
  - `canAssignRoles` - Array of role codes this role can assign

- **department** (embedded object, optional):
  - `name` - Department name (e.g., "Engineering")
  - `code` - Department code (e.g., "ENG")
  - `description` - Department description

- **permissions** - Array of permission code strings

**References:**
- `reportingManagerId` → `users` (self-reference for hierarchy)

**Virtuals:**
- `subordinates` - Users reporting to this user
- `reportingManager` - This user's manager

**Instance Methods:**
- `comparePassword(password)` - bcrypt password verification
- `hasPermission(permission)` - Check single permission
- `hasAnyPermission(permissions)` - Check multiple (OR logic)
- `hasAllPermissions(permissions)` - Check multiple (AND logic)
- `toLean()` - Return user without password field

**Static Methods:**
- `findByEmail(email)` - Find user by email
- `findByReportCode(code)` - Find user by report code
- `emailExists(email, excludeId)` - Check email uniqueness
- `reportCodeExists(code, excludeId)` - Check report code uniqueness
- `findByRoleCode(roleCode)` - Get all users with specific role
- `findByDepartmentCode(deptCode)` - Get all users in department

**Pre-save Hook:**
- Automatically hashes password with bcrypt (12 salt rounds)
- Converts report code to uppercase
- Converts role.code to uppercase
- Converts department.code to uppercase

### **Service Layer Architecture**

**Important:** DB queries are performed at the **service level**, not in model files. Services directly use Mongoose schemas.

#### **User Service** (`server/src/services/user.service.js`)

**Password Methods:**
1. `hashPassword(password)` - Hash with bcrypt
2. `comparePassword(password, hash)` - Verify password

**CRUD Operations (Simplified - No Model Layer):**
3. ✅ `createUser(data)` - Direct Mongoose create with embedded role/dept, bcrypt hashing
4. ✅ `updateUser(id, data)` - Direct Mongoose update with validation
5. ✅ `deleteUser(id)` - Delete with dependency checks (subordinates only)
6. ✅ `getUsers(options)` - Paginated list with filters (role.code, status, search, dept.code)
7. ✅ `getUserById(id)` - Single user query with populated reportingManager
8. ✅ `getUserStats()` - Aggregation statistics by role and status
9. ✅ `bulkCreateUsers(usersData)` - Batch create with error handling
10. ✅ `bulkDeleteUsers(ids)` - Batch delete
11. ✅ `streamUsers()` - Generator function for large exports

**Validation:**
- Email uniqueness (before create/update)
- Report code uniqueness (before create/update)
- Password length (min 6 characters)
- ObjectId format validation
- No reference validation needed (embedded data!)

**Dependency Checks:**
- Cannot delete user with subordinates
- No department head checks (departments are embedded, not separate)

### **Seeding System**

**Script:** `npm run seed`
**Location:** `server/src/scripts/seed.js`

**Seeding Process (Simplified):**
1. Connect to MongoDB
2. Clear users collection
3. Seed 10 users with embedded role and department data
4. Update reporting relationships (reportingManagerId)
5. Display summary

**Safety Features:**
- Bcrypt hashing for all user passwords
- Works with standalone MongoDB (no replica set required)
- Progress logging during seeding

**Seed Data:**
- **Default Password:** `password123` (bcrypt hashed)
- **Super Admin:** `superadmin@company.com`
- **10 Users:** All roles represented
- **5 Departments:** Embedded in user documents
- **5 Roles:** Embedded in user documents
- **Permissions:** Array of permission codes per user

### **API Error Handling**

**MongoDB-Specific Errors:**
- **Code 11000:** Duplicate key (email/reportCode already exists)
- **Invalid ObjectId:** Validation error with clear message
- **Transaction Failure:** Automatic rollback with error propagation
- **Reference Not Found:** Clear error messages (e.g., "Invalid role ID")

---

## Summary
We successfully built a complete full-stack admin panel with RBAC from scratch. The frontend is fully responsive with Shadcn UI, and the backend follows MVC with best practices. All core features are implemented, and the project is ready for database integration and production enhancements. The codebase follows strict TypeScript and architectural patterns to ensure maintainability and scalability.
