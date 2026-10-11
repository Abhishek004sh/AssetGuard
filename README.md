# AssetGuard

A MERN-stack asset, warranty, and subscription tracker with multi-workspace support.

## Overview

AssetGuard helps teams keep track of the equipment they own, when its warranty runs out, and the subscriptions they're paying for — all in one place, organized by workspace. Each workspace has its own members with role-based permissions, so a team can share one source of truth instead of everyone keeping their own spreadsheet.

## Key Features

- **Multi-workspace support** — users can belong to several workspaces, each with its own assets and members
- **Role-based access** — `OWNER`, `MEMBER`, and `VIEWER` roles per workspace; owners can delete and manage members, members can add/edit, viewers are read-only
- **Asset management** — create, edit, delete, and search assets with category, purchase details, and serial number
- **Warranty tracking** — assets are automatically bucketed into active / expiring soon / expired
- **Invoice uploads** — attach an invoice (PDF/image) to an asset, stored via Cloudinary
- **Subscription tracking** — track recurring subscriptions and renewal stats per workspace
- **Notifications** — warranty and subscription renewal checks surfaced to the user
- **JWT authentication** — register/login with token-based auth

## Tech Stack

- **Frontend:** React (Vite), React Router, Tailwind CSS
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **File storage:** Cloudinary
- **Auth:** JWT

## Folder Structure

```
assetguard/
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── authz.test.js             # Authorization tests
│   └── src/
│       ├── config/               # DB and Cloudinary setup
│       ├── controllers/          # Route handler logic
│       ├── middleware/           # Auth, workspace context, role checks, validation
│       ├── models/                # Mongoose schemas
│       ├── routes/                # Express routers
│       ├── services/              # Warranty/subscription check jobs
│       ├── validations/           # Request validation schemas
│       └── jobs/                  # Scheduled notification job
└── frontend/
    └── src/
        ├── components/            # Shared UI (Layout, Sidebar, Navbar, ui primitives)
        ├── context/                # Auth and Workspace context providers
        ├── pages/                  # Route-level pages (Dashboard, Assets, Workspace, etc.)
        └── services/               # API client wrappers (axios)
```

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- A MongoDB connection string (local or Atlas)
- A Cloudinary account (for invoice uploads)

### 1. Clone and install

```bash
git clone https://github.com/Abhishek004sh/AssetGuard.git
cd AssetGuard

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure environment variables

```bash
cd backend
cp .env.example .env
```

Fill in `backend/.env` with your own values (see [Environment Variables](#environment-variables) below).

### 3. Run it

```bash
# Terminal 1 - backend
cd backend
npm run dev

# Terminal 2 - frontend
cd frontend
npm run dev
```

The backend runs on `http://localhost:5000` by default, and the frontend dev server prints its own local URL (Vite's default is `http://localhost:5173`).

## Environment Variables

Set these in `backend/.env` (see `backend/.env.example`):

| Variable | Description |
|---|---|
| `PORT` | Port the backend server listens on (default: `5000`) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret used to sign JWT auth tokens — any long random string |
| `CLOUDINARY_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

`dotenv.config()` is loaded first thing in `server.js`, before any other module, since several modules (like the Cloudinary config) read `process.env` at import time.

## API Overview

All protected routes require an `Authorization: Bearer <token>` header. Workspace-scoped routes also expect a current workspace to be resolvable (via the `workspaceContext` middleware).

| Route | Method | Description | Access |
|---|---|---|---|
| `/api/auth/register` | POST | Register a new user | Public |
| `/api/auth/login` | POST | Log in and receive a JWT | Public |
| `/api/auth/me` | GET | Get the logged-in user's profile | Authenticated |
| `/api/workspace` | GET | List workspaces the user belongs to | Authenticated |
| `/api/workspace/create` | POST | Create a new workspace | Authenticated |
| `/api/workspace/:id` | GET | Get a workspace by ID | Authenticated |
| `/api/workspace/:id/member` | POST | Add a member to a workspace | Authenticated (owner-checked in controller) |
| `/api/workspace/:id/member/:userId` | DELETE | Remove a member from a workspace | Authenticated (owner-checked in controller) |
| `/api/assets` | GET | List assets in the current workspace | Any workspace role |
| `/api/assets/warranty-status` | GET | Get warranty status counts | Any workspace role |
| `/api/assets` | POST | Create a new asset | OWNER, MEMBER |
| `/api/assets/:id` | PUT | Update an asset | OWNER, MEMBER |
| `/api/assets/:id/invoice` | POST | Upload an invoice file for an asset | OWNER, MEMBER |
| `/api/assets/:id` | DELETE | Delete an asset | OWNER |
| `/api/subscriptions` | GET | List subscriptions in the current workspace | Any workspace role |
| `/api/subscriptions/stats` | GET | Get subscription stats | Any workspace role |
| `/api/subscriptions` | POST | Create a subscription | OWNER, MEMBER |
| `/api/subscriptions/:id` | PUT | Update a subscription | OWNER, MEMBER |
| `/api/subscriptions/:id` | DELETE | Delete a subscription | OWNER |
| `/api/dashboard` | GET | Get dashboard summary for the current workspace | Authenticated |
| `/api/notifications` | GET | Get notifications for the user | Authenticated |
| `/api/notifications/check-warranty` | GET | Manually trigger a warranty check | Authenticated |
| `/api/notifications/check-subscriptions` | GET | Manually trigger a subscription renewal check | Authenticated |

## Screenshots

_Add screenshots here._

## Future Improvements

- Email/push notifications for expiring warranties and renewals, instead of in-app only
- CSV/Excel export of assets and subscriptions
- Audit log of who changed what within a workspace
