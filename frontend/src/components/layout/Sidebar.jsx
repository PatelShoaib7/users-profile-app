import { NavLink } from 'react-router-dom';
import { FiActivity, FiGrid, FiUsers, FiX } from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', label: 'Dashboard & Insights', icon: FiGrid },
  { to: '/users', label: 'User Directory', icon: FiUsers },
  { to: '/activities', label: 'Activity Logs', icon: FiActivity },
];

export const Sidebar = ({ mobileOpen, onClose }) => {
  return (
    <>
      {mobileOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center font-bold text-white">
              PP
            </div>
            <div>
              <p className="text-sm font-bold text-white leading-none">PeoplePulse</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Workforce Admin</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 m-3 rounded-xl bg-slate-800/70 border border-slate-700/60">
          <p className="text-xs font-semibold text-slate-200">Role Permissions</p>
          <p className="text-xs text-slate-400 mt-1 leading-relaxed">
            Admins have full access including permanent user deletion. HR can onboard, update, and toggle account status.
          </p>
        </div>
      </aside>
    </>
  );
};
