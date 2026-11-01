# API reference

Base path: `/api`. Except for registration, login, CSRF initialization, and health, routes require the signed-in user's HTTP-only JWT cookie. Mutating requests require the CSRF cookie and matching `X-CSRF-Token` header. JSON responses use `{ "data": ... }`; errors use `{ "message": "..." }`.

## Health and authentication

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | Public | API health |
| GET | `/auth/csrf` | Public | Set and return the CSRF token |
| POST | `/auth/register` | Public, rate limited | Create a customer account |
| POST | `/auth/login` | Public, rate limited | Sign in |
| POST | `/auth/logout` | Signed-in browser | Clear the session cookie |
| GET | `/auth/me` | Signed in | Current user |

## Tickets and conversations

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/tickets` | Signed in | Search, filter, sort, and paginate tickets visible to the role |
| POST | `/tickets` | Customer | Create a ticket |
| GET | `/tickets/:id` | Ticket owner, permitted agent, or admin | Ticket, permitted comments, and admin activity history |
| PATCH | `/tickets/:id` | Permitted agent or admin | Update title, description, category, or priority |
| PATCH | `/tickets/:id/assign` | Admin | Assign or unassign an agent |
| PATCH | `/tickets/:id/status` | Ticket owner for eligible reopen; permitted staff | Change status |
| GET | `/tickets/:id/comments` | Ticket owner, permitted agent, or admin | List visible replies and staff notes |
| POST | `/tickets/:id/comments` | Ticket owner, permitted agent, or admin | Add a reply or staff-only internal note |

List query parameters include `q`, `status`, `priority`, `category`, `assignedAgent` (admin), `sort` (`newest`, `oldest`, `priority`), `page`, and `limit`.

## Dashboards, people, and categories

| Method | Route | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/dashboard/stats` | Signed in | Role-scoped live MongoDB statistics |
| GET | `/dashboard/trends` | Agent or admin | Recent ticket activity |
| GET | `/users` | Admin | Search and paginate users |
| GET | `/users/:id` | Admin | Read a user |
| PATCH | `/users/:id/role` | Admin | Change a user's role |
| PATCH | `/users/:id/status` | Admin | Activate or deactivate an account |
| GET | `/categories` | Signed in | List active categories (admin sees archived too) |
| POST | `/categories` | Admin | Create a category |
| PATCH | `/categories/:id` | Admin | Update a category |
| DELETE | `/categories/:id` | Admin | Delete unused category or archive one used by tickets |

Internal notes never appear in customer responses. Invalid input, inaccessible tickets, and unauthorized roles receive appropriate 4xx responses. Unexpected production errors do not expose stack traces.
