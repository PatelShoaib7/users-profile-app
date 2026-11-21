import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail, FiShield } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearAuthError, loginUser } from '../store/slices/authSlice';
import { isAdminOrHrRole } from '../components/auth/ProtectedRoute';
import { clientEnv } from '../config/env';
import { ButtonSpinner } from '../components/loaders/Spinner';

export const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, token, loading, error } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState(clientEnv.demoAdminEmail || '');
  const [password, setPassword] = useState(clientEnv.demoAdminPassword || '');

  const hasDemoAdmin = Boolean(clientEnv.demoAdminEmail && clientEnv.demoAdminPassword);
  const hasDemoHr = Boolean(clientEnv.demoHrEmail && clientEnv.demoHrPassword);
  const hasDemoUser = Boolean(clientEnv.demoUserEmail && clientEnv.demoUserPassword);

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
    dispatch(loginUser({ email, password }));
  };

  const fillDemo = (role) => {
    dispatch(clearAuthError());
    if (role === 'admin') {
      setEmail(clientEnv.demoAdminEmail);
      setPassword(clientEnv.demoAdminPassword);
    } else if (role === 'hr') {
      setEmail(clientEnv.demoHrEmail);
      setPassword(clientEnv.demoHrPassword);
    } else {
      setEmail(clientEnv.demoUserEmail);
      setPassword(clientEnv.demoUserPassword);
    }
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
                  type="password"
                  required
                  disabled={loading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:bg-slate-50"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm shadow-sm transition-colors disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? <ButtonSpinner label="Authenticating..." /> : 'Sign In'}
            </button>
          </form>

          {(hasDemoAdmin || hasDemoHr || hasDemoUser) && (
            <div className="mt-6 pt-5 border-t border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-2.5">
                <FiShield className="h-3.5 w-3.5 text-brand-600" />
                Switch Role UI Preview (loaded from .env)
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {hasDemoAdmin && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => fillDemo('admin')}
                    className="px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <span className="block font-semibold text-indigo-700">Admin UI</span>
                    <span className="text-[11px] text-slate-500">Full Console</span>
                  </button>
                )}
                {hasDemoHr && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => fillDemo('hr')}
                    className="px-2.5 py-2 text-xs font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-left"
                  >
                    <span className="block font-semibold text-brand-700">HR UI</span>
                    <span className="text-[11px] text-slate-500">Directory &amp; Goals</span>
                  </button>
                )}
                {hasDemoUser && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => fillDemo('user')}
                    className="px-2.5 py-2 text-xs font-medium rounded-lg border border-teal-300 bg-teal-50/40 text-slate-700 hover:bg-teal-50 text-left"
                  >
                    <span className="block font-semibold text-teal-700">User UI</span>
                    <span className="text-[11px] text-slate-500">Tasks &amp; Targets</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
