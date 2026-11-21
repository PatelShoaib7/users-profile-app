# REST API Documentation

Base URL (Local Development): `http://localhost:5000/api`

All responses follow a consistent JSON envelope:

```json
{
  "success": true,
  "message": "Optional human-readable message",
  "data": {},
  "pagination": {
    "total": 12,
    "page": 1,
    "limit": 8,
    "totalPages": 2
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Primary error message",
  "errors": ["Detailed validation error 1"]
}
```

---

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header:
```http
Authorization: Bearer <jwt_token>
```

### 1. Login (`POST /api/auth/login`)
Authenticates an active `admin` or `hr` user and returns a signed JWT.

- **Rate Limit:** 20 requests / 15 minutes per IP
- **Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "AdminPassword123"
}
```
- **Responses:**
  - `200 OK`: Returns `{ token, user }`
  - `400 Bad Request`: Joi validation error
  - `401 Unauthorized`: Invalid email or password
  - `403 Forbidden`: Account inactive or role not authorized (`employee` / `manager`)

### 2. Current User (`GET /api/auth/me`)
- **Auth:** `Bearer Token`
- **Responses:**
  - `200 OK`: Returns `{ user }`

---

## User Management (`/api/users`)

All routes under `/api/users` require `protect` and `authorize('admin', 'hr')`.

### 3. List & Search Users (`GET /api/users`)
Supports server-side search, filtering, sorting, and database-level pagination.

- **Query Parameters:**
  | Parameter | Type | Default | Description |
  | :--- | :--- | :--- | :--- |
  | `page` | `number` | `1` | Page number (1-indexed) |
  | `limit` | `number` | `8` | Results per page (max 100) |
  | `search` | `string` | `""` | Case-insensitive match on `fullName`, `email`, or `designation` |
  | `department` | `string` | `""` | Filter by department name |
  | `role` | `string` | `""` | Filter by `admin`, `hr`, `manager`, or `employee` |
  | `status` | `string` | `""` | Filter by `active` or `inactive` |
  | `sortBy` | `string` | `createdAt` | `createdAt`, `updatedAt`, `fullName`, `joiningDate`, `department`, `profileCompletion` |
  | `sortOrder` | `string` | `desc` | `asc` or `desc` |

- **Response:** `200 OK` with `{ data: User[], pagination }`.

### 4. Get Single User Profile (`GET /api/users/:id`)
Returns the user profile, detailed profile completion breakdown (`percentage`, `missingFields`), and the 10 most recent activity logs targeting this user.

- **Responses:**
  - `200 OK`: `{ data: { user, completion, recentActivities } }`
  - `404 Not Found`: User does not exist

### 5. Create User (`POST /api/users`)
Accepts `application/json` or `multipart/form-data` (with optional `avatar` file field).

- **RBAC Note:** `hr` users cannot create accounts with `role: "admin"`.
- **Request Body Fields:**
  - `fullName` *(required, string, 2–80 chars)*
  - `email` *(required, unique valid email)*
  - `password` *(optional, min 6 chars, defaults to `Welcome@123`)*
  - `phone`, `department`, `designation`, `role`, `joiningDate`, `status`, `bio`, `skills` *(array or comma-separated/JSON string)*
  - `avatar` *(optional image file: JPEG/PNG/WEBP, max 2 MB)*
- **Side Effects:** Hashes password, calculates `profileCompletion`, records `USER_CREATED` in `ActivityLog`.
- **Responses:**
  - `201 Created`: `{ data: { user } }`
  - `400 Bad Request`: Validation error
  - `403 Forbidden`: HR attempting to assign `admin` role
  - `409 Conflict`: Duplicate email address

### 6. Update User Profile (`PUT /api/users/:id`)
Accepts `application/json` or `multipart/form-data`.

- **Safeguards:** Users cannot deactivate or demote their own active account; HR cannot edit `admin` accounts.
- **Side Effects:** Recalculates `profileCompletion`, records `USER_UPDATED` (or `STATUS_CHANGED` if status changed).
- **Responses:** `200 OK`, `400`, `403`, `404`, `409`.

### 7. Activate / Deactivate User (`PATCH /api/users/:id/status`)
- **Request Body:**
```json
{
  "status": "inactive"
}
```
- **Side Effects:** Records `STATUS_CHANGED` in `ActivityLog`.
- **Responses:** `200 OK`, `400` (self-deactivation blocked), `403`, `404`.

### 8. Upload Profile Image (`POST /api/users/:id/avatar`)
- **Content-Type:** `multipart/form-data`
- **Field:** `avatar` (JPEG, PNG, or WEBP, max 2 MB)
- **Side Effects:** Saves image under `/uploads/avatars/`, updates `profileImage`, recalculates `profileCompletion`, records `USER_UPDATED`.
- **Responses:** `200 OK`, `400`, `404`.

### 9. Delete User (`DELETE /api/users/:id`)
- **Auth:** **Admin Only** (`authorize('admin')`)
- **Safeguards:** Blocks deleting your own currently logged-in account.
- **Side Effects:** Permanently removes user document and records `USER_DELETED` with `targetUserSnapshot` (`fullName`, `email`).
- **Responses:** `200 OK`, `400`, `403` (HR blocked), `404`.

---

## Dashboard & Insights (`/api/dashboard`)

### 10. Get Organizational Insights (`GET /api/dashboard/stats`)
- **Auth:** `admin` or `hr`
- **Response (`200 OK`):**
  - `summary`: `{ totalUsers, activeUsers, inactiveUsers, averageProfileCompletion, completeProfiles }`
  - `departmentDistribution`: MongoDB `$group` aggregation `[{ department, count, activeCount, percentage }]`
  - `roleDistribution`: `[{ role, count }]`
  - `recentlyAddedUsers`: Latest 5 created profiles
  - `recentlyUpdatedProfiles`: Latest 5 modified profiles
  - `recentActivities`: Latest 6 audit log entries

---

## Activity Logs (`/api/activities`)

### 11. List Activity Audit Logs (`GET /api/activities`)
- **Auth:** `admin` or `hr`
- **Query Parameters:**
  - `page` (default `1`)
  - `limit` (default `12`, max `50`)
  - `action` (optional filter: `USER_CREATED`, `USER_UPDATED`, `STATUS_CHANGED`, `USER_DELETED`)
- **Response:** `200 OK` with `{ data: ActivityLog[], pagination }`.

---

## Employee Self-Service Portal (`/api/portal`)

Accessible to any authenticated active user (`employee`, `manager`, `hr`, `admin`).

### 12. My Workspace Overview (`GET /api/portal/me`)
Returns `{ user, completion, summary }` including the user's `tasks`, `trainings`, and `monthlyTargets`.

### 13. Update Own Profile (`PUT /api/portal/profile`) & Upload Own Avatar (`POST /api/portal/avatar`)
Allows self-service updates to `fullName`, `phone`, `bio`, `skills`, `password`, and `avatar`.

### 14. Update Task / Training / Monthly Target Progress
- `PATCH /api/portal/tasks/:taskId` — `{ status: "pending" | "in_progress" | "completed" }`
- `PATCH /api/portal/trainings/:trainingId` — `{ progress: 0..100 }`
- `PATCH /api/portal/targets/:targetId` — `{ achievedValue: number }`

### 15. Admin/HR Goal & Learning Assignment (`/api/users/:id/...`)
- `POST /api/users/:id/tasks` & `DELETE /api/users/:id/tasks/:taskId`
- `POST /api/users/:id/trainings` & `DELETE /api/users/:id/trainings/:trainingId`
- `POST /api/users/:id/targets` & `DELETE /api/users/:id/targets/:targetId`
