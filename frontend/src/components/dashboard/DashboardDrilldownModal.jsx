import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiAlertTriangle,
  FiArrowUpRight,
  FiCheckSquare,
  FiPieChart,
  FiSearch,
  FiTarget,
  FiUserCheck,
  FiUsers,
  FiX,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  closeDashboardDrilldown,
  updateDashboardDrilldown,
} from '../../store/slices/dashboardSlice';
import { UserAvatar } from '../common/UserAvatar';
import { RoleBadge, StatusBadge } from '../common/StatusBadge';
import { formatDate, formatINR } from '../../utils/formatters';

const SECTION_META = {
  employees: {
    title: 'Workforce Directory Breakdown',
    subtitle: 'Per-employee account status, attendance rate, and target completion overview',
    icon: FiUsers,
  },
  attendance: {
    title: 'Employee Attendance & Late Marks Breakdown',
    subtitle: 'Detailed check-in punctuality, present days, leaves, absents, and late marks per employee',
    icon: FiUserCheck,
  },
  targets: {
    title: 'Employee Target Completion Breakdown',
    subtitle: 'Inspect which employee completed how much of each monthly target',
    icon: FiTarget,
  },
  tasks: {
    title: 'Employee Sprint Tasks Breakdown',
    subtitle: 'Inspect assigned tasks across Completed, In Progress, and Not Started states',
    icon: FiCheckSquare,
  },
  budget: {
    title: 'Employee & Department Budget Allocation',
    subtitle: 'Monthly seat cost allocation across active employees and departments',
    icon: FiPieChart,
  },
};

const stateBadge = {
  completed: {
    label: 'Completed',
    cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  },
  in_progress: {
    label: 'In Progress',
    cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
  },
  not_started: {
    label: 'Not Started',
    cls: 'bg-amber-50 text-amber-800 ring-1 ring-amber-600/20',
  },
};

