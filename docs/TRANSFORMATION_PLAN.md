# Transformation Plan: User Profile Viewer → User Profile Management & Insights Platform

This document captures **Steps 1–4** of transforming the legacy prototype into a practical full-stack MERN application suitable for real internal Admin/HR workflows.

---

## Step 1: Existing Codebase Audit

The initial repository contained only `src/` and `README.md` (without a `package.json`, `public/` directory, or backend server):

| Existing File | Original Functionality | Limitations Identified |
| :--- | :--- | :--- |
| `src/API/Api.js` | URL helpers calling `randomuser.me` (50 random users) and SpaceX v3 demo capsules API | Hardcoded public third-party URLs; no backend persistence or auth headers |
| `src/Context/Context_API.jsx` | React Context holding `page`, `data`, `status`, and fetching `randomuser.me` on mount | No authentication state, error states, or structured slice separation |
| `src/Components/Banner.jsx` | Top header with logo, static "Sign Up / Log in" buttons, hero section, and carousel | Buttons were non-functional; mixed `@chakra-ui/react` and `@material-ui/core` v4 |
| `src/Components/Carosel.jsx` | Horizontal carousel rendering random user avatars, names, and countries | Purely decorative; relied on `react-alice-carousel` |
| `src/Components/Body.jsx` | Search bar, status filter dropdown, ASC/DESC radio sort, data table, client-side pagination, and "More Details" modal | Client-side slicing/filtering only; mixed SpaceX capsule fields with user viewer concepts; inline styles + deprecated `makeStyles` |
| `src/Components/Footer.jsx` | Multi-column company footer (`BrainStrom Force / @Shoaib Patel`) with social links | Coupled to Chakra color mode hooks |
| `src/Pages/Home.jsx` & `src/App.js` | Single-page wrapper rendering `Banner`, `Body`, and `Footer` | No routing, login screen, dashboard analytics, or protected views |
| `src/Assets/img1.jpg`–`img7.jpg` | Local JPEG assets | Unoptimized static imports |

---

## Step 2: Reusability Mapping

Rather than discarding the original ideas, each existing UI pattern and module was mapped and evolved:

1. **API Layer (`src/API/Api.js` → `frontend/src/api/`)**:
   - Retained Axios as the HTTP client (`axiosClient.js`) and added centralized base URL config + JWT `Authorization` interceptors + modular API helpers (`authApi.js`, `userApi.js`, `dashboardApi.js`, `activityApi.js`).
2. **State Management (`src/Context/Context_API.jsx` → `frontend/src/store/`)**:
   - Upgraded the `page`, `data`, and `status` state concepts from Context API into **Redux Toolkit** slices (`authSlice`, `userSlice`, `dashboardSlice`, `activitySlice`) using `createAsyncThunk`.
3. **Directory Controls, Table & Details Modal (`src/Components/Body.jsx` → `frontend/src/components/users/`)**:
   - Extracted the monolithic 237-line `Body.jsx` into clean, single-responsibility components:
     - `UserFilters.jsx` (debounced search by name/email, department/role/status filters, sort field & direction)
     - `UserTable.jsx` (avatar, user identity, department/designation, role, status badge, profile completion bar, row actions)
     - `UserDetailModal.jsx` (quick-view modal evolved directly from the original "More Details" modal, now displaying missing fields & skills)
     - `UserFormModal.jsx` (reusable Create / Edit user modal with avatar upload)
     - `Pagination.jsx` (server-side pagination controls)
4. **Header, Carousel & Footer (`Banner.jsx`, `Carosel.jsx`, `Footer.jsx` → `frontend/src/components/layout/` & `DashboardPage.jsx`)**:
   - `Banner.jsx` top bar evolved into `Topbar.jsx` + `Sidebar.jsx` with real authenticated user context and logout.
   - `Carosel.jsx` ("Meet Our Customers") evolved into the **Recently Added Team Members** & **Recently Updated Profiles** showcase cards on `DashboardPage.jsx`.
   - `Footer.jsx` preserved the attribution and clean footer layout, migrated to Tailwind CSS to eliminate React 18 peer-dependency conflicts between Chakra UI and Material UI v4.
5. **Local Assets (`src/Assets/`)**:
   - Preserved lightweight profile assets in `frontend/src/assets/` for fallback/brand imagery.

