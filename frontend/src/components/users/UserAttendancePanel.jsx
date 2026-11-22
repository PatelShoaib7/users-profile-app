import { useState } from 'react';
import {
  FiAlertTriangle,
  FiClock,
  FiPlus,
  FiUserCheck,
  FiUserX,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { logUserAttendance } from '../../store/slices/userSlice';
import { CircularProgressRing } from '../common/CircularProgressRing';
import { ButtonSpinner } from '../loaders/Spinner';
import { formatDate, formatINR } from '../../utils/formatters';

const statusStyles = {
  present: {
    label: 'On Time',
    cls: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/20',
  },
  late: {
    label: 'Late Mark',
    cls: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
  },
  leave: {
    label: 'Approved Leave',
    cls: 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600/20',
  },
  absent: {
    label: 'Absent',
    cls: 'bg-slate-200 text-slate-800',
  },
};

const todayIso = () => new Date().toISOString().split('T')[0];

export const UserAttendancePanel = ({ user }) => {
  const dispatch = useAppDispatch();
  const { submitting } = useAppSelector((state) => state.users);
  const [showForm, setShowForm] = useState(false);

  const [entryForm, setEntryForm] = useState({
    date: todayIso(),
    status: 'late',
    checkIn: '09:45 AM',
    checkOut: '06:20 PM',
    lateByMinutes: 30,
    remark: '',
  });

  const att = user.attendance || {
    month: 'Current Month',
    workingDays: 22,
    presentDays: 20,
    absentDays: 0,
    leaveDays: 2,
    lateMarks: 0,
    avgCheckInTime: '09:10 AM',
    logs: [],
  };

  const attendancePct =
    att.workingDays > 0 ? Math.round((att.presentDays / att.workingDays) * 100) : 0;
  const highLateMarks = (att.lateMarks || 0) >= 3;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await dispatch(
      logUserAttendance({
        userId: user._id,
        entry: {
          ...entryForm,
          lateByMinutes:
            entryForm.status === 'late' ? Number(entryForm.lateByMinutes) || 15 : 0,
        },
      })
    );
    if (logUserAttendance.fulfilled.match(res)) {
      setShowForm(false);
      setEntryForm({
        date: todayIso(),
        status: 'late',
        checkIn: '09:45 AM',
        checkOut: '06:20 PM',
        lateByMinutes: 30,
        remark: '',
      });
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900">
              Attendance Statistics &amp; Late Marks
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
              {att.month || 'Current Month'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Avg. Check-In: <strong className="text-slate-700">{att.avgCheckInTime || '09:10 AM'}</strong>
            {' • '}Allocated Seat Budget:{' '}
            <strong className="text-slate-700">
              {formatINR(user.monthlyBudgetAllocation || 85000)}/mo
            </strong>
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm((prev) => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold"
        >
          <FiPlus className="h-3.5 w-3.5" />
          {showForm ? 'Cancel' : 'Log Attendance / Late Mark'}
        </button>
      </div>

      {/* Optional Add Attendance / Late Mark Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="p-5 bg-slate-50 border-b border-slate-200 space-y-3"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Date
              </label>
              <input
                type="date"
                required
                value={entryForm.date}
                onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                Attendance Status
              </label>
              <select
                value={entryForm.status}
                onChange={(e) => setEntryForm({ ...entryForm, status: e.target.value })}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
              >
                <option value="late">Late Mark</option>
                <option value="present">Present (On Time)</option>
                <option value="leave">Approved Leave</option>
                <option value="absent">Absent</option>
              </select>
            </div>

            {(entryForm.status === 'present' || entryForm.status === 'late') && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Check-In Time
                  </label>
                  <input
                    type="text"
                    value={entryForm.checkIn}
                    onChange={(e) => setEntryForm({ ...entryForm, checkIn: e.target.value })}
                    placeholder="09:45 AM"
                    className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                  />
                </div>

                {entryForm.status === 'late' && (
                  <div>
                    <label className="block text-[11px] font-semibold text-rose-700 mb-1">
                      Late By (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={480}
                      value={entryForm.lateByMinutes}
                      onChange={(e) =>
                        setEntryForm({ ...entryForm, lateByMinutes: e.target.value })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-lg border border-rose-300 bg-white"
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              placeholder="Remark / reason (e.g., Traffic delay, Medical appointment)"
              value={entryForm.remark}
              onChange={(e) => setEntryForm({ ...entryForm, remark: e.target.value })}
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
            />
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-1.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shrink-0"
            >
              {submitting ? <ButtonSpinner label="Saving..." /> : 'Save Entry'}
            </button>
          </div>
        </form>
      )}

      {/* Attendance KPI Summary Row */}
      <div className="p-6 space-y-5">
        {highLateMarks && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-800">
            <FiAlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>
              <strong>Punctuality Alert:</strong> {user.fullName} has{' '}
              <strong>{att.lateMarks} late marks</strong> recorded in {att.month}. HR review recommended at 3+ late marks.
            </span>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-center gap-6">
          <CircularProgressRing
            percentage={attendancePct}
            size={104}
            strokeWidth={10}
            subtitle="Attendance"
          />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 w-full">
            <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <FiUserCheck className="h-3.5 w-3.5" /> Present Days
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-slate-900">
                {att.presentDays}{' '}
                <span className="text-xs font-normal text-slate-500">
                  / {att.workingDays}
                </span>
              </p>
            </div>

            <div
              className={`p-3.5 rounded-xl border ${
                (att.lateMarks || 0) > 0
                  ? 'bg-rose-50/80 border-rose-200'
                  : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-700">
                <FiClock className="h-3.5 w-3.5" /> Late Marks
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-rose-700">
                {att.lateMarks || 0}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80">
              <p className="text-xs font-semibold text-indigo-700">Leaves Taken</p>
              <p className="mt-1.5 text-xl font-extrabold text-slate-900">
                {att.leaveDays || 0}{' '}
                <span className="text-xs font-normal text-slate-500">days</span>
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-100/80 border border-slate-200">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <FiUserX className="h-3.5 w-3.5" /> Absent Days
              </div>
              <p className="mt-1.5 text-xl font-extrabold text-slate-900">
                {att.absentDays || 0}{' '}
                <span className="text-xs font-normal text-slate-500">days</span>
              </p>
            </div>
          </div>
        </div>

        {/* Recent Check-In & Late Marks Log */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
            Recent Check-In &amp; Late Mark Logs
          </h4>

          {(att.logs || []).length === 0 ? (
            <p className="text-xs text-slate-400">No daily attendance logs recorded yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3.5 py-2.5 font-semibold text-slate-600">Date</th>
                    <th className="px-3.5 py-2.5 font-semibold text-slate-600">Check-In</th>
                    <th className="px-3.5 py-2.5 font-semibold text-slate-600">Check-Out</th>
                    <th className="px-3.5 py-2.5 font-semibold text-slate-600">Status</th>
                    <th className="px-3.5 py-2.5 font-semibold text-slate-600">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {att.logs.slice(0, 7).map((item, idx) => {
                    const meta = statusStyles[item.status] || statusStyles.present;
                    return (
                      <tr key={item._id || idx} className="hover:bg-slate-50/70">
                        <td className="px-3.5 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                          {formatDate(item.date)}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-700 whitespace-nowrap">
                          {item.checkIn || '—'}
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-500 whitespace-nowrap">
                          {item.checkOut || '—'}
                        </td>
                        <td className="px-3.5 py-2.5 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-full font-semibold ${meta.cls}`}>
                            {meta.label}
                            {item.status === 'late' && item.lateByMinutes > 0
                              ? ` (+${item.lateByMinutes}m)`
                              : ''}
                          </span>
                        </td>
                        <td className="px-3.5 py-2.5 text-slate-600">
                          {item.remark || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
