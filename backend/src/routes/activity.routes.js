const express = require('express');
const { getActivityLogs } = require('../controllers/activity.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

const router = express.Router();

router.get('/', protect, authorize('admin', 'hr'), getActivityLogs);

module.exports = router;