---

## Step 3: Missing Functionality & Incremental Plan

To turn the viewer into a practical internal **User Profile Management & Insights Platform**, we added:

1. **Backend REST API (`backend/`)**:
   - Express + Mongoose MVC structure, centralized error handling, Joi request validation, `express-rate-limit`, and `multer` local avatar upload.
2. **Authentication & RBAC**:
   - JWT authentication (`POST /api/auth/login`, `GET /api/auth/me`), `bcrypt` password hashing, `protect` middleware, and role-based `authorize('admin', 'hr')` / `authorize('admin')` guards:
     - **Admin**: Full access (including permanent user deletion).
     - **HR**: Can view insights, create users, edit profiles, upload avatars, and activate/deactivate users, but cannot permanently delete users.
3. **Profile Completion Engine**:
   - Evaluates 10 profile attributes (`fullName`, `email`, `phone`, `profileImage`, `department`, `designation`, `role`, `joiningDate`, `bio`, `skills`) to compute `profileCompletion` (0–100%) and return exact `missingFields`.
4. **Dashboard & MongoDB Aggregations**:
   - Single `/api/dashboard/stats` endpoint aggregating total/active/inactive counts, average profile completion, `$group` department distribution, `$group` role breakdown, 5 newest hires, and 5 recently updated profiles.
5. **Activity Audit Trail**:
   - Automatic logging of `USER_CREATED`, `USER_UPDATED`, `USER_DELETED`, and `STATUS_CHANGED` with `performedBy`, `targetUser`, and a `targetUserSnapshot` (so deleted user names remain readable in historical logs).

---

## Step 4: Database Design (Mongoose Schemas & Indexes)

Only **two** practical collections are used, avoiding overengineering:

### 1. `users` Collection (`User` Model)
| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `fullName` | `String` | Required, trimmed, 2–80 chars |
| `email` | `String` | Required, unique, lowercase, trimmed |
| `password` | `String` | Required, `select: false`, hashed via `bcrypt` |
| `phone` | `String` | Optional, trimmed |
| `profileImage` | `String` | Optional URL or `/uploads/avatars/...` path |
| `department` | `String` | Enum/String (`Engineering`, `Human Resources`, `Product`, `Design`, `Marketing`, `Sales`, `Finance`, `Operations`) |
| `designation` | `String` | Trimmed job title (e.g., `Frontend Developer`) |
| `role` | `String` | Enum: `['admin', 'hr', 'manager', 'employee']`, default `'employee'` |
| `joiningDate` | `Date` | Optional date |
| `status` | `String` | Enum: `['active', 'inactive']`, default `'active'` |
| `bio` | `String` | Max 500 chars |
| `skills` | `[String]` | Array of trimmed skill tags |
| `profileCompletion` | `Number` | 0–100, auto-computed before save/update |
| `createdAt` / `updatedAt` | `Date` | Automatic Mongoose timestamps |

**Indexes on `users`:**
- `{ email: 1 }` (Unique index — prevents duplicate registration)
- `{ fullName: 1 }` (Supports name sorting and search)
- `{ department: 1, status: 1, role: 1 }` (Compound index for directory filtering & dashboard aggregations)
- `{ createdAt: -1 }` & `{ updatedAt: -1 }` (Supports pagination & recent activity queries)

### 2. `activitylogs` Collection (`ActivityLog` Model)
| Field | Type | Constraints / Notes |
| :--- | :--- | :--- |
| `action` | `String` | Enum: `['USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'STATUS_CHANGED']` |
| `performedBy` | `ObjectId` | `ref: 'User'`, required |
| `targetUser` | `ObjectId` | `ref: 'User'`, nullable (if user is later deleted) |
| `targetUserSnapshot` | `{ fullName, email }` | Preserves target user display info even after deletion |
| `details` | `String` | Concise human-readable description of the change |
| `createdAt` | `Date` | Timestamp of the event |

**Indexes on `activitylogs`:**
- `{ createdAt: -1 }` (Fast reverse-chronological pagination)
- `{ action: 1, createdAt: -1 }` (Filtered audit queries)
- `{ targetUser: 1, createdAt: -1 }` (Per-user profile activity history)
