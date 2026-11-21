import { useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  FiBookOpen,
  FiCheck,
  FiCheckSquare,
  FiHome,
  FiLogOut,
  FiMenu,
  FiTarget,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import { fetchMyPortal } from '../../store/slices/portalSlice';
import { closeSidebar, openSidebar } from '../../store/slices/uiSlice';
import { calculateUserWorkspaceProgress } from '../../utils/portalProgress';
import { UserAvatar } from '../common/UserAvatar';
import { Footer } from './Footer';

export const UserLayout = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);
  const { profile, summary, loading } = useAppSelector((state) => state.portal);
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  useEffect(() => {
    if (!profile && !loading) {
      dispatch(fetchMyPortal());
    }
  }, [dispatch, profile, loading]);

  const progress = calculateUserWorkspaceProgress(profile || user, summary);
  const { overallPct, pillars } = progress;

  const navItems = [
    {
      to: '/portal',
      label: 'My Progress Home',
      icon: FiHome,
      end: true,
      badge: `${overallPct}%`,
      isDone: overallPct === 100,
    },
    {
      to: '/portal/tasks',
      label: '1. My Tasks',
      icon: FiCheckSquare,
      badge: pillars.tasks.remaining === 0 ? 'Done' : `${pillars.tasks.remaining} left`,
      isDone: pillars.tasks.isDone,
    },
    {
      to: '/portal/trainings',
      label: '2. Training & Videos',
      icon: FiBookOpen,
      badge: pillars.trainings.isDone ? 'Done' : `${pillars.trainings.pct}%`,
      isDone: pillars.trainings.isDone,
    },
    {
      to: '/portal/targets',
      label: '3. Monthly Targets',
      icon: FiTarget,
      badge: pillars.targets.isDone ? 'Done' : pillars.targets.label,
      isDone: pillars.targets.isDone,
    },
    {
      to: '/portal/profile',
      label: '4. My Profile',
      icon: FiUser,
      badge: pillars.profile.isDone ? 'Done' : `${pillars.profile.pct}%`,
      isDone: pillars.profile.isDone,
    },
  ];

  const handleLogout = () => {
    dispatch(closeSidebar());
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
                    <div className="min-h-screen flex bg-slate-50">
                      {/* Mobile Backdrop */}
                      {sidebarOpen && (
                        <div
                          onClick={() => dispatch(closeSidebar())}
                          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
                        />
                      )}

                      {/* Employee Guided Progress Sidebar */}
                      <aside
                        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                          }`}
                      >
                        <div className="h-16 px-5 flex items-center justify-between border-b border-slate-100">
                          <div className="flex items-center gap-2.5">
                            <div className="h-9 w-9 rounded-xl bg-teal-600 text-white font-extrabold text-sm flex items-center justify-center shadow-sm">
                              PP
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 leading-none">PeoplePulse</p>
                              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-teal-50 text-teal-700">
                                Employee Portal
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => dispatch(closeSidebar())}
                            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <FiX className="h-5 w-5" />
                          </button>
                        </div>

                        {/* Live Overall Progress Tracker Card */}
                        <div className="m-4 p-4 rounded-2xl bg-gradient-to-br from-teal-900 to-slate-900 text-white shadow-sm">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-teal-200">Overall Monthly Progress</span>
                            <span className="font-extrabold text-sm text-white">{overallPct}%</span>
                          </div>
                          <div className="mt-2 w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${overallPct >= 100 ? 'bg-emerald-400' : 'bg-teal-400'
                                }`}
                              style={{ width: `${overallPct}%` }}
                            />
                          </div>
                          <p className="mt-2 text-[11px] text-slate-300 leading-relaxed">
                            {overallPct >= 100
                              ? 'All tasks, trainings, targets, and profile items are 100% complete!'
                              : 'Complete each numbered step below to reach 100% monthly readiness.'}
                          </p>
                        </div>

                        {/* Step-by-Step Navigation */}
                        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
                          {navItems.map(({ to, label, icon: Icon, end, badge, isDone }) => (
                            <NavLink
                              key={to}
                              to={to}
                              end={end}
                              onClick={() => dispatch(closeSidebar())}
                              className={({ isActive }) =>
                                `flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${isActive
                                  ? 'bg-teal-600 text-white shadow-sm'
                                  : 'text-slate-700 hover:bg-slate-100'
                                }`
                              }
                            >
                              {({ isActive }) => (
                                <>
                                  <span className="flex items-center gap-3 truncate">
                                    <Icon
                                      className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'
                                        }`}
                                    />
                                    <span className="truncate">{label}</span>
                                  </span>

                                    <span
                                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold shrink-0 ${isActive
                                          ? 'bg-white/20 text-white'
                                          : isDone
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'bg-amber-50 text-amber-700'
                                        }`}
                                    >
                                      {isDone && <FiCheck className="h-3 w-3" />}
                                      {badge}
                                    </span>
                            </>
                          )}
                        </NavLink>
          ))}
                      </nav>

                      {/* Quick User Card */}
                      {user && (
                        <div className="p-4 border-t border-slate-100 flex items-center gap-3">
                          <UserAvatar user={profile || user} size="sm" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-slate-900 truncate">
                              {(profile || user).fullName}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate">
                              {(profile || user).department || 'Team Member'}
                            </p>
                          </div>
                        </div>
                      )}
                    </aside>

                      {/* Main Content Area */}
                      <div className="flex-1 flex flex-col min-w-0">
                        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => dispatch(openSidebar())}
                              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
                              aria-label="Open menu"
                            >
                              <FiMenu className="h-5 w-5" />
                            </button>

                            <div>
                              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                                My Employee Workspace
                              </h1>
                              <p className="text-xs text-slate-500 hidden sm:block">
                                {(profile || user)?.designation || 'Employee'} •{' '}
                                {(profile || user)?.department || 'Company'}
                              </p>
                            </div>
                          </div>

                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-50 border border-teal-200 text-xs font-semibold text-teal-800">
                        <span>Total Progress:</span>
                        <span className="font-extrabold">{overallPct}%</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleLogout}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
                      >
                        <FiLogOut className="h-4 w-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </header>

                  <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8">
                    <Outlet />
                  </main>

                  <Footer />
                </div>
              </div>
              );
};
