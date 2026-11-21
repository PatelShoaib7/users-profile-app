import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiCheckCircle,
  FiRefreshCw,
  FiTrendingUp,
  FiUserCheck,
  FiUsers,
  FiUserX,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchDashboardStats } from '../store/slices/dashboardSlice';
import { DashboardSkeleton } from '../components/loaders/Skeletons';
import { UserAvatar } from '../components/common/UserAvatar';
import { StatusBadge } from '../components/common/StatusBadge';
import { ProfileCompletionBar } from '../components/common/ProfileCompletionBar';
import { ACTIVITY_ACTION_META } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/formatters';

export const DashboardPage = () => {
  const dispatch = useAppDispatch();
  const { stats, loading, refreshing, error } = useAppSelector((state) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardStats());
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
    departmentDistribution,
    roleDistribution,
    recentlyAddedUsers,
    recentlyUpdatedProfiles,
    recentActivities,
  } = stats;

  const kpiCards = [
    {
      label: 'Total Employees',
      value: summary.totalUsers,
      sub: `${summary.completeProfiles} profiles 100% complete`,
      icon: FiUsers,
      iconStyle: 'bg-brand-50 text-brand-600',
    },
    {
      label: 'Active Accounts',
      value: summary.activeUsers,
      sub:
        summary.totalUsers > 0
          ? `${Math.round((summary.activeUsers / summary.totalUsers) * 100)}% active workforce`
          : '0% active',
      icon: FiUserCheck,
      iconStyle: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Inactive Accounts',
      value: summary.inactiveUsers,
      sub: 'Offboarded or suspended',
      icon: FiUserX,
      iconStyle: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Avg. Profile Completion',
      value: `${summary.averageProfileCompletion}%`,
      sub: 'Across all 10 profile fields',
      icon: FiTrendingUp,
      iconStyle: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Organizational Insights</h2>
          <p className="text-sm text-slate-500">
            Real-time overview of workforce directory health, department headcount, and recent updates.
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
            Manage Directory
            <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpiCards.map(({ label, value, sub, icon: Icon, iconStyle }) => (
          <div
            key={label}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {label}
              </p>
              <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
              <p className="mt-1 text-xs text-slate-500">{sub}</p>
            </div>
            <div className={`p-3 rounded-xl ${iconStyle}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* Department Distribution & Role Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                Department-wise User Distribution
              </h3>
              <p className="text-xs text-slate-500">
                Headcount and active ratio aggregated by department
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {departmentDistribution.map((dept) => (
              <div key={dept.department}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-800">{dept.department}</span>
                  <span className="text-xs text-slate-500">
                    <strong className="text-slate-900">{dept.count}</strong> users ({dept.activeCount}{' '}
                    active • {dept.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-600 rounded-full transition-all duration-300"
                    style={{ width: `${Math.max(4, dept.percentage)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Access Roles Summary</h3>
            <p className="text-xs text-slate-500 mb-4">
              Distribution of platform roles across the company
            </p>

            <div className="space-y-3">
              {roleDistribution.map((item) => (
                <div
                  key={item.role}
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-50 border border-slate-100"
                >
                  <span className="text-sm font-medium capitalize text-slate-700">
                    {item.role}
                  </span>
                  <span className="text-sm font-bold text-slate-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
            <FiCheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
            <p className="text-xs text-emerald-800">
              <strong>{summary.completeProfiles}</strong> of <strong>{summary.totalUsers}</strong>{' '}
              profiles have 100% completion across contact, bio, skills, and avatar fields.
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
    </div>
  );
};
