import { Link } from 'react-router-dom';
import { FiEdit2, FiEye, FiPower, FiTrash2 } from 'react-icons/fi';
import { UserAvatar } from '../common/UserAvatar';
import { RoleBadge, StatusBadge } from '../common/StatusBadge';
import { ProfileCompletionBar } from '../common/ProfileCompletionBar';
import { Spinner } from '../loaders/Spinner';
import { formatDate } from '../../utils/formatters';

export const UserTable = ({
  users,
  currentUser,
  actionLoadingId,
  onQuickView,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="overflow-x-auto bg-white rounded-t-xl border border-b-0 border-slate-200">
      <table className="min-w-full divide-y divide-slate-200 text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Employee
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Department &amp; Title
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Role
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Status
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Completion
            </th>
            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
              Joined
            </th>
            <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100 bg-white">
          {users.map((user) => {
            const isSelf = currentUser?._id === user._id;
            const hrBlockedOnAdmin = currentUser?.role === 'hr' && user.role === 'admin';
            const isRowBusy = actionLoadingId === user._id;

            return (
              <tr
                key={user._id}
                className={`hover:bg-slate-50/80 transition-colors ${
                  isRowBusy ? 'opacity-60' : ''
                }`}
              >
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <UserAvatar user={user} size="md" />
                    <div>
                      <Link
                        to={`/users/${user._id}`}
                        className="text-sm font-semibold text-slate-900 hover:text-brand-600"
                      >
                        {user.fullName}
                      </Link>
                      <p className="text-xs text-slate-500">{user.email}</p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <p className="text-sm font-medium text-slate-800">
                    {user.department || 'Unassigned'}
                  </p>
                  <p className="text-xs text-slate-500">{user.designation || '—'}</p>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <RoleBadge role={user.role} />
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <StatusBadge status={user.status} />
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <ProfileCompletionBar percentage={user.profileCompletion} compact />
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-xs text-slate-600">
                  {formatDate(user.joiningDate)}
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-right">
                  {isRowBusy ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 pr-2">
                      <Spinner size="xs" />
                      Updating...
                    </span>
                  ) : (
                    <div className="inline-flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onQuickView(user)}
                        title="Quick preview"
                        className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50"
                      >
                        <FiEye className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled={hrBlockedOnAdmin}
                        onClick={() => onEdit(user)}
                        title={hrBlockedOnAdmin ? 'HR cannot edit Admin accounts' : 'Edit profile'}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FiEdit2 className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        disabled={isSelf || hrBlockedOnAdmin}
                        onClick={() => onToggleStatus(user)}
                        title={
                          isSelf
                            ? 'Cannot deactivate your own account'
                            : user.status === 'active'
                            ? 'Deactivate user'
                            : 'Activate user'
                        }
                        className={`p-1.5 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed ${
                          user.status === 'active'
                            ? 'text-amber-600 hover:bg-amber-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        <FiPower className="h-4 w-4" />
                      </button>

                      {isAdmin && (
                        <button
                          type="button"
                          disabled={isSelf}
                          onClick={() => onDelete(user)}
                          title={isSelf ? 'Cannot delete your own account' : 'Delete user'}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
