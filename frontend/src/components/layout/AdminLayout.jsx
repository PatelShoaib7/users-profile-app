import { Outlet } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { closeSidebar, openSidebar } from '../../store/slices/uiSlice';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';

export const AdminLayout = () => {
  const dispatch = useAppDispatch();
  const sidebarOpen = useAppSelector((state) => state.ui.sidebarOpen);

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar mobileOpen={sidebarOpen} onClose={() => dispatch(closeSidebar())} />

      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onOpenSidebar={() => dispatch(openSidebar())} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
