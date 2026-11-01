# HELPDESK — CODEX PROJECT SPECIFICATION

**Document Version:** 1.0  
**Project:** HelpDesk  
**Project Type:** Full-Stack Web Application  
**Development Approach:** Individual Development  
**Target Timeline:** 2–3 Weeks  
**Status:** In Development

---

# 1. PROJECT OVERVIEW

## Project Name
HelpDesk — Customer Support & Ticket Management System

## Objective
Build a modern, full-stack customer support platform that allows customers to submit support tickets, support agents to manage and resolve issues, and administrators to manage users, tickets, and support operations.

The application must be fully functional, responsive, secure, and suitable for a final-year engineering student portfolio and software developer placement interviews.

This must be a real working application, not just a static UI demonstration.

# 2. TECHNOLOGY STACK

Use the following technologies:

## Frontend
- React.js
- Vite
- JavaScript
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form
- Zod
- Lucide React
- Recharts

## Backend
- Node.js
- Express.js
- JavaScript
- REST APIs
- Mongoose

## Database
- MongoDB Atlas
- MongoDB ObjectId references
- Mongoose schemas and models

## Authentication and Security
- JWT
- bcryptjs
- Express middleware
- CORS
- Helmet
- Express Rate Limit
- Zod validation

## Development Tools
- Git
- GitHub
- VS Code
- Nodemon
- ESLint
- Vitest
- Supertest

IMPORTANT:
Do not use PostgreSQL, Prisma ORM, MySQL, or Firebase.
MongoDB with Mongoose is mandatory.

# 3. USER ROLES

Implement three roles.

## A. Customer
Customers must be able to:
- Register and log in.
- View their dashboard.
- Create support tickets.
- View their own tickets.
- Track ticket status.
- View ticket details.
- Reply to tickets.
- View conversation history.
- Reopen eligible resolved tickets.

Customers must never access another customer's private tickets.

## B. Support Agent
Agents must be able to:
- Log in.
- View assigned tickets.
- View permitted unassigned tickets.
- Open ticket details.
- Update ticket status.
- Change ticket priority.
- Reply to customers.
- Add internal notes.
- View their workload.
- Search and filter tickets.

Agents must not access administrative functions.

## C. Administrator
Administrators must be able to:
- View all tickets.
- Assign and reassign tickets.
- View all users.
- Manage user roles.
- Create and manage ticket categories.
- View dashboard analytics.
- Monitor agent workloads.
- View ticket activity history.

All permissions must be enforced on the backend.

# 4. CORE FUNCTIONAL REQUIREMENTS

## Authentication
- User registration.
- User login.
- Logout.
- Current-user endpoint.
- Password hashing.
- JWT authentication.
- Protected frontend routes.
- Role-based authorization.
- Input validation.
- Secure token handling.

Prefer HTTP-only secure cookies with appropriate CSRF protection if using cookie-based authentication. Document the chosen authentication strategy.

## Ticket Management
Every ticket should contain:
- Unique ticket identifier.
- Title.
- Description.
- Category.
- Priority.
- Status.
- Customer reference.
- Assigned agent reference.
- Creation timestamp.
- Last update timestamp.

Priority levels:
- Low
- Medium
- High
- Critical

Ticket statuses:
- Open
- In Progress
- Waiting for Customer
- Resolved
- Closed

Implement:
- Create ticket.
- Read ticket.
- Update ticket.
- Assign ticket.
- Change status.
- Change priority.
- Close ticket.
- Reopen eligible tickets.

## Comments and Conversations
- Customer replies.
- Agent replies.
- Internal staff notes.
- Author information.
- Timestamps.
- Ticket conversation history.

Internal notes must never be visible to customers through API responses.

## Dashboard
Create separate dashboards for each role.

Customer dashboard:
- Total tickets.
- Open tickets.
- In-progress tickets.
- Resolved tickets.
- Recent tickets.

Agent dashboard:
- Assigned tickets.
- Pending tickets.
- High-priority tickets.
- Resolved tickets.
- Workload overview.

Admin dashboard:
- Total users.
- Total customers.
- Total agents.
- Total tickets.
- Open tickets.
- Resolved tickets.
- Ticket priority distribution.
- Ticket status distribution.
- Agent workload analytics.

All statistics must come from MongoDB, not hardcoded dummy values.

## Search and Filtering
Implement:
- Search by ticket title.
- Search by ticket ID.
- Filter by status.
- Filter by priority.
- Filter by category.
- Filter by assigned agent.
- Sorting.
- Server-side pagination.

# 5. DATABASE SPECIFICATION

Create Mongoose models for the following collections.

## User Model

Fields:
- name: String
- email: String
- passwordHash: String
- role: customer | agent | admin
- isActive: Boolean
- createdAt
- updatedAt

