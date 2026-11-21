import { useEffect } from 'react';
import {
  FiCalendar,
  FiCamera,
  FiCheck,
  FiCircle,
  FiEdit2,
  FiMail,
  FiPhone,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  closeSelfProfileModal,
  fetchMyPortal,
  openSelfProfileModal,
  updateMyProfile,
  uploadMyAvatar,
} from '../../store/slices/portalSlice';
import { ProfileSkeleton } from '../../components/loaders/Skeletons';
import { Spinner } from '../../components/loaders/Spinner';
import { UserAvatar } from '../../components/common/UserAvatar';
import { RoleBadge, StatusBadge } from '../../components/common/StatusBadge';
import { SelfProfileEditModal } from '../../components/portal/SelfProfileEditModal';
import { formatDate } from '../../utils/formatters';

const ALL_PROFILE_FIELDS = [
  'Full Name',
  'Email',
  'Phone Number',
  'Profile Image',
  'Department',
  'Designation',
  'Role',
  'Joining Date',
  'Bio',
  'Skills',
];

export const UserSelfProfilePage = () => {
  const dispatch = useAppDispatch();
  const { profile, completion, editModalOpen, loading, submitting, avatarUploading } =
    useAppSelector((state) => state.portal);

  useEffect(() => {
    if (!profile) {
      dispatch(fetchMyPortal());
    }
  }, [dispatch, profile]);

  if (loading && !profile) {
    return <ProfileSkeleton />;
  }

  if (!profile) return null;

  const missingFields = completion?.missingFields || profile.missingFields || [];

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(uploadMyAvatar(file));
  };

  const handleProfileSave = (payload) => {
    dispatch(updateMyProfile(payload));
  };

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="relative self-start">
              <UserAvatar key={profile.profileImage} user={profile} size="xl" />
              {avatarUploading && (
                <div className="absolute inset-0 rounded-full bg-slate-900/50 flex items-center justify-center text-white">
                  <Spinner size="sm" />
                </div>
              )}
              <label
                title="Upload profile photo"
                className="absolute bottom-0 right-0 p-2 rounded-full bg-teal-600 text-white shadow-md hover:bg-teal-700 cursor-pointer"
              >
                <FiCamera className="h-3.5 w-3.5" />
                <input
                  type="file"
                  disabled={avatarUploading}
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
            </div>

            <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                  Step 4 of 4 • Personal Profile
                </span>
                <div className="flex flex-wrap items-center gap-2.5 mt-0.5">
                  <h1 className="text-2xl font-bold text-slate-900">{profile.fullName}</h1>
                  <RoleBadge role={profile.role} />
                  <StatusBadge status={profile.status} />
                </div>
                <p className="mt-1 text-sm font-medium text-slate-600">
                  {profile.designation || 'Team Member'} •{' '}
                  <span className="text-slate-900">{profile.department || 'Unassigned'}</span>
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span className="inline-flex items-center gap-1.5">
                    <FiMail className="h-3.5 w-3.5 text-slate-400" />
                    {profile.email}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FiPhone className="h-3.5 w-3.5 text-slate-400" />
                    {profile.phone || 'Phone not added'}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                    Joined {formatDate(profile.joiningDate)}
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => dispatch(openSelfProfileModal())}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-sm self-start md:self-center"
            >
              <FiEdit2 className="h-4 w-4" />
              Edit My Profile
            </button>
          </div>
        </div>

        {/* Main Details + Visual 10-Item Checklist */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900">About Me</h2>
                <p className="mt-2 text-sm text-slate-700 leading-relaxed">
                  {profile.bio ||
                    'You have not added a bio yet. Click "Edit My Profile" to complete this section.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <h2 className="text-base font-bold text-slate-900">My Skills</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {profile.skills?.length > 0 ? (
                    profile.skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-800 border border-teal-200"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-slate-400">No skills added yet.</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">Department (HR Managed)</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {profile.department || 'Unassigned'}
                  </p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs text-slate-500">Designation (HR Managed)</p>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {profile.designation || 'Not set'}
                  </p>
                </div>
              </div>
            </div>

              {/* Easy-to-Understand 10-Point Profile Checklist */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 self-start">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Profile Checklist</h2>
                  <span className="text-sm font-extrabold text-teal-700">
                    {profile.profileCompletion}%
                  </span>
                </div>

          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                profile.profileCompletion === 100 ? 'bg-emerald-500' : 'bg-teal-600'
              }`}
              style={{ width: `${profile.profileCompletion}%` }}
            />
          </div>

          <div className="space-y-2 pt-1">
            {ALL_PROFILE_FIELDS.map((fieldLabel) => {
              const isMissing = missingFields.includes(fieldLabel);
              return (
                <div
                  key={fieldLabel}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium ${
                    isMissing
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-slate-50 text-slate-700'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {isMissing ? (
                      <FiCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                    ) : (
                      <FiCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    )}
                    {fieldLabel}
                  </span>
                  <span
                    className={`font-semibold ${
                      isMissing ? 'text-amber-700' : 'text-emerald-700'
                    }`}
                  >
                    {isMissing ? 'Missing' : 'Done'}
                  </span>
                </div>
              );
            })}
          </div>

          {missingFields.length > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch(openSelfProfileModal())}
                    className="w-full py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold"
                  >
                    Complete Missing Fields Now
                  </button>
                )}
              </div>
            </div>

            <SelfProfileEditModal
              open={editModalOpen}
              user={profile}
              submitting={submitting}
              onClose={() => dispatch(closeSelfProfileModal())}
              onSubmit={handleProfileSave}
            />
          </div>
          );
};
