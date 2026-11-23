import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuthError, demoLoginUser, loginUser } from '../store/slices/authSlice';
import { isAdminOrHrRole } from '../components/auth/ProtectedRoute';
import { clientEnv } from '../config/env';
import { ButtonSpinner } from '../components/loaders/Spinner';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  // Uncontrolled ref prevents React from writing `value="..."` onto the <input> DOM attribute in DevTools Elements
  const passwordInputRef = useRef(null);

  useEffect(() => {
    if (token && user) {
      const targetHome = isAdminOrHrRole(user.role) ? '/dashboard' : '/portal';
      navigate(targetHome, { replace: true });
    }
  }, [token, user, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawPassword = passwordInputRef.current?.value || '';
    if (passwordInputRef.current) {
      passwordInputRef.current.value = '';
    }
    dispatch(loginUser({ email: email.trim(), password: rawPassword }));
  };

  const handleQuickRoleSignIn = (role) => {
    dispatch(clearAuthError());
    if (passwordInputRef.current) {
      passwordInputRef.current.value = '';
    }
    dispatch(demoLoginUser(role));
  };

  return (
    <div className="min-h-screen flex flex-col justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto h-12 w-12 rounded-xl bg-brand-600 text-white font-bold text-lg flex items-center justify-center shadow-lg">
          PP
        </div>
        <h1 className="mt-4 text-2xl font-bold text-white">
          PeoplePulse Workforce Platform
        </h1>
        <p className="mt-1.5 text-sm text-slate-400">
          Sign in to access the Admin/HR Console or your Employee Self-Service Portal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl sm:px-8 border border-slate-200">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                Work Email
              </label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  type="email"
                  required
                  autoComplete="username"
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your work email"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-600 mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
                <input
                  ref={passwordInputRef}
                  type="password"
                  required
                  minLength={6}
                  autoComplete="current-password"
                  disabled={loading}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
                />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Protected with RSA-OAEP-256 transport encryption before transmission.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? <ButtonSpinner label="Authenticating..." /> : 'Sign In'}
            </button>
          </form>

          {clientEnv.enableDemoLogin && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2.5">
                <FiShield className="h-3.5 w-3.5 text-brand-600" />
                Instant Role Preview (Server-Issued Session — Zero Client Passwords)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickRoleSignIn('admin')}
                  className="px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                >
                  <span className="block font-semibold text-indigo-700">Admin UI</span>
                  <span className="text-[11px] text-slate-500">Sign in as Admin</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickRoleSignIn('hr')}
                  className="px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                >
                  <span className="block font-semibold text-brand-700">HR UI</span>
                  <span className="text-[11px] text-slate-500">Sign in as HR</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickRoleSignIn('user')}
                  className="px-2.5 py-2 text-xs font-medium rounded-lg border border-teal-300 bg-teal-50/40 text-slate-700 hover:bg-teal-50 text-left cursor-pointer"
                >
                  <span className="block font-semibold text-teal-700">User UI</span>
                  <span className="text-[11px] text-slate-500">Sign in as Employee</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
