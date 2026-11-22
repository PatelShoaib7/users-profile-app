import { useEffect } from 'react';
import {
  FiCalendar,
  FiCheck,
  FiCheckCircle,
  FiPlay,
  FiRotateCcw,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMyPortal,
  setPortalTaskFilter,
  updateMyTaskStatus,
} from '../../store/slices/portalSlice';
import { PortalSkeleton } from '../../components/loaders/Skeletons';
import { Spinner } from '../../components/loaders/Spinner';
import { EmptyState } from '../../components/common/StateFeedback';
import { formatDate } from '../../utils/formatters';

const priorityBadge = {
  high: 'bg-rose-50 text-rose-700 ring-1 ring-rose-600/20',
  medium: 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20',
  low: 'bg-slate-100 text-slate-600 ring-1 ring-slate-500/20',
};

const statusPill = {
  pending: { label: 'To Do', cls: 'bg-slate-100 text-slate-700' },
  in_progress: { label: 'In Progress', cls: 'bg-indigo-50 text-indigo-700' },
  completed: { label: 'Completed', cls: 'bg-emerald-50 text-emerald-700' },
};

export const UserTasksPage = () => {
  const dispatch = useAppDispatch();
  const { profile, taskFilter, loading, updatingItemId } = useAppSelector(
    (state) => state.portal
  );

  useEffect(() => {
    if (!profile) {
      dispatch(fetchMyPortal());
    }
  }, [dispatch, profile]);

  if (loading && !profile) {
    return <PortalSkeleton />;
  }

  const allTasks = profile?.tasks || [];
  const completedCount = allTasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = allTasks.filter((t) => t.status === 'in_progress').length;
  const pendingCount = allTasks.filter((t) => t.status === 'pending').length;
  const completionPct =
    allTasks.length > 0 ? Math.round((completedCount / allTasks.length) * 100) : 100;

  const filterTabs = [
    { id: 'all', label: `All (${allTasks.length})` },
    { id: 'pending', label: `To Do (${pendingCount})` },
    { id: 'in_progress', label: `In Progress (${inProgressCount})` },
    { id: 'completed', label: `Completed (${completedCount})` },
  ];

  const filteredTasks =
    taskFilter === 'all' ? allTasks : allTasks.filter((t) => t.status === taskFilter);

  return (
    <div className="space-y-6">
      {/* Clear Task Progress Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Step 1 of 4 • Sprint Deliverables
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-0.5">My Assigned Tasks</h1>
            <p className="text-sm text-slate-500">
              Start a task when you begin working on it, and click <strong>Mark Complete</strong> once finished.
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0">
            <span className="text-2xl font-extrabold text-slate-900">{completionPct}%</span>
            <p className="text-xs font-medium text-slate-500">
              {completedCount} of {allTasks.length} tasks done
            </p>
          </div>
        </div>

        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              completionPct === 100 ? 'bg-emerald-500' : 'bg-teal-600'
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {filterTabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => dispatch(setPortalTaskFilter(tab.id))}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                taskFilter === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title="No tasks in this filter"
          description="Switch to All Tasks to review your full list."
          actionLabel={taskFilter !== 'all' ? 'Show All Tasks' : undefined}
          onAction={taskFilter !== 'all' ? () => dispatch(setPortalTaskFilter('all')) : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTasks.map((task) => {
            const isUpdating = updatingItemId === task._id;
            const isDone = task.status === 'completed';
            const isStarted = task.status === 'in_progress';
            const pill = statusPill[task.status] || statusPill.pending;

            return (
              <div
                key={task._id}
                className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${
                  isDone ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${pill.cls}`}>
                      {pill.label}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase ${
                        priorityBadge[task.priority] || priorityBadge.medium
                      }`}
                    >
                      {task.priority} priority
                    </span>
                  </div>

                  <h3
                    className={`text-base font-bold ${
                      isDone ? 'line-through text-slate-500' : 'text-slate-900'
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="text-sm text-slate-600 leading-relaxed">{task.description}</p>
                  )}
                </div>

                {/* Clear 1-Click Action Footer */}
                <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                    <FiCalendar className="h-3.5 w-3.5 text-slate-400" />
                    Due <strong className="text-slate-700">{formatDate(task.dueDate)}</strong>
                  </span>

                  {isUpdating ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                      <Spinner size="xs" /> Updating...
                    </span>
                  ) : isDone ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <FiCheckCircle className="h-4 w-4" /> Completed
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateMyTaskStatus({ taskId: task._id, status: 'in_progress' })
                          )
                        }
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100"
                      >
                        <FiRotateCcw className="h-3 w-3" /> Reopen
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      {!isStarted && (
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateMyTaskStatus({ taskId: task._id, status: 'in_progress' })
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold"
                        >
                          <FiPlay className="h-3 w-3" />
                          Start Task
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateMyTaskStatus({ taskId: task._id, status: 'completed' })
                          )
                        }
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                      >
                        <FiCheck className="h-3.5 w-3.5" />
                        Mark Complete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
