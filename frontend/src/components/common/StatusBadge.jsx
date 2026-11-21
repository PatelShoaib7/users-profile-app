export const StatusBadge = ({ status }) => {
  const isActive = status === 'active';
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
        isActive
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
          : 'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/20'
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
      />
      {status || 'inactive'}
    </span>
  );
};

export const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    hr: 'bg-teal-50 text-teal-700 ring-teal-600/20',
    manager: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    employee: 'bg-slate-100 text-slate-700 ring-slate-500/20',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wide ring-1 ring-inset ${
        styles[role] || styles.employee
      }`}
    >
      {role || 'employee'}
    </span>
  );
};
