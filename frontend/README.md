# PeoplePulse — Frontend Web App (`frontend/`)

Standalone React 18 + Redux Toolkit + Tailwind CSS Admin SPA for the User Profile Management & Insights Platform.

## Setup & Run

```bash
cd frontend
npm install

# Copy .env.example to .env and set VITE_API_URL / VITE_BACKEND_ORIGIN
cp .env.example .env

# Start development server (http://localhost:5173)
npm start
# or
npm run dev

# Production build
npm run build

# Run frontend utility tests
npm test
```

## Architecture Highlights
- **Redux Toolkit Store (`src/store/`):**
  - `authSlice`: JWT session state, login, session verification, logout
  - `userSlice`: Directory state, server-side filters/pagination, per-row `actionLoadingId`, `avatarUploading`, CRUD thunks
  - `dashboardSlice`: Insights stats, initial `loading` + background `refreshing` state
  - `activitySlice`: Paginated audit trail & action filter state
  - `uiSlice`: Global `activeRequests` progress tracking, toast notifications, sidebar & modal state
- **Loaders (`src/components/loaders/`):**
  - `TopProgressBar` (global Redux async thunk progress bar)
  - `DashboardSkeleton`, `TableSkeleton`, `ProfileSkeleton` shimmer states
  - `FullScreenLoader`, `ButtonSpinner`, and inline row/search/avatar spinners
