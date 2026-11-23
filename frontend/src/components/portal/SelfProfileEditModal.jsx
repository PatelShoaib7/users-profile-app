import { useEffect, useRef, useState } from 'react';
import { FiX } from 'react-icons/fi';
import { ButtonSpinner } from '../loaders/Spinner';

export const SelfProfileEditModal = ({ open, user, submitting, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    bio: '',
    skillsText: '',
    password: '',
  });
  const [localError, setLocalError] = useState('');
  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (!open || !user) return;
    setForm({
      fullName: user.fullName || '',
      phone: user.phone || '',
      bio: user.bio || '',
      skillsText: (user.skills || []).join(', '),
      password: '',
    });
    setLocalError('');
    if (passwordInputRef.current) {
      passwordInputRef.current.value = '';
    }
  }, [open, user]);

  if (!open || !user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.fullName.trim() || form.fullName.trim().length < 2) {
      setLocalError('Full name must be at least 2 characters.');
      return;
    }
    const enteredPassword = (passwordInputRef.current?.value || '').trim();
    if (enteredPassword && enteredPassword.length < 6) {
      setLocalError('New password must be at least 6 characters.');
      return;
    }

    const skills = form.skillsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      fullName: form.fullName.trim(),
      phone: form.phone.trim(),
      bio: form.bio.trim(),
      skills,
      ...(enteredPassword ? { password: enteredPassword } : {}),
    };

    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="px-6 py-4 bg-teal-900 text-white flex items-center justify-between">
          <h3 className="text-base font-semibold">Update My Profile Details</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white hover:bg-teal-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {localError && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-sm text-rose-700">
              {localError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
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
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
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
              placeholder="React, Figma, UX Research"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Professional Bio
            </label>
            <textarea
              name="bio"
              rows={3}
              maxLength={500}
              value={form.bio}
              onChange={handleChange}
              placeholder="Share a short summary of your role and current focus..."
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Change Password (optional)
            </label>
            <input
              ref={passwordInputRef}
              type="password"
              autoComplete="new-password"
              placeholder="Leave blank to keep existing password"
              className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-600"
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
              className="px-5 py-2 text-sm font-medium rounded-lg bg-teal-700 text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {submitting ? <ButtonSpinner label="Saving..." /> : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
