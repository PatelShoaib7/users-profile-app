const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const activityRoutes = require('./routes/activity.routes');
const portalRoutes = require('./routes/portal.routes');
const { apiLimiter } = require('./middleware/rateLimiter.middleware');
const { notFoundHandler, errorHandler } = require('./middleware/error.middleware');
const { ensureTrainingMaterials, materialsDir } = require('./utils/pdfGenerator');
const ApiError = require('./utils/ApiError');

// Generate sample PDF training handbooks on startup
ensureTrainingMaterials();

const app = express();

// CORS setup driven by CLIENT_URL in backend/.env
const allowedOrigins = env.clientUrl.split(',').map((o) => o.trim()).filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || env.nodeEnv !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

if (env.nodeEnv !== 'test') {
  app.use(morgan('dev'));
}

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploaded avatars and inline viewable PDF handbooks
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(
  '/materials',
  express.static(materialsDir, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.pdf')) {
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
      }
    },
  })
);

// Dedicated attachment download endpoint for training PDFs
app.get('/api/materials/:filename/download', (req, res, next) => {
  const safeName = path.basename(req.params.filename);
  const fullPath = path.join(materialsDir, safeName);
  if (!fs.existsSync(fullPath)) {
    return next(new ApiError(404, 'Requested PDF training material was not found.'));
  }
  const customDownloadName = req.query.name
    ? path.basename(String(req.query.name))
    : safeName;
  return res.download(fullPath, customDownloadName);
});

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'User Profile Management API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiLimiter);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/portal', portalRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
