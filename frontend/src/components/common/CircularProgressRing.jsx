export const CircularProgressRing = ({
  percentage = 0,
  size = 116,
  strokeWidth = 10,
  subtitle = 'Overall',
}) => {
  const pct = Math.min(100, Math.max(0, Math.round(Number(percentage) || 0)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;

  let strokeColor = '#0d9488'; // teal-600
  if (pct >= 100) strokeColor = '#10b981'; // emerald-500
  else if (pct < 50) strokeColor = '#f59e0b'; // amber-500

  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-out"
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold text-slate-900 leading-none">{pct}%</span>
        {subtitle && (
          <span className="text-[11px] font-semibold text-slate-500 mt-1">{subtitle}</span>
        )}
      </div>
    </div>
  );
};
