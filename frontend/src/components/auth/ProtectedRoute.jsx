import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { FullScreenLoader } from '../loaders/Spinner';

export const isAdminOrHrRole = (role) => ['admin', 'hr'].includes(role);

export const ProtectedRoute = () => {
  const { user, token, initializing } = useAppSelector((state) => state.auth);
  const location = useLocation();

  if (initializing) {
    return <FullScreenLoader message="Verifying authenticated session..." />;
  }

  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export const RoleRoute = ({ allowedRoles }) => {
  const { user } = useAppSelector((state) => state.auth);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    const fallbackPath = isAdminOrHrRole(user.role) ? '/dashboard' : '/portal';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};
