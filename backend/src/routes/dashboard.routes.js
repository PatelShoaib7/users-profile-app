const express = require('express');
const { getDashboardStats } = require('../controllers/dashboard.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/stats', protect, authorize('admin', 'hr'), getDashboardStats);

module.exports = router;
