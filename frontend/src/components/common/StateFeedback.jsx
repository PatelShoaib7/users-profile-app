export const LoadingState = ({ message = 'Loading data...' }) => (
  <div className="py-16 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200">
    <div className="h-9 w-9 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
    <p className="mt-3 text-sm font-medium text-slate-600">{message}</p>
  </div>
);

export const EmptyState = ({ title, description, actionLabel, onAction }) => (
  <div className="py-16 px-6 flex flex-col items-center justify-center text-center bg-white rounded-xl border border-slate-200">
    <div className="h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-lg font-bold">
      ?
    </div>
    <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
    <p className="mt-1 text-sm text-slate-500 max-w-md">{description}</p>
    {actionLabel && onAction && (
      <button
        type="button"
        onClick={onAction}
        className="mt-4 px-4 py-2 text-sm font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
