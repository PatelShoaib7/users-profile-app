# PeoplePulse — Backend API (`backend/`)

Standalone Node.js + Express + MongoDB REST API for the User Profile Management & Insights Platform.

## Setup & Run

```bash
cd backend
npm install

# Copy .env.example to .env and configure MONGO_URI, JWT_SECRET, and SEED_* values
cp .env.example .env

# Optional: Seed initial sample workforce data
npm run seed

# Start in development mode (nodemon)
npm run dev

# Or start in production mode
npm start

# Run unit + integration tests
npm test
```

All sensitive configuration (`MONGO_URI`, `JWT_SECRET`, `DEFAULT_NEW_USER_PASSWORD`, `SEED_*` credentials) is loaded strictly from `backend/.env` via `src/config/env.js`. Never commit `.env` to version control.
