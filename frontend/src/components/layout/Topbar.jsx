import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiLogOut, FiMenu } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { UserAvatar } from '../common/UserAvatar';
import { RoleBadge } from '../common/StatusBadge';

export const Topbar = ({ onOpenSidebar }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open navigation"
        >
          <FiMenu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-sm sm:text-base font-semibold text-slate-900">
            User Profile Management &amp; Insights
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {user && (
          <Link
            to={`/users/${user._id}`}
            className="flex items-center gap-2.5 hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors"
            title="View your profile"
          >
            <UserAvatar user={user} size="sm" />
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-slate-900 leading-tight">
                {user.fullName}
              </p>
              <div className="mt-0.5">
                <RoleBadge role={user.role} />
              </div>
            </div>
          </Link>
        )}

        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <FiLogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
