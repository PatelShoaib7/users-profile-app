import { FiRotateCcw, FiSearch } from 'react-icons/fi';
import { DEPARTMENTS, ROLES, STATUSES } from '../../utils/constants';
import { Spinner } from '../loaders/Spinner';

export const UserFilters = ({
  searchInput,
  onSearchChange,
  isSearching = false,
  filters,
  onFilterChange,
  onReset,
}) => {
  const hasActiveFilters =
    Boolean(searchInput) ||
    Boolean(filters.department) ||
    Boolean(filters.role) ||
    Boolean(filters.status) ||
    filters.sortBy !== 'createdAt' ||
    filters.sortOrder !== 'desc';

  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by full name, email, or designation..."
            className="w-full pl-10 pr-9 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
          />
          {isSearching && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-600">
              <Spinner size="xs" />
            </span>
          )}
        </div>

        <div className="md:col-span-3">
          <select
            value={filters.department}
            onChange={(e) => onFilterChange({ department: e.target.value, page: 1 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={filters.role}
            onChange={(e) => onFilterChange({ role: e.target.value, page: 1 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Roles</option>
            {ROLES.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value, page: 1 })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
          <span className="font-medium">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ sortBy: e.target.value, page: 1 })}
            className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700"
          >
            <option value="createdAt">Recently Created</option>
            <option value="fullName">Full Name</option>
            <option value="joiningDate">Joining Date</option>
            <option value="profileCompletion">Profile Completion</option>
          </select>

          <select
            value={filters.sortOrder}
            onChange={(e) => onFilterChange({ sortOrder: e.target.value, page: 1 })}
            className="px-2.5 py-1.5 rounded-md border border-slate-300 bg-white text-slate-700"
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            <FiRotateCcw className="h-3.5 w-3.5" />
            Reset Filters
          </button>
        )}
      </div>
    </div>
  );
};
