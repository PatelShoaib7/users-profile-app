# Deployment Guide

This guide covers deploying the **User Profile Management & Insights Platform** using standard, developer-friendly cloud hosting (**MongoDB Atlas + Render + Vercel/Netlify**).

---

## 1. Database Setup (MongoDB Atlas)

1. Create a free M0 cluster at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a database user (e.g., `app_user`) with read/write permissions.
3. Under **Network Access**, allow access from your backend host (or `0.0.0.0/0` for cloud PaaS providers like Render).
4. Copy the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/user_management_platform?retryWrites=true&w=majority
   ```

---

## 2. Backend Deployment (Render or Railway)

1. Create a new **Web Service** pointing to this GitHub repository.
2. Configure the service settings:
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Add the following **Environment Variables**:
   ```env
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/user_management_platform
   ALLOW_IN_MEMORY_DB_FALLBACK=false
   JWT_SECRET=<generate-a-long-random-64-char-secret>
   JWT_EXPIRES_IN=7d
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```
4. Once deployed, seed initial Admin/HR accounts once from your local terminal or Render Shell:
   ```bash
   MONGO_URI="your_atlas_uri" npm run seed --prefix backend
   ```
   *(Immediately change the default Admin & HR passwords after first login in production.)*

> **Note on Uploaded Images in Production:** By default, Multer writes uploaded avatars to `backend/uploads/avatars`. On ephemeral filesystems (such as Render free tier), attach a persistent disk mounted at `/opt/render/project/src/backend/uploads` or swap the storage adapter to Cloudinary/S3 if persistent user-uploaded files across container restarts are needed.

---

## 3. Frontend Deployment (Vercel or Netlify)

1. Import the repository into **Vercel** or **Netlify**.
2. Configure build settings:
   - **Root Directory / Base Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output / Publish Directory:** `dist`
3. Set Frontend **Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-service.onrender.com/api
   VITE_BACKEND_ORIGIN=https://your-backend-service.onrender.com
   ```
4. Configure SPA client-side routing fallback so refreshing `/users` or `/dashboard` serves `index.html`:
   - **Netlify:** Create `frontend/public/_redirects` containing:
     ```text
     /* /index.html 200
     ```
   - **Vercel:** Create `frontend/vercel.json` containing:
     ```json
     {
       "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
     }
     ```
5. Deploy and verify login at your live frontend URL.
