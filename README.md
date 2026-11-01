# 🎫 HelpDesk — Full-Stack Customer Support Ticketing System

A modern, full-stack customer support platform that helps teams manage customer queries, track issues, and resolve support tickets efficiently. HelpDesk provides a centralized dashboard where users can raise tickets, track their status, and communicate with support agents in one place.

Built to demonstrate practical full-stack development skills, REST API design, authentication, database management, and role-based access control.

## 🚀 Key Features

- 🔐 **Authentication & Authorization** — Secure registration and login.
- 👥 **Role-Based Access Control** — Separate permissions for customers, support agents, and administrators.
- 🎫 **Ticket Management** — Create, view, update, assign, and close support tickets.
- 📊 **Dashboard & Analytics** — View ticket counts by status, priority, and assignment.
- 💬 **Ticket Conversations** — Add comments and maintain communication history.
- 🚦 **Priority Management** — Categorize tickets as Low, Medium, High, or Critical.
- 🔍 **Search & Filters** — Find tickets by status, priority, category, or keyword.
- 📝 **Activity History** — Track important ticket updates.
- 📱 **Responsive UI** — Support desktop and mobile layouts.

## 🛠️ Tech Stack

*Suggested stack — update this section to match your implementation.*

| Layer | Technology |
|---|---|
| Frontend | React.js |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | JWT, bcrypt |
| API | REST API |
| Version Control | Git, GitHub |

## 🏗️ System Architecture

```text
React Frontend
      |
      | HTTP / REST API
      v
Node.js + Express Server
      |
      | 
      v
MongoDB + Mongoose
```

## 👤 User Roles

### Customer
- Create support tickets.
- View personal tickets.
- Add replies to conversations.
- Track ticket status and priority.
- Reopen eligible resolved tickets.

### Support Agent
- View assigned tickets.
- Update ticket status and priority.
- Reply to customers.
- Add internal notes, if enabled.
- Track pending and resolved issues.

### Administrator
- Manage users and roles.
- Assign tickets to agents.
- View all support tickets.
- Monitor dashboard analytics.
- Manage categories and ticket settings.

## 🎟️ Ticket Lifecycle

```text
Open → In Progress → Resolved → Closed
          |
          └── Waiting for Customer
```

Tickets can move between statuses according to the application's workflow and user permissions.

## 📂 Project Structure

```text
helpdesk/
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── services/
│       ├── context/
│       └── App.jsx
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── validators/
│   │   └── app.js
│   └── prisma/
│       └── schema.prisma
│
├── .env.example
├── .gitignore
└── README.md
```

## ⚙️ Getting Started

### Prerequisites

Make sure you have installed:

- Node.js (LTS recommended)
- npm
- PostgreSQL
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/helpdesk.git
cd helpdesk
```

Replace `YOUR_USERNAME` with your GitHub username.

### 2. Install Dependencies

```bash
cd server
npm install

cd ../client
npm install
```

### 3. Configure Environment Variables

Create a `.env` file inside the `server` directory.

```env
PORT=5000
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/helpdesk"
JWT_SECRET="replace_with_a_long_random_secret"
CLIENT_URL="http://localhost:5173"
```

Never commit your real `.env` file or production secrets to GitHub.

### 4. Set Up the Database

If you are using Prisma, configure your database connection and run:

```bash
cd server
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Start the Backend

```bash
cd server
npm run dev
```

### 6. Start the Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

Open the local URL printed by the frontend development server.

*Note: These commands assume the project has been configured with the corresponding scripts, dependencies, and database schema.*

## 🔌 API Endpoints

*Proposed REST API design.*

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Log in |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/tickets` | List accessible tickets |
| POST | `/api/tickets` | Create a ticket |
| GET | `/api/tickets/:id` | Get ticket details |
| PATCH | `/api/tickets/:id` | Update ticket details |
| PATCH | `/api/tickets/:id/assign` | Assign an agent |
| POST | `/api/tickets/:id/comments` | Add a comment |
| GET | `/api/dashboard/stats` | Get dashboard statistics |
| GET | `/api/users` | List users for authorized roles |

All protected endpoints should enforce authentication and role-based authorization on the server.

## 🗃️ Core Database Models

- **User** — Name, email, password hash, role, and timestamps.
- **Ticket** — Title, description, status, priority, category, creator, assigned agent, and timestamps.
- **Comment** — Ticket reference, author, message, and creation time.
- **Category** — Category name and description.
- **ActivityLog** — Ticket reference, actor, action, and timestamp.

Use database constraints and indexes where appropriate, and store password hashes rather than plaintext passwords.

## 🔒 Security Considerations

- Hash passwords with bcrypt.
- Validate and sanitize incoming data.
- Protect private endpoints with authentication middleware.
- Enforce permissions on the backend, not just the frontend.
- Prevent users from accessing tickets they are not authorized to view.
- Keep credentials and secrets in environment variables.
- Apply rate limiting to authentication endpoints.
- Use secure cookie or token handling appropriate to your deployment.

## 💡 Why This Project?

HelpDesk demonstrates practical software engineering concepts relevant to full-stack developer roles:

- Frontend and backend integration
- RESTful API development
- Relational database design
- Authentication and authorization
- CRUD operations and workflow management
- Input validation and security
- Error handling and testing
- Maintainable project architecture

## 👨‍💻 Author

**Kirandeep Kaur**

- GitHub: [@YOUR_USERNAME](https://github.com/kirn-kaur)
- LinkedIn: [Your LinkedIn Profile](https://www.linkedin.com/in/kirandeep-kaur6/)

