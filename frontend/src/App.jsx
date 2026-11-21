import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { verifySession } from './store/slices/authSlice';
import {
  isAdminOrHrRole,
  ProtectedRoute,
  RoleRoute,
} from './components/auth/ProtectedRoute';
import { AdminLayout } from './components/layout/AdminLayout';
import { UserLayout } from './components/layout/UserLayout';
import { TopProgressBar } from './components/loaders/TopProgressBar';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersDirectoryPage } from './pages/UsersDirectoryPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { ActivityLogsPage } from './pages/ActivityLogsPage';
import { UserOverviewPage } from './pages/portal/UserOverviewPage';
import { UserTasksPage } from './pages/portal/UserTasksPage';
import { UserTrainingsPage } from './pages/portal/UserTrainingsPage';
import { UserTargetsPage } from './pages/portal/UserTargetsPage';
import { UserSelfProfilePage } from './pages/portal/UserSelfProfilePage';

const RoleHomeRedirect = () => {
  const { user } = useAppSelector((state) => state.auth);
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={isAdminOrHrRole(user.role) ? '/dashboard' : '/portal'} replace />;
};

export default function App() {
  const dispatch = useAppDispatch();
  const { initializing } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (initializing) {
      dispatch(verifySession());
    }
  }, [dispatch, initializing]);

  return (
    <BrowserRouter>
      <TopProgressBar />
      <ToastContainer />
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<RoleHomeRedirect />} />

          {/* Admin & HR Management Console UI */}
          <Route element={<RoleRoute allowedRoles={['admin', 'hr']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/users" element={<UsersDirectoryPage />} />
              <Route path="/users/:id" element={<UserProfilePage />} />
              <Route path="/activities" element={<ActivityLogsPage />} />
            </Route>
          </Route>

          {/* Employee / User Self-Service Portal UI */}
          <Route element={<RoleRoute allowedRoles={['employee', 'manager']} />}>
            <Route element={<UserLayout />}>
              <Route path="/portal" element={<UserOverviewPage />} />
              <Route path="/portal/tasks" element={<UserTasksPage />} />
              <Route path="/portal/trainings" element={<UserTrainingsPage />} />
              <Route path="/portal/targets" element={<UserTargetsPage />} />
              <Route path="/portal/profile" element={<UserSelfProfilePage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<RoleHomeRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
