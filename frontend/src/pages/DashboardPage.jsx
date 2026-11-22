import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiArrowRight,
  FiCheckCircle,
  FiClock,
  FiPieChart,
  FiRefreshCw,
  FiTarget,
  FiUserCheck,
  FiUsers,
  FiUserX,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  closeDashboardDrilldown,
  fetchDashboardStats,
  openDashboardDrilldown,
} from '../store/slices/dashboardSlice';
import { DashboardSkeleton } from '../components/loaders/Skeletons';
import { DashboardDrilldownModal } from '../components/dashboard/DashboardDrilldownModal';
import { CircularProgressRing } from '../components/common/CircularProgressRing';
import { UserAvatar } from '../components/common/UserAvatar';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProfileCompletionBar } from '../components/common/ProfileCompletionBar';
import { ACTIVITY_ACTION_META } from '../utils/constants';
import {
  formatCompactINR,
  formatDate,
  formatDateTime,
  formatINR,
} from '../utils/formatters';

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, refreshing, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
    return () => {
      dispatch(closeDashboardDrilldown());
    };
  }, [dispatch]);

  if (loading && !stats) {
    return <DashboardSkeleton />;
  }

  if (error && !stats) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between text-sm text-rose-700">
        <span>{error}</span>
        <button
          type="button"
          onClick={() => dispatch(fetchDashboardStats())}
          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!stats) return null;

  const {
    summary,
    attendanceOverview,
    progressBreakdown,
    budgetAllocation,
    departmentDistribution,
    recentlyAddedUsers,
    recentlyUpdatedProfiles,
    recentActivities,
  } = stats;

  const att = attendanceOverview || {
    overallAttendanceRate: 0,
    onTimeRate: 100,
    totalWorkingDays: 0,
    totalPresentDays: 0,
    totalAbsentDays: 0,
    totalLeaveDays: 0,
    totalLateMarks: 0,
    employeesWithLateMarks: 0,
    lateMarkWatchlist: [],
  };

  const targetStats = progressBreakdown?.targets || {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    completedPct: 0,
    inProgressPct: 0,
    notStartedPct: 0,
  };

  const taskStats = progressBreakdown?.tasks || {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    completedPct: 0,
    inProgressPct: 0,
    notStartedPct: 0,
  };

  const budget = budgetAllocation || {
    totalCompanyBudget: 0,
    totalUtilizedBudget: 0,
    remainingBudget: 0,
    utilizationPct: 0,
    byDepartment: [],
    byCategory: [],
  };

  const kpiCards = [
    {
      label: 'Total Employees',
      value: summary.totalUsers,
      sub: `${summary.activeUsers} active • ${summary.inactiveUsers} inactive`,
      hint: 'View employee list →',
      icon: FiUsers,
      iconStyle: 'bg-brand-50 text-brand-600',
      onClick: () =>
        dispatch(openDashboardDrilldown({ section: 'employees', filter: 'all', department: '' })),
    },
    {
      label: 'Workforce Attendance',
      value: `${att.overallAttendanceRate}%`,
      sub: `${att.totalLateMarks} total late marks this month`,
      hint: 'View attendance by user →',
      icon: FiUserCheck,
      iconStyle: 'bg-emerald-50 text-emerald-600',
      onClick: () =>
        dispatch(openDashboardDrilldown({ section: 'attendance', filter: 'all', department: '' })),
    },
    {
      label: 'Targets Completed',
      value: `${targetStats.completed} / ${targetStats.total}`,
      sub: `${targetStats.inProgress} in progress • ${targetStats.notStarted} not started`,
      hint: 'View targets by user →',
      icon: FiTarget,
      iconStyle: 'bg-indigo-50 text-indigo-600',
      onClick: () =>
        dispatch(
          openDashboardDrilldown({ section: 'targets', filter: 'by_employee', department: '' })
        ),
    },
    {
      label: 'Monthly Budget Allocated',
      value: formatCompactINR(budget.totalUtilizedBudget),
      sub: `of ${formatCompactINR(budget.totalCompanyBudget)} total cap (${budget.utilizationPct}%)`,
      hint: 'View budget by user →',
      icon: FiPieChart,
      iconStyle: 'bg-amber-50 text-amber-600',
      onClick: () =>
        dispatch(openDashboardDrilldown({ section: 'budget', filter: 'all', department: '' })),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Executive Workforce, Targets &amp; Budget Insights
          </h2>
          <p className="text-sm text-slate-500">
            Click any metric card or status box below to inspect the exact employee-wise data and breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start">
          <button
            type="button"
            disabled={refreshing}
            onClick={() => dispatch(fetchDashboardStats())}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-300 bg-white text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-60"
          >
            <FiRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin text-brand-600' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <Link
            to="/users"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
          >
            Employee Directory
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Top 4 Clickable Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, sub, hint, icon: Icon, iconStyle, onClick }) => (
          <button
            key={label}
            type="button"
            onClick={onClick}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-brand-400 hover:shadow-md transition-all text-left flex items-start justify-between group cursor-pointer"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
              <p className="mt-2 text-[11px] font-semibold text-brand-600 group-hover:underline">
                {hint}
              </p>
            </div>
            <div className={`p-3 rounded-xl ${iconStyle}`}>
              <Icon className="h-5 w-5" />
            </div>
          </button>
        ))}
      </div>

      {/* PILLAR 1 & PILLAR 2 SIDE BY SIDE */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* PILLAR 1: Attendance & Late Marks Analytics */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                1. Attendance &amp; Punctuality
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">
                Workforce Attendance &amp; Late Marks
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                dispatch(
                  openDashboardDrilldown({ section: 'attendance', filter: 'late', department: '' })
                )
              }
              className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 cursor-pointer"
            >
              {att.totalLateMarks} Late Marks →
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-xl bg-slate-50 border border-slate-100">
            <button
              type="button"
              onClick={() =>
                dispatch(
                  openDashboardDrilldown({ section: 'attendance', filter: 'all', department: '' })
                )
              }
              title="Click to inspect all employees' attendance"
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <CircularProgressRing
                percentage={att.overallAttendanceRate}
                size={100}
                strokeWidth={10}
                subtitle="Present"
              />
            </button>

            <div className="grid grid-cols-2 gap-3 flex-1 w-full text-xs">
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({ section: 'attendance', filter: 'all', department: '' })
                  )
                }
                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-left transition-colors cursor-pointer"
              >
                <span className="text-slate-500 block">Present Man-Days</span>
                <p className="text-base font-bold text-emerald-700 mt-0.5">
                  {att.totalPresentDays}{' '}
                  <span className="text-xs font-normal text-slate-400">
                    / {att.totalWorkingDays}
                  </span>
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'attendance',
                      filter: 'ontime',
                      department: '',
                    })
                  )
                }
                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 text-left transition-colors cursor-pointer"
              >
                <span className="text-slate-500 block">On-Time Check-Ins</span>
                <p className="text-base font-bold text-slate-900 mt-0.5">{att.onTimeRate}%</p>
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'attendance',
                      filter: 'leave',
                      department: '',
                    })
                  )
                }
                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 text-left transition-colors cursor-pointer"
              >
                <span className="text-slate-500 block">Leaves Taken</span>
                <p className="text-base font-bold text-indigo-700 mt-0.5">
                  {att.totalLeaveDays} days
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'attendance',
                      filter: 'absent',
                      department: '',
                    })
                  )
                }
                className="p-3 rounded-lg bg-white border border-slate-200 hover:border-rose-400 text-left transition-colors cursor-pointer"
              >
                <span className="text-slate-500 block">Unplanned Absents</span>
                <p className="text-base font-bold text-rose-700 mt-0.5">
                  {att.totalAbsentDays} days
                </p>
              </button>
            </div>
          </div>

          {/* Late Marks Watchlist */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FiClock className="h-3.5 w-3.5 text-rose-600" />
                Employees With Late Marks
              </p>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({ section: 'attendance', filter: 'all', department: '' })
                  )
                }
                className="text-xs font-semibold text-brand-600 hover:underline"
              >
                See all attendance →
              </button>
            </div>

            {att.lateMarkWatchlist.length === 0 ? (
              <p className="text-xs text-slate-500 py-3">Zero late marks recorded this month.</p>
            ) : (
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                {att.lateMarkWatchlist.map((emp) => (
                  <Link
                    key={emp._id}
                    to={`/users/${emp._id}`}
                    className="px-4 py-2.5 flex items-center justify-between gap-3 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <UserAvatar user={emp} size="sm" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {emp.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          {emp.department} • {emp.presentDays}/{emp.workingDays} days ({emp.attendancePct}%)
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                        emp.lateMarks >= 3
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {emp.lateMarks >= 3 && <FiAlertTriangle className="h-3 w-3" />}
                      {emp.lateMarks} Late {emp.lateMarks === 1 ? 'Mark' : 'Marks'}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* PILLAR 2: Target Completion, In Progress & Not Started Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">
                  2. Execution &amp; Goal Tracking
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  Target Status: Completed • In Progress • Not Started
                </h3>
                <p className="text-xs text-slate-500">
                  Click any status box below to see which employees own those targets
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'targets',
                      filter: 'by_employee',
                      department: '',
                    })
                  )
                }
                className="text-xs font-semibold text-indigo-700 hover:underline shrink-0"
              >
                Per-Employee % →
              </button>
            </div>

            {/* 3 Clickable Status Tiles for Monthly Targets */}
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'targets',
                      filter: 'completed',
                      department: '',
                    })
                  )
                }
                className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 hover:border-emerald-500 hover:shadow-sm transition-all text-left cursor-pointer"
              >
                <span className="text-xs font-bold text-emerald-800 block">Completed</span>
                <p className="text-2xl font-extrabold text-emerald-900 mt-1">
                  {targetStats.completed}
                </p>
                <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                  {targetStats.completedPct}% • View users →
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'targets',
                      filter: 'in_progress',
                      department: '',
                    })
                  )
                }
                className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 hover:border-indigo-500 hover:shadow-sm transition-all text-left cursor-pointer"
              >
                <span className="text-xs font-bold text-indigo-800 block">In Progress</span>
                <p className="text-2xl font-extrabold text-indigo-900 mt-1">
                  {targetStats.inProgress}
                </p>
                <p className="text-[11px] font-semibold text-indigo-700 mt-0.5">
                  {targetStats.inProgressPct}% • View users →
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'targets',
                      filter: 'not_started',
                      department: '',
                    })
                  )
                }
                className="p-4 rounded-xl bg-amber-50 border border-amber-200 hover:border-amber-500 hover:shadow-sm transition-all text-left cursor-pointer"
              >
                <span className="text-xs font-bold text-amber-800 block">Not Started</span>
                <p className="text-2xl font-extrabold text-amber-900 mt-1">
                  {targetStats.notStarted}
                </p>
                <p className="text-[11px] font-semibold text-amber-700 mt-0.5">
                  {targetStats.notStartedPct}% • View users →
                </p>
              </button>
            </div>

            {/* Stacked Multi-Segment Bar */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">
                  Monthly Targets Distribution ({targetStats.total} Total Goals)
                </span>
                <span className="font-bold text-emerald-700">
                  {targetStats.completedPct}% Achieved
                </span>
              </div>
              <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500"
                  style={{ width: `${targetStats.completedPct}%` }}
                />
                <div
                  className="bg-indigo-500 h-full transition-all duration-500"
                  style={{ width: `${targetStats.inProgressPct}%` }}
                />
                <div
                  className="bg-amber-400 h-full transition-all duration-500"
                  style={{ width: `${targetStats.notStartedPct}%` }}
                />
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-0.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Completed
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> In Progress
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Not Started
                </span>
              </div>
            </div>
          </div>

          {/* Clickable Sprint Tasks Breakdown Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">
                Assigned Sprint Tasks ({taskStats.total} Total)
              </span>
              <button
                type="button"
                onClick={() =>
                  dispatch(openDashboardDrilldown({ section: 'tasks', filter: 'all', department: '' }))
                }
                className="font-semibold text-brand-600 hover:underline"
              >
                Inspect all tasks →
              </button>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${taskStats.completedPct}%` }}
              />
              <div
                className="bg-indigo-500 h-full"
                style={{ width: `${taskStats.inProgressPct}%` }}
              />
              <div
                className="bg-amber-400 h-full"
                style={{ width: `${taskStats.notStartedPct}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs pt-1">
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({ section: 'tasks', filter: 'completed', department: '' })
                  )
                }
                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-emerald-400 cursor-pointer"
              >
                <span className="block font-bold text-emerald-700">{taskStats.completed}</span>
                <span className="text-[11px] text-slate-500">Completed</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'tasks',
                      filter: 'in_progress',
                      department: '',
                    })
                  )
                }
                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 cursor-pointer"
              >
                <span className="block font-bold text-indigo-700">{taskStats.inProgress}</span>
                <span className="text-[11px] text-slate-500">In Progress</span>
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'tasks',
                      filter: 'not_started',
                      department: '',
                    })
                  )
                }
                className="p-2 rounded-lg bg-white border border-slate-200 hover:border-amber-400 cursor-pointer"
              >
                <span className="block font-bold text-amber-700">{taskStats.notStarted}</span>
                <span className="text-[11px] text-slate-500">Not Started</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PILLAR 3: Budget Allocation — Click Any Department Row to See Per-Employee Spend */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
              3. Financial &amp; Resource Allocation
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Monthly Budget Allocation — Department &amp; Category Breakdown
            </h3>
            <p className="text-xs text-slate-500">
              Click any department row below to view individual employee seat budgets in that department
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            <button
              type="button"
              onClick={() =>
                dispatch(openDashboardDrilldown({ section: 'budget', filter: 'all', department: '' }))
              }
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-left cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-slate-400 block">
                Total Monthly Cap
              </span>
              <span className="text-base font-extrabold">
                {formatCompactINR(budget.totalCompanyBudget)}
              </span>
            </button>
            <button
              type="button"
              onClick={() =>
                dispatch(openDashboardDrilldown({ section: 'budget', filter: 'all', department: '' }))
              }
              className="px-4 py-2.5 rounded-xl bg-brand-50 border border-brand-200 hover:border-brand-400 text-left cursor-pointer"
            >
              <span className="text-[10px] uppercase tracking-wider text-brand-700 font-semibold block">
                Active Allocated
              </span>
              <span className="text-base font-extrabold text-brand-900">
                {formatCompactINR(budget.totalUtilizedBudget)}
              </span>
            </button>
            <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-[10px] uppercase tracking-wider text-emerald-700 font-semibold block">
                Available Reserve
              </span>
              <span className="text-base font-extrabold text-emerald-900">
                {formatCompactINR(budget.remainingBudget)}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Clickable Department-wise Budget Allocation Rows */}
          <div className="lg:col-span-7 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Department-wise Budget Allocation (Click Department to Inspect Users)
            </h4>

            <div className="space-y-2.5">
              {budget.byDepartment.map((dept) => (
                <button
                  key={dept.department}
                  type="button"
                  onClick={() =>
                    dispatch(
                      openDashboardDrilldown({
                        section: 'budget',
                        filter: 'all',
                        department: dept.department,
                      })
                    )
                  }
                  className="w-full p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-colors text-left space-y-1.5 cursor-pointer"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">{dept.department}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-medium">
                        {dept.headcount} active →
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">
                        {formatINR(dept.utilizedBudget)}
                      </span>{' '}
                      <span className="text-slate-500">
                        / {formatINR(dept.allocatedBudget)} ({dept.shareOfCompanyPct}% of org budget)
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        dept.utilizationPct > 90 ? 'bg-amber-500' : 'bg-brand-600'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(6, dept.utilizationPct))}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Expense Category Split */}
          <div className="lg:col-span-5 space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Where Active Budget Goes (By Category)
            </h4>

            <div className="space-y-3">
              {budget.byCategory.map((cat) => (
                <div
                  key={cat.category}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900">{cat.category}</span>
                    <span className="text-xs font-extrabold text-brand-700">
                      {formatINR(cat.amount)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-600 rounded-full"
                      style={{ width: `${cat.percentage}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">{cat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Department Headcount + Directory Completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">
            Department-wise Headcount Distribution
          </h3>
          <p className="text-xs text-slate-500 mb-4">
            Click any department below to view its employees, attendance, and target completion
          </p>

          <div className="space-y-2.5">
            {departmentDistribution.map((dept) => (
              <button
                key={dept.department}
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'employees',
                      filter: 'all',
                      department: dept.department,
                    })
                  )
                }
                className="w-full p-2 rounded-lg hover:bg-slate-50 text-left transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium text-slate-800">{dept.department} →</span>
                  <span className="text-xs text-slate-500">
                    <strong className="text-slate-900">{dept.count}</strong> users ({dept.activeCount}{' '}
                    active • {dept.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-slate-700 rounded-full"
                    style={{ width: `${Math.max(4, dept.percentage)}%` }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-slate-900">Directory Health</h3>
            <p className="text-xs text-slate-500">
              Profile completeness &amp; account status summary
            </p>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600 font-medium">Avg. Profile Completion</span>
                <span className="font-bold text-brand-700">
                  {summary.averageProfileCompletion}%
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-600 rounded-full"
                  style={{ width: `${summary.averageProfileCompletion}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({ section: 'employees', filter: 'active', department: '' })
                  )
                }
                className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 hover:border-emerald-400 text-left cursor-pointer"
              >
                <span className="text-emerald-700 font-medium block">Active Users →</span>
                <p className="text-lg font-bold text-emerald-900 mt-0.5">{summary.activeUsers}</p>
              </button>
              <button
                type="button"
                onClick={() =>
                  dispatch(
                    openDashboardDrilldown({
                      section: 'employees',
                      filter: 'inactive',
                      department: '',
                    })
                  )
                }
                className="p-3 rounded-lg bg-slate-100 border border-slate-200 hover:border-slate-400 text-left cursor-pointer"
              >
                <span className="text-slate-600 font-medium flex items-center gap-1">
                  <FiUserX className="h-3 w-3" /> Inactive →
                </span>
                <p className="text-lg font-bold text-slate-800 mt-0.5">{summary.inactiveUsers}</p>
              </button>
            </div>
          </div>

          <div className="mt-5 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <FiCheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-800">
              <strong>{summary.completeProfiles}</strong> of <strong>{summary.totalUsers}</strong>{' '}
              employee profiles have 100% completed bio, skills, contact, and avatar fields.
            </p>
          </div>
        </div>
      </div>

      {/* Recently Added & Recently Updated Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Recently Added Users</h3>
            <Link to="/users" className="text-xs font-medium text-brand-600 hover:underline">
              View all
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentlyAddedUsers.map((u) => (
              <div key={u._id} className="px-6 py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={u} size="md" />
                  <div className="min-w-0">
                    <Link
                      to={`/users/${u._id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-brand-600 truncate block"
                    >
                      {u.fullName}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      {u.designation || 'Team Member'} • {u.department || 'Unassigned'}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <StatusBadge status={u.status} />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Added {formatDate(u.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Recently Updated Profiles</h3>
            <Link to="/activities" className="text-xs font-medium text-brand-600 hover:underline">
              Audit trail
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentlyUpdatedProfiles.map((u) => (
              <div key={u._id} className="px-6 py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <UserAvatar user={u} size="md" />
                  <div className="min-w-0">
                    <Link
                      to={`/users/${u._id}`}
                      className="text-sm font-semibold text-slate-900 hover:text-brand-600 truncate block"
                    >
                      {u.fullName}
                    </Link>
                    <p className="text-xs text-slate-500 truncate">
                      Updated {formatDateTime(u.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">
                  <ProfileCompletionBar percentage={u.profileCompletion} compact />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Audit Activity */}
      {recentActivities?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Recent Administrative Activity</h3>
            <Link to="/activities" className="text-xs font-medium text-brand-600 hover:underline">
              Full activity log
            </Link>
          </div>
          <div className="divide-y divide-slate-100">
            {recentActivities.map((log) => {
              const meta = ACTIVITY_ACTION_META[log.action] || {
                label: log.action,
                badgeClass: 'bg-slate-100 text-slate-700',
              };
              const targetName =
                log.targetUser?.fullName || log.targetUserSnapshot?.fullName || 'Unknown User';

              return (
                <div
                  key={log._id}
                  className="px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                    <span className="font-medium text-slate-900">{targetName}</span>
                    {log.details && <span className="text-slate-500">— {log.details}</span>}
                  </div>
                  <div className="text-xs text-slate-400 shrink-0">
                    by {log.performedBy?.fullName || 'Admin'} • {formatDateTime(log.createdAt)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Interactive Employee Drill-Down Modal */}
      <DashboardDrilldownModal />
    </div>
  );
};
