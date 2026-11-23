import { useEffect, useRef, useState } from 'react';
import { FiUpload, FiX } from 'react-icons/fi';
import { DEPARTMENTS, ROLES, STATUSES } from '../../utils/constants';
import { resolveAvatarUrl, toDateInputValue } from '../../utils/formatters';
import { ButtonSpinner } from '../loaders/Spinner';

const initialForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  department: 'Engineering',
  designation: '',
  role: 'employee',
  joiningDate: '',
  status: 'active',
  bio: '',
  skillsText: '',
};

export const UserFormModal = ({
  open,
  mode = 'create',
  initialUser = null,
  currentUserRole = 'admin',
  submitting = false,
  serverError = null,
  onClose,
  onSubmit,
}) => {
  const [form, setForm] = useState(initialForm);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [localError, setLocalError] = useState('');
  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && initialUser) {
      setForm({
        fullName: initialUser.fullName || '',
        email: initialUser.email || '',
        password: '',
        phone: initialUser.phone || '',
        department: initialUser.department || '',
        designation: initialUser.designation || '',
        role: initialUser.role || 'employee',
        joiningDate: toDateInputValue(initialUser.joiningDate),
        status: initialUser.status || 'active',
        bio: initialUser.bio || '',
        skillsText: (initialUser.skills || []).join(', '),
      });
      setAvatarPreview(resolveAvatarUrl(initialUser.profileImage));
    } else {
      setForm(initialForm);
      setAvatarPreview('');
    }

    setAvatarFile(null);
    setLocalError('');
    if (passwordInputRef.current) {
      passwordInputRef.current.value = '';
    }
  }, [open, mode, initialUser]);

  if (!open) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setLocalError('Profile image cannot exceed 2 MB.');
      return;
    }

    setLocalError('');
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');

    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setLocalError('Full name must be at least 2 characters.');
      return;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setLocalError('Please enter a valid email address.');
      return;
    }
    const enteredPassword = (passwordInputRef.current?.value || '').trim();
    if (enteredPassword && enteredPassword.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    const skillsArray = form.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const formData = new FormData();
    formData.append('fullName', form.fullName.trim());
    formData.append('email', form.email.trim());
    if (enteredPassword) {
      formData.append('password', enteredPassword);
    }
    formData.append('phone', form.phone.trim());
    formData.append('department', form.department);
    formData.append('designation', form.designation.trim());
    formData.append('role', form.role);
    formData.append('joiningDate', form.joiningDate || '');
    formData.append('status', form.status);
    formData.append('bio', form.bio.trim());
    formData.append('skills', JSON.stringify(skillsArray));

    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    onSubmit(formData);
  };

  const availableRoles =
    currentUserRole === 'hr'
      ? ROLES.filter((r) => r.value !== 'admin')
      : ROLES;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {mode === 'create' ? 'Create New User Profile' : `Edit Profile: ${initialUser?.fullName}`}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[82vh] overflow-y-auto">
          {(localError || serverError) && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
              {localError || serverError}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Preview"
                className="h-14 w-14 rounded-full object-cover border border-slate-300"
              />
            ) : (
              <div className="h-14 w-14 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-xs font-semibold">
                Photo
              </div>
            )}
            <div className="flex-1">
              <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 cursor-pointer">
                <FiUpload className="h-3.5 w-3.5" />
                Upload Profile Image
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-slate-500 mt-1">
                JPEG, PNG, or WEBP up to 2 MB. Counts toward profile completion.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                required
                placeholder="e.g., Priya Nair"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="priya.nair@company.com"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                {mode === 'create' ? 'Initial Password (optional)' : 'New Password (optional)'}
              </label>
              <input
                ref={passwordInputRef}
                type="password"
                autoComplete="new-password"
                placeholder={mode === 'create' ? 'Uses default onboarding password if blank' : 'Leave blank to keep current'}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                name="department"
                value={form.department}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="">Unassigned</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Designation
              </label>
              <input
                type="text"
                name="designation"
                value={form.designation}
                onChange={handleChange}
                placeholder="e.g., Senior Frontend Developer"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {availableRoles.map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={form.joiningDate}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Account Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                {STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skills (comma-separated)
              </label>
              <input
                type="text"
                name="skillsText"
                value={form.skillsText}
                onChange={handleChange}
                placeholder="React.js, Node.js, MongoDB"
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              maxLength={500}
              value={form.bio}
              onChange={handleChange}
              placeholder="Brief professional summary and responsibilities..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-200">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {submitting ? (
                <ButtonSpinner label={mode === 'create' ? 'Creating...' : 'Saving...'} />
              ) : mode === 'create' ? (
                'Create User'
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
