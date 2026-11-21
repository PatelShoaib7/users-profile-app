export const ProfileCompletionBar = ({ percentage = 0, compact = false }) => {
  const pct = Math.min(100, Math.max(0, Number(percentage) || 0));

  let barColor = 'bg-emerald-500';
  let textColor = 'text-emerald-700';
  if (pct < 60) {
    barColor = 'bg-amber-500';
    textColor = 'text-amber-700';
  } else if (pct < 90) {
    barColor = 'bg-brand-600';
    textColor = 'text-brand-700';
  }

  return (
    <div className={compact ? 'w-28' : 'w-full'}>
      <div className="flex items-center justify-between text-xs mb-1">
        {!compact && <span className="font-medium text-slate-600">Profile Completion</span>}
        <span className={`font-semibold ${textColor}`}>{pct}%</span>
      </div>
      <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
};
