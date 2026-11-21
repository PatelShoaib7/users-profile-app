import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  FiAlertCircle,
  FiArrowLeft,
  FiCalendar,
  FiCamera,
  FiCheckCircle,
  FiEdit2,
  FiMail,
  FiPhone,
  FiPower,
  FiTrash2,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  clearUserError,
  deleteUser,
  fetchUserById,
  toggleUserStatus,
  updateUser,
  uploadAvatar,
} from '../store/slices/userSlice';
import {
  closeConfirmDialog,
  closeUserFormModal,
  openConfirmDialog,
  openUserFormModal,
} from '../store/slices/uiSlice';
import { ProfileSkeleton } from '../components/loaders/Skeletons';
import { Spinner } from '../components/loaders/Spinner';
import { UserAvatar } from '../components/common/UserAvatar';
import { RoleBadge, StatusBadge } from '../components/common/StatusBadge';
import { ProfileCompletionBar } from '../components/common/ProfileCompletionBar';
import { UserFormModal } from '../components/users/UserFormModal';
import { UserAssignmentsPanel } from '../components/users/UserAssignmentsPanel';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { ACTIVITY_ACTION_META } from '../utils/constants';
import { formatDate, formatDateTime } from '../utils/formatters';

export const UserProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user: currentUser } = useAppSelector((state) => state.auth);
  const {
    selectedUser: user,
    selectedCompletion,
    selectedActivities,
    detailLoading,
    submitting,
    avatarUploading,
    actionLoadingId,
    error,
  } = useAppSelector((state) => state.users);
  const { userFormModal, confirmDialog } = useAppSelector((state) => state.ui);

  useEffect(() => {
    dispatch(fetchUserById(id));
    return () => {
      dispatch(clearUserError());
      dispatch(closeUserFormModal());
      dispatch(closeConfirmDialog());
    };
  }, [id, dispatch]);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const res = await dispatch(uploadAvatar({ id: user._id, file }));
    if (uploadAvatar.fulfilled.match(res)) {
      dispatch(fetchUserById(user._id));
    }
  };

  const handleUpdateSubmit = async (formData) => {
    if (!user) return;
    const res = await dispatch(updateUser({ id: user._id, payload: formData }));
    if (updateUser.fulfilled.match(res)) {
      dispatch(closeUserFormModal());
      dispatch(fetchUserById(user._id));
    }
  };

  const handleConfirm = async () => {
    if (!user) return;
    if (confirmDialog.actionType === 'delete') {
      const res = await dispatch(deleteUser(user._id));
      if (deleteUser.fulfilled.match(res)) {
        dispatch(closeConfirmDialog());
        navigate('/users', { replace: true });
      }
    } else if (confirmDialog.actionType === 'deactivate') {
      await dispatch(toggleUserStatus({ id: user._id, status: 'inactive' }));
      dispatch(closeConfirmDialog());
      dispatch(fetchUserById(user._id));
    }
  };

  if (detailLoading && (!user || user._id !== id)) {
    return <ProfileSkeleton />;
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:underline"
        >
          <FiArrowLeft /> Back to Directory
        </Link>
        <div className="p-5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error || 'User profile could not be found.'}
        </div>
      </div>
    );
  }

  const isAdmin = currentUser?.role === 'admin';
  const isSelf = currentUser?._id === user._id;
  const hrBlockedOnAdmin = currentUser?.role === 'hr' && user.role === 'admin';
  const missingFields = selectedCompletion?.missingFields || user.missingFields || [];
  const isActionBusy = actionLoadingId === user._id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          to="/users"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <FiArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>

      {error && !userFormModal.open && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative self-start">
              <UserAvatar key={user.profileImage} user={user} size="xl" />

              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-slate-900/50 flex items-center justify-center text-white">
                  <Spinner size="sm" />
                </div>
              )}

              {!hrBlockedOnAdmin && (
                <label
                  title="Upload new profile image"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-brand-600 text-white shadow-md hover:bg-brand-700 cursor-pointer"
                >
                  <FiCamera className="h-3.5 w-3.5" />
                  <input
                    type="file"
                    disabled={avatarUploading}
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-2xl font-bold text-slate-900">{user.fullName}</h2>
                <RoleBadge role={user.role} />
                <StatusBadge status={user.status} />
              </div>
              <p className="mt-1 text-sm font-medium text-slate-600">
                {user.designation || 'No Designation Assigned'} •{' '}
                <span className="text-slate-800">{user.department || 'Unassigned Department'}</span>
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <FiMail className="h-3.5 w-3.5 text-slate-400" />
                  {user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiPhone className="h-3.5 w-3.5 text-slate-400" />
                  {user.phone || 'Phone not added'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                  Joined {formatDate(user.joiningDate)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start md:self-center">
            {!hrBlockedOnAdmin && (
              <button
                type="button"
                onClick={() => dispatch(openUserFormModal({ mode: 'edit', user }))}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700"
              >
                <FiEdit2 className="h-4 w-4" />
                Edit Profile
              </button>
            )}

            {!isSelf && !hrBlockedOnAdmin && (
              <button
                type="button"
                disabled={isActionBusy}
                onClick={() => {
                  if (user.status === 'active') {
                    dispatch(openConfirmDialog({ actionType: 'deactivate', user }));
                  } else {
                    dispatch(toggleUserStatus({ id: user._id, status: 'active' })).then(() =>
                      dispatch(fetchUserById(user._id))
                    );
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-60"
              >
                {isActionBusy ? <Spinner size="xs" /> : <FiPower className="h-4 w-4" />}
                {user.status === 'active' ? 'Deactivate' : 'Activate'}
              </button>
            )}

            {isAdmin && !isSelf && (
              <button
                type="button"
                disabled={isActionBusy}
                onClick={() => dispatch(openConfirmDialog({ actionType: 'delete', user }))}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-medium rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-60"
              >
                <FiTrash2 className="h-4 w-4" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
            <div>
              <h3 className="text-base font-semibold text-slate-900">About &amp; Bio</h3>
              <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                {user.bio || 'No biography has been written for this user profile yet.'}
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Skills &amp; Competencies</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {user.skills?.length > 0 ? (
                  user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-100"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">No skills added yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Tasks, Trainings & Monthly Targets Assignment Panel */}
          <UserAssignmentsPanel user={user} />

          {/* User Activity History */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h3 className="text-base font-semibold text-slate-900">Profile Activity History</h3>
            </div>
            {selectedActivities.length === 0 ? (
              <p className="p-6 text-sm text-slate-500">
                No administrative activity recorded for this profile yet.
              </p>
            ) : (
              <div className="divide-y divide-slate-100">
                {selectedActivities.map((act) => {
                  const meta = ACTIVITY_ACTION_META[act.action] || {
                    label: act.action,
                    badgeClass: 'bg-slate-100 text-slate-700',
                  };
                  return (
                    <div
                      key={act._id}
                      className="px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.badgeClass}`}
                        >
                          {meta.label}
                        </span>
                        <span className="text-slate-700">{act.details}</span>
                      </div>
                      <span className="text-xs text-slate-400 shrink-0">
                        by {act.performedBy?.fullName || 'Admin'} • {formatDateTime(act.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion & Metadata Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
            <h3 className="text-base font-semibold text-slate-900">Profile Completeness</h3>
            <ProfileCompletionBar percentage={user.profileCompletion} />

            {missingFields.length === 0 ? (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5 text-xs text-emerald-800">
                <FiCheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                <span>All 10 profile fields are complete!</span>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-800">
                  <FiAlertCircle className="h-4 w-4 text-amber-600" />
                  Missing Information ({missingFields.length})
                </div>
                <ul className="list-disc list-inside text-xs text-amber-800 space-y-1">
                  {missingFields.map((field) => (
                    <li key={field}>{field}</li>
                  ))}
                </ul>
                {!hrBlockedOnAdmin && (
                  <button
                    type="button"
                    onClick={() => dispatch(openUserFormModal({ mode: 'edit', user }))}
                    className="mt-2 text-xs font-semibold text-brand-700 hover:underline"
                  >
                    + Complete missing fields
                  </button>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Profile Created</span>
                <span className="font-medium text-slate-700">{formatDateTime(user.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Last Updated</span>
                <span className="font-medium text-slate-700">{formatDateTime(user.updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <UserFormModal
        open={userFormModal.open}
        mode="edit"
        initialUser={user}
        currentUserRole={currentUser?.role}
        submitting={submitting}
        serverError={error}
        onClose={() => dispatch(closeUserFormModal())}
        onSubmit={handleUpdateSubmit}
      />

      <ConfirmDialog
        open={confirmDialog.open}
        title={
          confirmDialog.actionType === 'delete'
            ? `Delete ${user.fullName}?`
            : `Deactivate ${user.fullName}?`
        }
        description={
          confirmDialog.actionType === 'delete'
            ? 'This permanently deletes the employee profile and logs the deletion event.'
            : 'This suspends account access for this user.'
        }
        confirmLabel={confirmDialog.actionType === 'delete' ? 'Delete Permanently' : 'Deactivate'}
        variant={confirmDialog.actionType === 'delete' ? 'danger' : 'warning'}
        loading={isActionBusy}
        onConfirm={handleConfirm}
        onCancel={() => dispatch(closeConfirmDialog())}
      />
    </div>
  );
};
