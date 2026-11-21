import { useAppSelector } from '../../store/hooks';

export const TopProgressBar = () => {
  const activeRequests = useAppSelector((state) => state.ui.activeRequests);

  if (activeRequests <= 0) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-brand-100 overflow-hidden pointer-events-none">
      <div className="h-full w-1/3 bg-brand-600 rounded-full animate-progress-bar" />
    </div>
  );
};
