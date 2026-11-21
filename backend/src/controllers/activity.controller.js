const { ActivityLog, ACTIVITY_ACTIONS } = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/activities
 * Paginated activity audit log with optional action filter
 */
const getActivityLogs = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 12));
  const action = (req.query.action || '').trim();

  const filter = {};
  if (action && ACTIVITY_ACTIONS.includes(action)) {
    filter.action = action;
  }

  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('performedBy', 'fullName email role profileImage')
      .populate('targetUser', 'fullName email role status profileImage')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    data: logs,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

module.exports = {
  getActivityLogs,
};
