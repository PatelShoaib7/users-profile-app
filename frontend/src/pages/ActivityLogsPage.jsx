import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchActivityLogs,
  setActivityActionFilter,
  setActivityPage,
} from '../store/slices/activitySlice';
import { Pagination } from '../components/common/Pagination';
import { EmptyState } from '../components/common/StateFeedback';
import { TableSkeleton } from '../components/loaders/Skeletons';
import { ACTIVITY_ACTION_META } from '../utils/constants';
import { formatDateTime } from '../utils/formatters';

const ACTION_OPTIONS = [
  { value: '', label: 'All Activity Types' },
  { value: 'USER_CREATED', label: 'User Created' },
  { value: 'USER_UPDATED', label: 'User Updated' },
  { value: 'STATUS_CHANGED', label: 'Status Changed' },
  { value: 'USER_DELETED', label: 'User Deleted' },
];

export const ActivityLogsPage = () => {
  const dispatch = useAppDispatch();
  const { logs, page, limit, pagination, actionFilter, loading, error } = useAppSelector(
    (state) => state.activities
  );

  useEffect(() => {
    dispatch(fetchActivityLogs({ page, limit, action: actionFilter }));
  }, [dispatch, page, limit, actionFilter]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Activity Audit Logs</h2>
          <p className="text-sm text-slate-500">
            Chronological trail of user creations, profile updates, status changes, and deletions.
          </p>
        </div>

        <select
          value={actionFilter}
          onChange={(e) => dispatch(setActivityActionFilter(e.target.value))}
          className="px-3.5 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 self-start"
        >
          {ACTION_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={7} columns={5} />
      ) : logs.length === 0 ? (
        <EmptyState
          title="No activity logs found"
          description="Administrative actions such as creating, updating, activating, or deleting users will appear here."
          actionLabel={actionFilter ? 'Show All Actions' : undefined}
          onAction={actionFilter ? () => dispatch(setActivityActionFilter('')) : undefined}
        />
      ) : (
        <div>
          <div className="overflow-x-auto bg-white rounded-t-xl border border-b-0 border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Target User
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Details
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Performed By
                  </th>
                  <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Timestamp
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-sm">
                {logs.map((log) => {
                  const meta = ACTIVITY_ACTION_META[log.action] || {
                    label: log.action,
                    badgeClass: 'bg-slate-100 text-slate-700',
                  };
                  const targetName =
                    log.targetUser?.fullName ||
                    log.targetUserSnapshot?.fullName ||
                    'Deleted User';
                  const targetEmail =
                    log.targetUser?.email || log.targetUserSnapshot?.email || '';

                  return (
                    <tr key={log._id} className="hover:bg-slate-50/70">
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        {log.targetUser?._id ? (
                          <Link
                            to={`/users/${log.targetUser._id}`}
                            className="font-semibold text-slate-900 hover:text-brand-600"
                          >
                            {targetName}
                          </Link>
                        ) : (
                          <span className="font-medium text-slate-700">{targetName}</span>
                        )}
                        {targetEmail && (
                          <p className="text-xs text-slate-500">{targetEmail}</p>
                        )}
                      </td>

                      <td className="px-4 py-3.5 text-slate-600 max-w-md">
                        {log.details || '—'}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-medium text-slate-800">
                          {log.performedBy?.fullName || 'System'}
                        </span>
                        {log.performedBy?.role && (
                          <span className="ml-1.5 text-xs uppercase text-slate-400">
                            ({log.performedBy.role})
                          </span>
                        )}
                      </td>

                      <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-500">
                        {formatDateTime(log.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            pagination={pagination}
            onPageChange={(next) => dispatch(setActivityPage(next))}
          />
        </div>
      )}
    </div>
  );
};
