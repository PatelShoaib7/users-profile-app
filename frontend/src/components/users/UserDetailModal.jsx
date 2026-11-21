import { Link } from 'react-router-dom';
import { FiExternalLink, FiMail, FiPhone, FiX } from 'react-icons/fi';
import { UserAvatar } from '../common/UserAvatar';
import { RoleBadge, StatusBadge } from '../common/StatusBadge';
import { ProfileCompletionBar } from '../common/ProfileCompletionBar';
import { formatDate } from '../../utils/formatters';

export const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  const missingFields = user.missingFields || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-base font-semibold">Profile Summary</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" />
            <div>
              <h4 className="text-lg font-bold text-slate-900">{user.fullName}</h4>
              <p className="text-sm text-slate-600">
                {user.designation || 'No designation'} • {user.department || 'Unassigned'}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <ProfileCompletionBar percentage={user.profileCompletion} />
            {missingFields.length > 0 && (
              <p className="text-xs text-amber-700">
                <span className="font-semibold">Missing info:</span> {missingFields.join(', ')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-700">
              <FiMail className="text-slate-400 shrink-0" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <FiPhone className="text-slate-400 shrink-0" />
              <span>{user.phone || 'Not provided'}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Bio</p>
            <p className="mt-1 text-sm text-slate-700">
              {user.bio || 'No bio added yet.'}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Skills &amp; Joined Date
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Joined: <span className="font-medium text-slate-700">{formatDate(user.joiningDate)}</span>
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {user.skills?.length > 0 ? (
                user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-700"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <span className="text-xs text-slate-400">No skills listed</span>
              )}
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-white"
          >
            Close
          </button>
          <Link
            to={`/users/${user._id}`}
            onClick={onClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700"
          >
            Open Full Profile
            <FiExternalLink className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
