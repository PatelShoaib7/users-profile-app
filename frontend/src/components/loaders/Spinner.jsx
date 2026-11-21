export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'h-3.5 w-3.5 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-[3px]',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block rounded-full border-current border-t-transparent animate-spin ${
        sizeClasses[size] || sizeClasses.md
      } ${className}`}
    />
  );
};

export const ButtonSpinner = ({ label = 'Processing...' }) => (
  <span className="inline-flex items-center gap-2">
    <Spinner size="sm" />
    <span>{label}</span>
  </span>
);

export const FullScreenLoader = ({ message = 'Loading workspace...' }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
    <div className="relative flex items-center justify-center">
      <div className="h-14 w-14 rounded-full border-4 border-brand-100" />
      <div className="absolute h-14 w-14 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
    </div>
    <p className="mt-4 text-sm font-semibold text-slate-700">{message}</p>
    <p className="mt-1 text-xs text-slate-400">Syncing profile state...</p>
  </div>
);
