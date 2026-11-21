const { User } = require('../models/User');
const { ActivityLog } = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/dashboard/stats
 * Organizational user counts, MongoDB aggregations, and recent profile activity
 */
const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    summaryAgg,
    departmentAgg,
    roleAgg,
    recentlyAddedUsers,
    recentlyUpdatedProfiles,
    recentActivities,
  ] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          activeUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
          inactiveUsers: {
            $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] },
          },
          averageProfileCompletion: { $avg: '$profileCompletion' },
          completeProfiles: {
            $sum: { $cond: [{ $eq: ['$profileCompletion', 100] }, 1, 0] },
          },
        },
      },
    ]),
    User.aggregate([
      {
        $group: {
          _id: {
            $cond: [
              { $or: [{ $eq: ['$department', ''] }, { $eq: ['$department', null] }] },
              'Unassigned',
              '$department',
            ],
          },
          count: { $sum: 1 },
          activeCount: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1, _id: 1 } },
    ]),
    User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]),
    User.find().sort({ createdAt: -1 }).limit(5),
    User.find().sort({ updatedAt: -1 }).limit(5),
    ActivityLog.find()
      .populate('performedBy', 'fullName email role')
      .populate('targetUser', 'fullName email')
      .sort({ createdAt: -1 })
      .limit(6),
  ]);

  const summary = summaryAgg[0] || {
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    averageProfileCompletion: 0,
    completeProfiles: 0,
  };

  const departmentDistribution = departmentAgg.map((item) => ({
    department: item._id,
    count: item.count,
    activeCount: item.activeCount,
    percentage:
      summary.totalUsers > 0
        ? Math.round((item.count / summary.totalUsers) * 100)
        : 0,
  }));

  const roleDistribution = roleAgg.map((item) => ({
    role: item._id,
    count: item.count,
  }));

  res.status(200).json({
    success: true,
    data: {
      summary: {
        totalUsers: summary.totalUsers,
        activeUsers: summary.activeUsers,
        inactiveUsers: summary.inactiveUsers,
        averageProfileCompletion: Math.round(summary.averageProfileCompletion || 0),
        completeProfiles: summary.completeProfiles,
      },
      departmentDistribution,
      roleDistribution,
      recentlyAddedUsers,
      recentlyUpdatedProfiles,
      recentActivities,
    },
  });
});

module.exports = {
  getDashboardStats,
};