Requirements:
- Email must be unique.
- Password must be hashed.
- Never return passwordHash in API responses.

## Ticket Model

Fields:
- ticketNumber: String
- title: String
- description: String
- status: Enum
- priority: Enum
- creator: ObjectId reference to User
- assignedAgent: ObjectId reference to User
- category: ObjectId reference to Category
- createdAt
- updatedAt
- resolvedAt

Requirements:
- Ticket number must be unique.
- Add indexes for commonly filtered fields.
- Validate references and status transitions.

## Comment Model

Fields:
- ticket: ObjectId reference to Ticket
- author: ObjectId reference to User
- message: String
- isInternal: Boolean
- createdAt

Requirements:
- Internal notes are staff-only.
- Validate ticket access before reading or creating comments.

## Category Model

Fields:
- name: String
- description: String
- isActive: Boolean
- createdAt

Requirements:
- Category name must be unique.

## ActivityLog Model

Fields:
- ticket: ObjectId reference to Ticket
- actor: ObjectId reference to User
- action: String
- details: Mixed or structured metadata
- createdAt

Record important events such as ticket creation, assignment, status changes, priority changes, and resolution.

Use timestamps, indexes, schema validation, and appropriate references.

# 6. API SPECIFICATION

Base URL:
`/api`

## Authentication

POST `/auth/register`
POST `/auth/login`
POST `/auth/logout`
GET `/auth/me`

## Tickets

GET `/tickets`
POST `/tickets`
GET `/tickets/:id`
PATCH `/tickets/:id`
PATCH `/tickets/:id/assign`
PATCH `/tickets/:id/status`

## Comments

GET `/tickets/:id/comments`
POST `/tickets/:id/comments`

## Dashboard

GET `/dashboard/stats`
GET `/dashboard/trends`

## Users

GET `/users`
GET `/users/:id`
PATCH `/users/:id/role`
PATCH `/users/:id/status`

## Categories

GET `/categories`
POST `/categories`
PATCH `/categories/:id`
DELETE `/categories/:id`

Use:
- Correct HTTP status codes.
- Consistent JSON response formats.
- Centralized error handling.
- Request validation.
- Authentication middleware.
- Authorization middleware.

# 7. FRONTEND SPECIFICATION

Build a modern SaaS-style interface.

Design direction:
- Clean and professional.
- White or light neutral background.
- Dark sidebar.
- Consistent typography.
- Subtle borders and shadows.
- Professional status badges.
- Responsive layouts.
- Accessible forms and navigation.

Avoid:
- Excessive gradients.
- Unnecessary animations.
- Overcrowded dashboards.
- Generic placeholder pages.
- Non-functional buttons.

## Required Pages

1. Login Page
2. Registration Page
3. Customer Dashboard
4. Agent Dashboard
5. Admin Dashboard
6. Create Ticket Page
7. Ticket Listing Page
8. Ticket Details Page
9. User Management Page
10. Category Management Page
11. Profile Page
12. Not Found Page

## Required Components

- Sidebar
- Navbar
- Dashboard Cards
- Ticket Table
- Ticket Status Badge
- Priority Badge
- Search Bar
- Filter Dropdowns
- Pagination
- Ticket Form
- Comment Thread
- Internal Note Form
- Confirmation Dialog
- Toast Notifications
- Loading Skeleton
- Empty State
- Error State

All buttons, forms, filters, navigation links, and actions must work.

# 8. PROJECT STRUCTURE

Create the following structure:

```text
HelpDesk/
│
├── client/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       ├── layouts/
│       ├── pages/
│       ├── routes/
│       ├── services/
│       ├── hooks/
│       ├── context/
│       ├── utils/
│       ├── App.jsx
│       └── main.jsx
│
├── server/
│   └── src/
│       ├── config/
│       ├── models/
│       ├── controllers/
│       ├── routes/
│       ├── middleware/
│       ├── services/
│       ├── validators/
│       ├── utils/
│       ├── app.js
│       └── server.js
│
├── docs/
│   └── API.md
│
├── SPEC.md
├── README.md
├── .gitignore
└── .env.example
```

Keep controllers, services, routes, models, and middleware separate.

# 9. SECURITY REQUIREMENTS

- Hash passwords using bcryptjs.
- Never store plaintext passwords.
- Validate all incoming requests.
- Enforce role-based permissions on the backend.
- Enforce resource ownership.
- Prevent customers from viewing other customers' tickets.
- Prevent customers from viewing internal notes.
- Use secure authentication token handling.
- Add rate limiting to authentication endpoints.
- Use Helmet.
- Configure CORS safely.
- Protect sensitive environment variables.
- Avoid exposing stack traces in production.
- Validate MongoDB ObjectIds.
- Prevent mass assignment of protected fields.

