export const DashboardSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <div className="h-6 w-52 bg-slate-200 rounded-md" />
        <div className="h-4 w-80 bg-slate-200 rounded-md" />
      </div>
      <div className="h-10 w-36 bg-slate-200 rounded-lg" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-start justify-between"
        >
          <div className="space-y-2.5 flex-1">
            <div className="h-3 w-24 bg-slate-200 rounded" />
            <div className="h-8 w-16 bg-slate-200 rounded" />
            <div className="h-3 w-32 bg-slate-100 rounded" />
          </div>
          <div className="h-11 w-11 bg-slate-200 rounded-xl" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 space-y-4">
        <div className="h-5 w-60 bg-slate-200 rounded" />
        {[1, 2, 3, 4, 5].map((bar) => (
          <div key={bar} className="space-y-2">
            <div className="flex justify-between">
              <div className="h-3.5 w-32 bg-slate-200 rounded" />
              <div className="h-3.5 w-24 bg-slate-100 rounded" />
            </div>
            <div className="h-2.5 w-full bg-slate-100 rounded-full" />
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 space-y-3">
        <div className="h-5 w-40 bg-slate-200 rounded" />
        {[1, 2, 3, 4].map((role) => (
          <div key={role} className="h-11 w-full bg-slate-100 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 6, columns = 6 }) => (
  <div className="bg-white rounded-xl border border-slate-200 overflow-hidden animate-pulse">
    <div className="bg-slate-50 px-4 py-3.5 border-b border-slate-200 grid grid-cols-6 gap-4">
      {Array.from({ length: columns }).map((_, idx) => (
        <div key={idx} className="h-3.5 w-20 bg-slate-200 rounded" />
      ))}
    </div>

    <div className="divide-y divide-slate-100">
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <div key={rowIdx} className="px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className="h-10 w-10 rounded-full bg-slate-200 shrink-0" />
            <div className="space-y-2 flex-1 max-w-[200px]">
              <div className="h-3.5 w-32 bg-slate-200 rounded" />
              <div className="h-3 w-40 bg-slate-100 rounded" />
            </div>
          </div>
          <div className="hidden md:block h-4 w-28 bg-slate-200 rounded" />
          <div className="hidden sm:block h-5 w-16 bg-slate-200 rounded-full" />
          <div className="h-5 w-16 bg-slate-200 rounded-full" />
          <div className="hidden lg:block h-3 w-24 bg-slate-200 rounded-full" />
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 bg-slate-200 rounded-lg" />
            <div className="h-7 w-7 bg-slate-200 rounded-lg" />
            <div className="h-7 w-7 bg-slate-200 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ProfileSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="h-4 w-36 bg-slate-200 rounded" />

    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
      <div className="flex items-center gap-5">
        <div className="h-24 w-24 rounded-full bg-slate-200 shrink-0" />
        <div className="space-y-2.5">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-64 bg-slate-100 rounded" />
          <div className="h-3.5 w-72 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-9 w-28 bg-slate-200 rounded-lg" />
        <div className="h-9 w-24 bg-slate-100 rounded-lg" />
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="h-5 w-32 bg-slate-200 rounded" />
        <div className="h-4 w-full bg-slate-100 rounded" />
        <div className="h-4 w-4/5 bg-slate-100 rounded" />
        <div className="pt-4 flex gap-2">
          <div className="h-6 w-20 bg-slate-200 rounded-full" />
          <div className="h-6 w-24 bg-slate-200 rounded-full" />
          <div className="h-6 w-16 bg-slate-200 rounded-full" />
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="h-5 w-44 bg-slate-200 rounded" />
        <div className="h-3 w-full bg-slate-200 rounded-full" />
        <div className="h-24 w-full bg-slate-100 rounded-xl" />
      </div>
    </div>
  </div>
);

export const PortalSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-slate-200" />
        <div className="space-y-2">
          <div className="h-6 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-64 bg-slate-100 rounded" />
        </div>
      </div>
      <div className="h-10 w-44 bg-slate-200 rounded-xl" />
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((card) => (
        <div key={card} className="bg-white p-5 rounded-xl border border-slate-200 space-y-2.5">
          <div className="h-3.5 w-28 bg-slate-200 rounded" />
          <div className="h-8 w-16 bg-slate-200 rounded" />
          <div className="h-3 w-36 bg-slate-100 rounded" />
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {[1, 2, 3].map((col) => (
        <div key={col} className="bg-white p-5 rounded-xl border border-slate-200 space-y-3">
          <div className="h-5 w-40 bg-slate-200 rounded" />
          <div className="h-20 w-full bg-slate-100 rounded-xl" />
          <div className="h-20 w-full bg-slate-100 rounded-xl" />
        </div>
      ))}
    </div>
  </div>
);