export const DashboardDrilldownModal = () => {
  const dispatch = useAppDispatch();
  const { stats, drilldown } = useAppSelector((state) => state.dashboard);
  const [searchQuery, setSearchQuery] = useState('');

  const employees = stats?.employeeAnalytics || [];
  const activeEmployees = useMemo(
    () => employees.filter((e) => e.status === 'active'),
    [employees]
  );

  const departments = useMemo(() => {
    const set = new Set(employees.map((e) => e.department || 'Unassigned'));
    return Array.from(set).sort();
  }, [employees]);

  const matchesSearch = (emp, extraText = '') => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      emp.fullName?.toLowerCase().includes(q) ||
      emp.email?.toLowerCase().includes(q) ||
      emp.department?.toLowerCase().includes(q) ||
      emp.designation?.toLowerCase().includes(q) ||
      extraText.toLowerCase().includes(q)
    );
  };

  if (!drilldown.open || !stats) return null;

  const { section, filter, department } = drilldown;
  const meta = SECTION_META[section] || SECTION_META.employees;
  const HeaderIcon = meta.icon;

  const handleClose = () => {
    setSearchQuery('');
    dispatch(closeDashboardDrilldown());
  };

  // Switch between major sections right inside the modal header
  const sectionSwitchButtons = [
    { id: 'employees', label: 'Employees', defaultFilter: 'all' },
    { id: 'attendance', label: 'Attendance & Late Marks', defaultFilter: 'all' },
    { id: 'targets', label: 'Monthly Targets', defaultFilter: 'all' },
    { id: 'tasks', label: 'Sprint Tasks', defaultFilter: 'all' },
    { id: 'budget', label: 'Budget Allocation', defaultFilter: 'all' },
  ];

  // Filter rows per section
  const filteredDirectoryRows = employees.filter((emp) => {
    if (department && emp.department !== department) return false;
    if (filter === 'active' && emp.status !== 'active') return false;
    if (filter === 'inactive' && emp.status !== 'inactive') return false;
    return matchesSearch(emp);
  });

  const filteredAttendanceRows = activeEmployees
    .filter((emp) => {
      if (department && emp.department !== department) return false;
      const att = emp.attendanceSummary || {};
      if (filter === 'late' && (att.lateMarks || 0) <= 0) return false;
      if (filter === 'ontime' && (att.lateMarks || 0) > 0) return false;
      if (filter === 'leave' && (att.leaveDays || 0) <= 0) return false;
      if (filter === 'absent' && (att.absentDays || 0) <= 0) return false;
      return matchesSearch(emp);
    })
    .sort((a, b) => (b.attendanceSummary?.lateMarks || 0) - (a.attendanceSummary?.lateMarks || 0));

  const flatTargetRows = [];
  for (const emp of activeEmployees) {
    if (department && emp.department !== department) continue;
    for (const item of emp.targetSummary?.items || []) {
      if (filter !== 'all' && filter !== 'by_employee' && item.state !== filter) continue;
      if (!matchesSearch(emp, item.title)) continue;
      flatTargetRows.push({ emp, item });
    }
  }

  const employeeTargetSummaryRows = activeEmployees
    .filter((emp) => {
      if (department && emp.department !== department) return false;
      return matchesSearch(emp);
    })
    .sort((a, b) => (b.targetSummary?.overallPct || 0) - (a.targetSummary?.overallPct || 0));

  const flatTaskRows = [];
  for (const emp of activeEmployees) {
    if (department && emp.department !== department) continue;
    for (const item of emp.taskSummary?.items || []) {
      if (filter !== 'all' && item.state !== filter) continue;
      if (!matchesSearch(emp, item.title)) continue;
      flatTaskRows.push({ emp, item });
    }
  }

  const filteredBudgetRows = activeEmployees
    .filter((emp) => {
      if (department && emp.department !== department) return false;
      return matchesSearch(emp);
    })
    .sort((a, b) => (b.monthlyBudgetAllocation || 0) - (a.monthlyBudgetAllocation || 0));

  const totalFilteredBudget = filteredBudgetRows.reduce(
    (sum, emp) => sum + (emp.monthlyBudgetAllocation || 0),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Top Modal Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-brand-600 text-white shrink-0">
              <HeaderIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">{meta.title}</h3>
              <p className="text-xs text-slate-300">{meta.subtitle}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800"
            aria-label="Close breakdown"
          >
            <FiX className="h-5 w-5" />
          </button>
        </div>

        {/* Section Switcher + Search + Department Filter Bar */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              {sectionSwitchButtons.map((btn) => (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() =>
                    dispatch(
                      updateDashboardDrilldown({
                        section: btn.id,
                        filter: btn.defaultFilter,
                      })
                    )
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    section === btn.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-56">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-3.5 w-3.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search employee or goal..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <select
                value={department}
                onChange={(e) =>
                  dispatch(updateDashboardDrilldown({ department: e.target.value }))
                }
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white text-slate-700 font-medium"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sub-Filters Contextual to Active Section */}
          {section === 'employees' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: `All (${employees.length})` },
                {
                  id: 'active',
                  label: `Active (${employees.filter((e) => e.status === 'active').length})`,
                },
                {
                  id: 'inactive',
                  label: `Inactive (${employees.filter((e) => e.status === 'inactive').length})`,
                },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => dispatch(updateDashboardDrilldown({ filter: t.id }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    filter === t.id
                      ? 'bg-brand-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {section === 'attendance' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Active Employees' },
                { id: 'late', label: 'With Late Marks (>0)' },
                { id: 'ontime', label: 'Zero Late Marks' },
                { id: 'leave', label: 'Took Leaves (>0)' },
                { id: 'absent', label: 'Unplanned Absent (>0)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => dispatch(updateDashboardDrilldown({ filter: t.id }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    filter === t.id
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {section === 'targets' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Targets' },
                { id: 'completed', label: 'Completed' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'not_started', label: 'Not Started' },
                { id: 'by_employee', label: 'Per-Employee Summary' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => dispatch(updateDashboardDrilldown({ filter: t.id }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    filter === t.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {section === 'tasks' && (
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { id: 'all', label: 'All Sprint Tasks' },
                { id: 'completed', label: 'Completed' },
                { id: 'in_progress', label: 'In Progress' },
                { id: 'not_started', label: 'Not Started' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => dispatch(updateDashboardDrilldown({ filter: t.id }))}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    filter === t.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          )}

          {section === 'budget' && (
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
              <span>
                Showing <strong className="text-slate-900">{filteredBudgetRows.length}</strong> active
                employee seat(s) {department ? `in ${department}` : 'across all departments'}
              </span>
              <span>
                Selected Monthly Spend:{' '}
                <strong className="text-slate-900 text-sm">{formatINR(totalFilteredBudget)}</strong>
              </span>
            </div>
          )}
        </div>

        {/* Scrollable Table Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {/* 1. EMPLOYEES TABLE */}
          {section === 'employees' &&
            (filteredDirectoryRows.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-10">
                No employees match the selected filters.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Employee</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Department &amp; Role</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Attendance</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Target Progress</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredDirectoryRows.map((emp) => (
                      <tr key={emp._id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <UserAvatar user={emp} size="sm" />
                            <div>
                              <Link
                                to={`/users/${emp._id}`}
                                onClick={handleClose}
                                className="font-bold text-slate-900 hover:text-brand-600"
                              >
                                {emp.fullName}
                              </Link>
                              <p className="text-[11px] text-slate-500">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-medium text-slate-800">{emp.department}</p>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            <RoleBadge role={emp.role} />
                            <span className="text-[11px] text-slate-500">{emp.designation}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={emp.status} />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-bold text-slate-900">
                            {emp.attendanceSummary.attendancePct}%
                          </span>
                          <span className="text-slate-500 ml-1">
                            ({emp.attendanceSummary.lateMarks} late)
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="w-28">
                            <div className="flex justify-between text-[11px] mb-1">
                              <span>
                                {emp.targetSummary.completed}/{emp.targetSummary.total} done
                              </span>
                              <span className="font-bold text-indigo-700">
                                {emp.targetSummary.overallPct}%
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${emp.targetSummary.overallPct}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <Link
                            to={`/users/${emp._id}`}
                            onClick={handleClose}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100"
                          >
                            Inspect <FiArrowUpRight className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

          {/* 2. ATTENDANCE & LATE MARKS TABLE */}
          {section === 'attendance' &&
            (filteredAttendanceRows.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-10">
                No employees match this attendance filter.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Employee</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Present Days</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Late Marks</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Avg. Check-In</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Leaves / Absents</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredAttendanceRows.map((emp) => {
                      const att = emp.attendanceSummary;
                      return (
                        <tr key={emp._id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar user={emp} size="sm" />
                              <div>
                                <Link
                                  to={`/users/${emp._id}`}
                                  onClick={handleClose}
                                  className="font-bold text-slate-900 hover:text-brand-600"
                                >
                                  {emp.fullName}
                                </Link>
                                <p className="text-[11px] text-slate-500">
                                  {emp.department} • {emp.designation}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-32">
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-semibold text-slate-800">
                                  {att.presentDays}/{att.workingDays} days
                                </span>
                                <span className="font-bold text-emerald-700">
                                  {att.attendancePct}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-emerald-500 rounded-full"
                                  style={{ width: `${att.attendancePct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            {att.lateMarks > 0 ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold ${
                                  att.lateMarks >= 3
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-amber-50 text-amber-800'
                                }`}
                              >
                                {att.lateMarks >= 3 && <FiAlertTriangle className="h-3 w-3" />}
                                {att.lateMarks} Late {att.lateMarks === 1 ? 'Mark' : 'Marks'}
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold">
                                0 Late (On Time)
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700">
                            {att.avgCheckInTime} ({att.onTimePct}% on time)
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                            <span className="font-semibold text-indigo-700">
                              {att.leaveDays} leave
                            </span>{' '}
                            •{' '}
                            <span
                              className={
                                att.absentDays > 0
                                  ? 'font-semibold text-rose-700'
                                  : 'text-slate-500'
                              }
                            >
                              {att.absentDays} absent
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Link
                              to={`/users/${emp._id}`}
                              onClick={handleClose}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100"
                            >
                              View Logs <FiArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}

          {/* 3A. TARGETS — PER-EMPLOYEE SUMMARY MODE */}
          {section === 'targets' && filter === 'by_employee' && (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 font-semibold text-slate-600">Employee</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Completed</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">In Progress</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Not Started</th>
                    <th className="px-4 py-3 font-semibold text-slate-600">Overall Target %</th>
                    <th className="px-4 py-3 text-right font-semibold text-slate-600">Profile</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {employeeTargetSummaryRows.map((emp) => (
                    <tr key={emp._id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <UserAvatar user={emp} size="sm" />
                          <div>
                            <Link
                              to={`/users/${emp._id}`}
                              onClick={handleClose}
                              className="font-bold text-slate-900 hover:text-brand-600"
                            >
                              {emp.fullName}
                            </Link>
                            <p className="text-[11px] text-slate-500">{emp.department}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {emp.targetSummary.completed}
                      </td>
                      <td className="px-4 py-3 font-bold text-indigo-700">
                        {emp.targetSummary.inProgress}
                      </td>
                      <td className="px-4 py-3 font-bold text-amber-700">
                        {emp.targetSummary.notStarted}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="w-32">
                          <div className="flex justify-between text-[11px] mb-1">
                            <span>{emp.targetSummary.total} goals</span>
                            <span className="font-bold text-indigo-700">
                              {emp.targetSummary.overallPct}%
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 rounded-full"
                              style={{ width: `${emp.targetSummary.overallPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <Link
                          to={`/users/${emp._id}`}
                          onClick={handleClose}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100"
                        >
                          Manage <FiArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3B. TARGETS — INDIVIDUAL TARGET ITEMS WITH EMPLOYEE OWNERSHIP */}
          {section === 'targets' &&
            filter !== 'by_employee' &&
            (flatTargetRows.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-10">
                No monthly targets found in this status category.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Employee</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Monthly Target</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Achieved Progress</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {flatTargetRows.map(({ emp, item }) => {
                      const st = stateBadge[item.state] || stateBadge.in_progress;
                      return (
                        <tr key={`${emp._id}-${item._id}`} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar user={emp} size="sm" />
                              <div>
                                <Link
                                  to={`/users/${emp._id}`}
                                  onClick={handleClose}
                                  className="font-bold text-slate-900 hover:text-brand-600"
                                >
                                  {emp.fullName}
                                </Link>
                                <p className="text-[11px] text-slate-500">{emp.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-900">{item.title}</p>
                            <p className="text-[11px] text-slate-500">{item.month}</p>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-36">
                              <div className="flex justify-between text-[11px] mb-1">
                                <span className="font-semibold text-slate-800">
                                  {item.achievedValue}/{item.targetValue} {item.unit}
                                </span>
                                <span className="font-bold text-indigo-700">{item.pct}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    item.state === 'completed'
                                      ? 'bg-emerald-500'
                                      : item.state === 'in_progress'
                                      ? 'bg-indigo-600'
                                      : 'bg-amber-400'
                                  }`}
                                  style={{ width: `${item.pct}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full font-semibold ${st.cls}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Link
                              to={`/users/${emp._id}`}
                              onClick={handleClose}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100"
                            >
                              Inspect <FiArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}

          {/* 4. SPRINT TASKS TABLE */}
          {section === 'tasks' &&
            (flatTaskRows.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-10">
                No sprint tasks found in this status category.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Employee</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Task Title</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Priority</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Due Date</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Status</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {flatTaskRows.map(({ emp, item }) => {
                      const st = stateBadge[item.state] || stateBadge.not_started;
                      return (
                        <tr key={`${emp._id}-${item._id}`} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar user={emp} size="sm" />
                              <div>
                                <Link
                                  to={`/users/${emp._id}`}
                                  onClick={handleClose}
                                  className="font-bold text-slate-900 hover:text-brand-600"
                                >
                                  {emp.fullName}
                                </Link>
                                <p className="text-[11px] text-slate-500">{emp.department}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                          <td className="px-4 py-3 uppercase font-semibold text-slate-600">
                            {item.priority}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                            {formatDate(item.dueDate)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 rounded-full font-semibold ${st.cls}`}>
                              {st.label}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Link
                              to={`/users/${emp._id}`}
                              onClick={handleClose}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100"
                            >
                              Inspect <FiArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}

          {/* 5. BUDGET ALLOCATION PER EMPLOYEE TABLE */}
          {section === 'budget' &&
            (filteredBudgetRows.length === 0 ? (
              <p className="text-center text-sm text-slate-500 py-10">
                No active employees found for this department filter.
              </p>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-slate-600">Employee</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Department</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Monthly Allocated</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Estimated Split</th>
                      <th className="px-4 py-3 font-semibold text-slate-600">Share of Scope</th>
                      <th className="px-4 py-3 text-right font-semibold text-slate-600">Profile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredBudgetRows.map((emp) => {
                      const amt = emp.monthlyBudgetAllocation || 85000;
                      const sharePct =
                        totalFilteredBudget > 0
                          ? Math.round((amt / totalFilteredBudget) * 100)
                          : 0;
                      return (
                        <tr key={emp._id} className="hover:bg-slate-50/80">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <UserAvatar user={emp} size="sm" />
                              <div>
                                <Link
                                  to={`/users/${emp._id}`}
                                  onClick={handleClose}
                                  className="font-bold text-slate-900 hover:text-brand-600"
                                >
                                  {emp.fullName}
                                </Link>
                                <p className="text-[11px] text-slate-500">{emp.designation}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-800">
                            {emp.department}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap font-extrabold text-slate-900">
                            {formatINR(amt)}
                            <span className="text-[11px] font-normal text-slate-400">/mo</span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-slate-500">
                            Pay {formatINR(Math.round(amt * 0.68))} • Tools{' '}
                            {formatINR(Math.round(amt * 0.14))} • L&amp;D{' '}
                            {formatINR(Math.round(amt * 0.1))}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="w-24">
                              <span className="font-bold text-brand-700">{sharePct}%</span>
                              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                                <div
                                  className="h-full bg-brand-600 rounded-full"
                                  style={{ width: `${Math.max(4, sharePct)}%` }}
                                />
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right">
                            <Link
                              to={`/users/${emp._id}`}
                              onClick={handleClose}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 text-brand-700 font-semibold hover:bg-brand-100"
                            >
                              Inspect <FiArrowUpRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
