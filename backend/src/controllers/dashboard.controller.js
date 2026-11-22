const { User } = require('../models/User');
const { ActivityLog } = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

// Monthly departmental budget caps (INR)
const DEPARTMENT_BUDGET_CAPS = {
  Engineering: 650000,
  Product: 320000,
  Sales: 280000,
  Design: 220000,
  Marketing: 190000,
  'Human Resources': 180000,
  Finance: 160000,
  Operations: 150000,
};

/**
 * GET /api/dashboard/stats
 * Comprehensive Admin Insights:
 * 1. Attendance & Late Marks Overview
 * 2. Target & Deliverable Status Breakdown (Completed, In Progress, Not Started)
 * 3. Budget Allocation by Department & Expense Category
 * 4. Workforce Counts, Department Distribution, Recent Joins/Updates & Activity Logs
 */
const getDashboardStats = asyncHandler(async (_req, res) => {
  const [
    summaryAgg,
    departmentAgg,
    roleAgg,
    allUsers,
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
          utilizedBudget: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'active'] },
                { $ifNull: ['$monthlyBudgetAllocation', 85000] },
                0,
              ],
            },
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
    User.find().select(
      'fullName email department designation role status profileImage profileCompletion attendance monthlyTargets tasks trainings monthlyBudgetAllocation'
    ),
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

  // 1. Attendance & Late Marks Aggregation (across active workforce)
  const activeWorkforce = allUsers.filter((u) => u.status === 'active');
  let totalWorkingDays = 0;
  let totalPresentDays = 0;
  let totalAbsentDays = 0;
  let totalLeaveDays = 0;
  let totalLateMarks = 0;

  const lateMarkCandidates = [];

  for (const emp of activeWorkforce) {
    const att = emp.attendance || {};
    const wDays = att.workingDays ?? 22;
    const pDays = att.presentDays ?? 20;
    const aDays = att.absentDays ?? 0;
    const lDays = att.leaveDays ?? 2;
    const lMarks = att.lateMarks ?? 0;

    totalWorkingDays += wDays;
    totalPresentDays += pDays;
    totalAbsentDays += aDays;
    totalLeaveDays += lDays;
    totalLateMarks += lMarks;

    if (lMarks > 0) {
      lateMarkCandidates.push({
        _id: emp._id,
        fullName: emp.fullName,
        email: emp.email,
        department: emp.department || 'Unassigned',
        designation: emp.designation || emp.role,
        profileImage: emp.profileImage || '',
        lateMarks: lMarks,
        presentDays: pDays,
        workingDays: wDays,
        attendancePct: wDays > 0 ? Math.round((pDays / wDays) * 100) : 0,
      });
    }
  }

  lateMarkCandidates.sort((a, b) => b.lateMarks - a.lateMarks);

  const overallAttendanceRate =
    totalWorkingDays > 0 ? Math.round((totalPresentDays / totalWorkingDays) * 100) : 0;
  const onTimeRate =
    totalPresentDays > 0
      ? Math.max(0, Math.round(((totalPresentDays - totalLateMarks) / totalPresentDays) * 100))
      : 100;

  const attendanceOverview = {
    overallAttendanceRate,
    onTimeRate,
    totalWorkingDays,
    totalPresentDays,
    totalAbsentDays,
    totalLeaveDays,
    totalLateMarks,
    employeesWithLateMarks: lateMarkCandidates.length,
    lateMarkWatchlist: lateMarkCandidates.slice(0, 5),
  };

  // 2. Target & Deliverable Breakdown (Completed, In Progress, Not Started)
  let targetsCompleted = 0;
  let targetsInProgress = 0;
  let targetsNotStarted = 0;

  let tasksCompleted = 0;
  let tasksInProgress = 0;
  let tasksNotStarted = 0;

  for (const emp of activeWorkforce) {
    for (const t of emp.monthlyTargets || []) {
      const achieved = Number(t.achievedValue) || 0;
      const goal = Number(t.targetValue) || 1;
      if (t.status === 'achieved' || achieved >= goal) {
        targetsCompleted += 1;
      } else if (achieved <= 0 || t.status === 'not_started') {
        targetsNotStarted += 1;
      } else {
        targetsInProgress += 1;
      }
    }

    for (const task of emp.tasks || []) {
      if (task.status === 'completed') tasksCompleted += 1;
      else if (task.status === 'in_progress') tasksInProgress += 1;
      else tasksNotStarted += 1;
    }
  }

  const totalTargets = targetsCompleted + targetsInProgress + targetsNotStarted;
  const totalTasks = tasksCompleted + tasksInProgress + tasksNotStarted;

  const pct = (part, whole) => (whole > 0 ? Math.round((part / whole) * 100) : 0);

  const progressBreakdown = {
    targets: {
      total: totalTargets,
      completed: targetsCompleted,
      inProgress: targetsInProgress,
      notStarted: targetsNotStarted,
      completedPct: pct(targetsCompleted, totalTargets),
      inProgressPct: pct(targetsInProgress, totalTargets),
      notStartedPct: pct(targetsNotStarted, totalTargets),
    },
    tasks: {
      total: totalTasks,
      completed: tasksCompleted,
      inProgress: tasksInProgress,
      notStarted: tasksNotStarted,
      completedPct: pct(tasksCompleted, totalTasks),
      inProgressPct: pct(tasksInProgress, totalTasks),
      notStartedPct: pct(tasksNotStarted, totalTasks),
    },
  };

  // 3. Budget Allocation Breakdown (Department-wise & Category-wise)
  const deptUtilizedMap = {};
  for (const item of departmentAgg) {
    deptUtilizedMap[item._id] = {
      headcount: item.activeCount,
      utilizedBudget: item.utilizedBudget || 0,
    };
  }

  const allDeptNames = Array.from(
    new Set([...Object.keys(DEPARTMENT_BUDGET_CAPS), ...Object.keys(deptUtilizedMap)])
  ).filter((d) => d !== 'Unassigned' || (deptUtilizedMap.Unassigned?.headcount || 0) > 0);

  let totalCompanyBudget = 0;
  let totalUtilizedBudget = 0;

  const byDepartmentRaw = allDeptNames.map((dept) => {
    const utilized = deptUtilizedMap[dept]?.utilizedBudget || 0;
    const headcount = deptUtilizedMap[dept]?.headcount || 0;
    const cap = Math.max(DEPARTMENT_BUDGET_CAPS[dept] || 120000, utilized);
    totalCompanyBudget += cap;
    totalUtilizedBudget += utilized;

    return {
      department: dept,
      headcount,
      allocatedBudget: cap,
      utilizedBudget: utilized,
      utilizationPct: cap > 0 ? Math.round((utilized / cap) * 100) : 0,
    };
  });

  const byDepartment = byDepartmentRaw
    .map((d) => ({
      ...d,
      shareOfCompanyPct:
        totalCompanyBudget > 0
          ? Math.round((d.allocatedBudget / totalCompanyBudget) * 100)
          : 0,
    }))
    .sort((a, b) => b.allocatedBudget - a.allocatedBudget);

  const byCategory = [
    {
      category: 'Payroll & Compensation',
      amount: Math.round(totalUtilizedBudget * 0.68),
      percentage: 68,
      description: 'Base salaries, allowances, and statutory employee benefits',
    },
    {
      category: 'Cloud, DevOps & Software Tools',
      amount: Math.round(totalUtilizedBudget * 0.14),
      percentage: 14,
      description: 'Hosting, MongoDB clusters, Figma, IDE & SaaS seats',
    },
    {
      category: 'Training & Upskilling (L&D)',
      amount: Math.round(totalUtilizedBudget * 0.1),
      percentage: 10,
      description: 'Udemy/Coursera enterprise licenses and internal workshops',
    },
    {
      category: 'Hiring & Workplace Operations',
      amount: Math.round(totalUtilizedBudget * 0.08),
      percentage: 8,
      description: 'Recruitment drives, IT hardware, and HR compliance',
    },
  ];

  const budgetAllocation = {
    currency: 'INR',
    totalCompanyBudget,
    totalUtilizedBudget,
    remainingBudget: Math.max(0, totalCompanyBudget - totalUtilizedBudget),
    utilizationPct:
      totalCompanyBudget > 0
        ? Math.round((totalUtilizedBudget / totalCompanyBudget) * 100)
        : 0,
    byDepartment,
    byCategory,
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

  // 4. Per-Employee Drill-Down Analytics (powers interactive clicks on Attendance, Targets, Tasks & Budget cards)
  const employeeAnalytics = allUsers.map((emp) => {
    const att = emp.attendance || {};
    const wDays = att.workingDays ?? 22;
    const pDays = att.presentDays ?? 20;
    const aDays = att.absentDays ?? 0;
    const lDays = att.leaveDays ?? 2;
    const lMarks = att.lateMarks ?? 0;
    const attendancePct = wDays > 0 ? Math.round((pDays / wDays) * 100) : 0;
    const onTimePct =
      pDays > 0 ? Math.max(0, Math.round(((pDays - lMarks) / pDays) * 100)) : 100;

    const targetItems = (emp.monthlyTargets || []).map((t) => {
      const achieved = Number(t.achievedValue) || 0;
      const goal = Number(t.targetValue) || 1;
      const itemPct = Math.min(100, Math.round((achieved / goal) * 100));
      let state = 'in_progress';
      if (t.status === 'achieved' || achieved >= goal) state = 'completed';
      else if (achieved <= 0 || t.status === 'not_started') state = 'not_started';

      return {
        _id: t._id,
        title: t.title,
        month: t.month,
        targetValue: goal,
        achievedValue: achieved,
        unit: t.unit || 'items',
        pct: itemPct,
        state,
      };
    });

    const empTargetCompleted = targetItems.filter((i) => i.state === 'completed').length;
    const empTargetInProgress = targetItems.filter((i) => i.state === 'in_progress').length;
    const empTargetNotStarted = targetItems.filter((i) => i.state === 'not_started').length;
    const empTargetOverallPct =
      targetItems.length > 0
        ? Math.round(targetItems.reduce((acc, i) => acc + i.pct, 0) / targetItems.length)
        : 0;

    const taskItems = (emp.tasks || []).map((tk) => ({
      _id: tk._id,
      title: tk.title,
      priority: tk.priority || 'medium',
      dueDate: tk.dueDate,
      state:
        tk.status === 'completed'
          ? 'completed'
          : tk.status === 'in_progress'
          ? 'in_progress'
          : 'not_started',
    }));

    const empTaskCompleted = taskItems.filter((i) => i.state === 'completed').length;
    const empTaskInProgress = taskItems.filter((i) => i.state === 'in_progress').length;
    const empTaskNotStarted = taskItems.filter((i) => i.state === 'not_started').length;

    return {
      _id: emp._id,
      fullName: emp.fullName,
      email: emp.email,
      department: emp.department || 'Unassigned',
      designation: emp.designation || emp.role,
      role: emp.role,
      status: emp.status,
      profileImage: emp.profileImage || '',
      profileCompletion: emp.profileCompletion ?? 0,
      monthlyBudgetAllocation: emp.monthlyBudgetAllocation ?? 85000,
      attendanceSummary: {
        month: att.month || 'Current Month',
        workingDays: wDays,
        presentDays: pDays,
        absentDays: aDays,
        leaveDays: lDays,
        lateMarks: lMarks,
        avgCheckInTime: att.avgCheckInTime || '09:10 AM',
        attendancePct,
        onTimePct,
      },
      targetSummary: {
        total: targetItems.length,
        completed: empTargetCompleted,
        inProgress: empTargetInProgress,
        notStarted: empTargetNotStarted,
        overallPct: empTargetOverallPct,
        items: targetItems,
      },
      taskSummary: {
        total: taskItems.length,
        completed: empTaskCompleted,
        inProgress: empTaskInProgress,
        notStarted: empTaskNotStarted,
        items: taskItems,
      },
    };
  });

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
      attendanceOverview,
      progressBreakdown,
      budgetAllocation,
      employeeAnalytics,
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
