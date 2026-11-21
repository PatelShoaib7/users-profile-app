# PeoplePulse — User Profile Management & Insights Platform

A practical full-stack **MERN** application transformed from a static User Profile Viewer into an internal **Admin & HR Workforce Directory, Profile Completeness, and Organizational Insights Platform**.

The **Backend (`backend/`)** and **Frontend (`frontend/`)** are completely separate, standalone projects, each with its own `package.json`, `.env` configuration, and test suite.

---

## Running Backend & Frontend Separately

### 1. Start the Backend API (`backend/`)
Open **Terminal 1**:
```bash
cd backend
npm install
cp .env.example .env   # Configure MONGO_URI, JWT_SECRET, and SEED_* values in backend/.env
npm run dev            # Runs on http://localhost:5000 (or `npm start`)
```
> In development mode, if local MongoDB is unreachable and `ALLOW_IN_MEMORY_DB_FALLBACK=true` in `backend/.env`, the server automatically boots a local embedded MongoDB instance and seeds initial sample users using the `SEED_*` variables in `backend/.env`.

### 2. Start the Frontend SPA (`frontend/`)
Open **Terminal 2**:
```bash
cd frontend
npm install
cp .env.example .env   # Configure VITE_API_URL=http://localhost:5000/api in frontend/.env
npm start              # Runs on http://localhost:5173 (or `npm run dev`)
```

Open **http://localhost:5173** in your browser and sign in using the Admin or HR credentials configured in your local `backend/.env`.

---

## Core Engineering Highlights

- **Strict `.env` Secret Management:**
  - Zero hardcoded JWT secrets, database URIs, or user passwords in source code.
  - Validated centrally via [backend/src/config/env.js](backend/src/config/env.js) and [frontend/src/config/env.js](frontend/src/config/env.js).
  - `.env` and `.env.*` files are gitignored; safe templates are provided in `backend/.env.example` and `frontend/.env.example`.
- **Full Redux Toolkit State Management (`frontend/src/store/`):**
  - `authSlice`, `userSlice`, `dashboardSlice`, `activitySlice`, and `uiSlice` (modals, sidebar, toast notifications, and automatic global pending-request tracking).
- **Rich Loading UX (`frontend/src/components/loaders/`):**
  - Global Redux-driven `TopProgressBar` on every API request.
  - Shimmer skeletons (`DashboardSkeleton`, `TableSkeleton`, `ProfileSkeleton`).
  - Inline spinners for debounced search, row-level status/delete actions (`actionLoadingId`), avatar uploads (`avatarUploading`), dashboard refresh, and form buttons (`ButtonSpinner`).
- **Dual Role-Based UI (Admin/HR Console vs Employee Self-Service Portal):**
  - **Admin / HR UI (`/dashboard`, `/users`, `/users/:id`, `/activities`):** Dark-sidebar management console with company-wide analytics, searchable directory, profile management, audit logs, and assignment of **Tasks**, **Training Courses**, and **Monthly Targets** to employees.
  - **Employee / User UI (`/portal`, `/portal/tasks`, `/portal/trainings`, `/portal/targets`, `/portal/profile`):** Dedicated employee workspace displaying personal profile & completeness checklist, assigned sprint tasks (with live status updates), enrolled training courses (with progress tracking), and monthly targets to achieve this month.

---

## Project Structure

```text
users-profile-app/
├── backend/                  # Standalone Express + Mongoose REST API
│   ├── src/
│   │   ├── config/           # env.js (strict .env loader) & db.js
│   │   ├── controllers/      # Auth, Users, Dashboard, Activity controllers
│   │   ├── middleware/       # JWT auth, RBAC, Joi validation, Multer, rate limiter, error handler
│   │   ├── models/           # User & ActivityLog Mongoose schemas + indexes
│   │   ├── routes/           # REST API route definitions
│   │   ├── seed/             # Sample workforce data & CLI seed script
│   │   ├── services/         # Profile completion calculator & activity logger
│   │   └── validators/       # Joi request validation schemas
│   ├── tests/                # Unit & API integration tests (`npm test`)
│   ├── .env.example
│   └── package.json
│
├── frontend/                 # Standalone React + Redux Toolkit + Tailwind SPA
│   ├── src/
│   │   ├── api/              # Axios instance + modular API services
│   │   ├── components/       # Loaders, skeletons, toasts, layout, and user components
│   │   ├── config/           # env.js (VITE_* environment reader)
│   │   ├── hooks/            # useDebounce
│   │   ├── pages/            # Login, Dashboard, Directory, UserProfile, ActivityLogs
│   │   ├── store/            # Redux store, hooks, and 5 slices (auth, users, dashboard, activities, ui)
│   │   └── utils/            # Date/avatar formatters & constants
│   ├── .env.example
│   └── package.json
│
└── docs/
    ├── TRANSFORMATION_PLAN.md
    ├── API_DOCUMENTATION.md
    └── DEPLOYMENT.md
```

---

## Running Tests & Production Build

```bash
# Backend unit & API integration tests
cd backend && npm test

# Frontend utility tests & production bundle build
cd frontend && npm test && npm run build
```

---

## Documentation Links

- [Transformation Plan & Database Design](./docs/TRANSFORMATION_PLAN.md)
- [REST API Documentation](./docs/API_DOCUMENTATION.md)
- [Cloud Deployment Guide](./docs/DEPLOYMENT.md)