# 10. TESTING REQUIREMENTS

Implement tests for:
- User registration.
- Login.
- Invalid credentials.
- Authentication middleware.
- Customer ticket access restrictions.
- Ticket creation.
- Ticket assignment.
- Status updates.
- Comment permissions.
- Internal note visibility.
- Admin-only operations.
- Dashboard statistics.

Run the test suite and report actual results.

Do not claim tests pass if they have not been executed.

# 11. ENVIRONMENT CONFIGURATION

Create `.env.example`:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER/HelpDesk
JWT_SECRET=replace_with_a_long_random_secret
CLIENT_URL=http://localhost:5173
```

Never create or commit real secrets.

Use a separate local `.env` file.

# 12. DEVELOPMENT PHASES

Follow these milestones in order.

## Phase 1 — Project Setup
- Inspect existing project files.
- Initialize Git if needed.
- Create frontend and backend folders.
- Initialize React with Vite.
- Initialize Express server.
- Install dependencies.
- Configure scripts.
- Add `.gitignore`.

## Phase 2 — Database
- Configure MongoDB connection.
- Create Mongoose models.
- Add validation and indexes.
- Add seed script.
- Verify database connection.

## Phase 3 — Authentication
- Registration.
- Login.
- Logout.
- Current user.
- Password hashing.
- Authentication middleware.
- Role authorization.

## Phase 4 — Ticket System
- Ticket creation.
- Ticket listing.
- Ticket details.
- Ticket assignment.
- Status and priority updates.
- Comments and internal notes.
- Activity logs.

## Phase 5 — Frontend
- Authentication pages.
- Shared layouts.
- Customer dashboard.
- Agent dashboard.
- Admin dashboard.
- Ticket pages.
- User management.
- Category management.

## Phase 6 — Integration
- Connect frontend to backend.
- Implement Axios service layer.
- Add protected routes.
- Add loading and error states.
- Verify every workflow.

## Phase 7 — Testing and Documentation
- Run tests.
- Fix bugs.
- Verify permissions.
- Write README.
- Add screenshots.
- Document API endpoints.

## Phase 8 — Deployment
- Prepare production build.
- Configure production environment.
- Deploy frontend.
- Deploy backend.
- Connect managed MongoDB.
- Verify deployed application.

# 13. CODEX EXECUTION RULES

You are working as a senior full-stack developer inside the existing HelpDesk repository.

Follow these rules strictly:

1. Inspect the repository before making changes.
2. Read SPEC.md before implementation.
3. Do not delete existing work without explaining why.
4. Create actual project files, not just code examples in chat.
5. Work in small, logical milestones.
6. Use complete and runnable code.
7. Do not create fake APIs or fake database integrations.
8. Do not use localStorage as a substitute for backend persistence.
9. Do not hardcode dashboard statistics.
10. Do not leave core features as TODO comments.
11. Maintain consistent naming conventions.
12. Run relevant tests and builds after implementation.
13. Fix errors before moving to the next milestone.
14. Explain important decisions in simple language.
15. Keep the project suitable for an intermediate-level developer to understand.
16. Update README and documentation as implementation changes.
17. Do not expose secrets.
18. Ask for user approval before destructive operations or actions involving external accounts and deployment.

When a requirement is ambiguous, choose the simplest secure solution and document the assumption rather than blocking progress unnecessarily.

# 14. DEFINITION OF DONE

The project is complete when:

- MongoDB connects successfully.
- Authentication works.
- Three roles work correctly.
- Customers can create and track tickets.
- Agents can manage assigned tickets.
- Admins can manage users and assignments.
- Comments and internal notes work correctly.
- Search and filters work.
- Dashboards show real database statistics.
- Frontend and backend are integrated.
- Security permissions are enforced.
- Core tests pass.
- Production builds succeed.
- README and API documentation are complete.

# 15. FIRST TASK FOR CODEX

Do not build the entire project in one giant operation.

Start by:

1. Inspecting the existing HelpDesk folder.
2. Reading this SPEC.md.
3. Reporting the existing repository structure.
4. Creating a concise implementation plan.
5. Setting up the React/Vite frontend and Express backend.
6. Installing required dependencies.
7. Creating the initial folder structure.
8. Creating a working Express health-check endpoint:
   `GET /api/health`
9. Starting the backend and verifying the endpoint.
10. Reporting all files created and commands executed.

After successfully completing Phase 1, stop and report the result. Wait for approval before proceeding to Phase 2.

The ultimate objective is to build a complete, professional, working MERN-stack HelpDesk application that can be demonstrated in software engineering placement interviews.
