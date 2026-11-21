import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiArrowRight,
  FiBookOpen,
  FiCheck,
  FiCheckCircle,
  FiCheckSquare,
  FiPlayCircle,
  FiPlus,
  FiTarget,
  FiUser,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  fetchMyPortal,
  updateMyTargetProgress,
  updateMyTaskStatus,
} from '../../store/slices/portalSlice';
import { calculateUserWorkspaceProgress } from '../../utils/portalProgress';
import { PortalSkeleton } from '../../components/loaders/Skeletons';
import { Spinner } from '../../components/loaders/Spinner';
import { CircularProgressRing } from '../../components/common/CircularProgressRing';
import { UserAvatar } from '../../components/common/UserAvatar';
import { formatDate } from '../../utils/formatters';

export const UserOverviewPage = () => {
  const dispatch = useAppDispatch();
  const { profile, summary, loading, updatingItemId, error } = useAppSelector(
    (state) => state.portal
  );

  useEffect(() => {
    dispatch(fetchMyPortal());
  }, [dispatch]);

  if (loading && !profile) {
    return <PortalSkeleton />;
  }

  if (error && !profile) {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  if (!profile || !summary) return null;

  const { overallPct, pillars } = calculateUserWorkspaceProgress(profile, summary);
  const missingFields = profile.missingFields || [];

  const pendingTasks = (profile.tasks || []).filter((t) => t.status !== 'completed');
  const incompleteCourses = (profile.trainings || []).filter(
    (c) => (c.progress || 0) < 100 && c.status !== 'completed'
  );
  const incompleteTargets = (profile.monthlyTargets || []).filter(
    (t) => (t.achievedValue || 0) < (t.targetValue || 1)
  );

  const roadmapSteps = [
    {
      step: 'Step 1',
      title: 'My Tasks',
      pct: pillars.tasks.pct,
      statusText: `${pillars.tasks.completed} of ${pillars.tasks.total} completed`,
      helper:
        pillars.tasks.remaining === 0
          ? 'All tasks finished!'
          : `${pillars.tasks.remaining} task(s) left to finish`,
      isDone: pillars.tasks.isDone,
      icon: FiCheckSquare,
      to: '/portal/tasks',
      cta: pillars.tasks.isDone ? 'Review Tasks' : 'Complete Tasks',
    },
    {
      step: 'Step 2',
      title: 'Training & Videos',
      pct: pillars.trainings.pct,
      statusText: `${pillars.trainings.completed} of ${pillars.trainings.total} courses done`,
      helper:
        pillars.trainings.isDone
          ? 'All courses 100% watched!'
          : 'Watch videos & read PDF notes',
      isDone: pillars.trainings.isDone,
      icon: FiBookOpen,
      to: '/portal/trainings',
      cta: pillars.trainings.isDone ? 'Open Library' : 'Continue Learning',
    },
    {
      step: 'Step 3',
      title: 'Monthly Targets',
      pct: pillars.targets.pct,
      statusText: `${pillars.targets.achieved} of ${pillars.targets.total} goals achieved`,
      helper:
        pillars.targets.isDone
          ? 'Monthly targets hit!'
          : 'Log your monthly KPI progress',
      isDone: pillars.targets.isDone,
      icon: FiTarget,
      to: '/portal/targets',
      cta: pillars.targets.isDone ? 'View Targets' : 'Update Targets',
    },
    {
      step: 'Step 4',
      title: 'My Profile',
      pct: pillars.profile.pct,
      statusText: `${pillars.profile.pct}% complete`,
      helper:
        missingFields.length === 0
          ? 'All 10 fields filled!'
          : `Missing: ${missingFields.slice(0, 2).join(', ')}`,
      isDone: pillars.profile.isDone,
      icon: FiUser,
      to: '/portal/profile',
      cta: pillars.profile.isDone ? 'View Profile' : 'Fill Missing Info',
    },
  ];

  return (
    <div className="space-y-6">
                {/* 1. Hero Overall Progress Summary Card */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <UserAvatar user={profile} size="lg" />
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                          Monthly Progress Tracker
                        </span>
                      <h2 className="mt-1.5 text-xl sm:text-2xl font-bold text-slate-900">
                        Hi {profile.fullName.split(' ')[0]}, here is your progress!
                      </h2>
                      <p className="text-sm text-slate-600 mt-0.5">
                        {overallPct === 100
                          ? 'You have completed 100% of your profile, tasks, trainings, and monthly targets!'
                          : `You are ${overallPct}% done overall. Use the quick actions below to reach 100%.`}
                      </p>
                    </div>
                  </div>

                        <div className="flex items-center gap-4 self-center md:self-auto bg-slate-50 px-5 py-3 rounded-2xl border border-slate-100">
                          <CircularProgressRing percentage={overallPct} size={96} strokeWidth={9} subtitle="Complete" />
                          <div className="text-xs space-y-1 text-slate-600">
                            <p>
                              Tasks: <strong className="text-slate-900">{pillars.tasks.pct}%</strong>
                            </p>
                            <p>
                              Trainings: <strong className="text-slate-900">{pillars.trainings.pct}%</strong>
                            </p>
                            <p>
                              Targets: <strong className="text-slate-900">{pillars.targets.pct}%</strong>
                            </p>
                            <p>
                              Profile: <strong className="text-slate-900">{pillars.profile.pct}%</strong>
                            </p>
                          </div>
                    </div>
                  </div>
      </div>

                              {/* 2. 4-Step Visual Progress Roadmap */}
                              <div>
                                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-3">
                                  Your 4 Progress Areas
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                  {roadmapSteps.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                      <div
                                        key={item.title}
                                        className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${item.isDone ? 'border-emerald-200' : 'border-slate-200 hover:border-teal-400'
                                          }`}
                                      >
                                        <div className="space-y-3">
                                          <div className="flex items-center justify-between">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                                              {item.step}
                                            </span>
                    {item.isDone ? (
                                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                                                <FiCheck className="h-3 w-3" /> 100% Done
                                              </span>
                                            ) : (
                      <span className="text-xs font-bold text-teal-700">{item.pct}%</span>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-2.5">
                                            <div
                                              className={`p-2 rounded-xl ${item.isDone ? 'bg-emerald-50 text-emerald-600' : 'bg-teal-50 text-teal-700'
                                                }`}
                                            >
                                              <Icon className="h-4 w-4" />
                                            </div>
                                            <div>
                                              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                                              <p className="text-xs text-slate-500">{item.statusText}</p>
                                            </div>
                                          </div>

                                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                              className={`h-full rounded-full transition-all duration-500 ${item.isDone ? 'bg-emerald-500' : 'bg-teal-600'
                                                }`}
                                              style={{ width: `${item.pct}%` }}
                                            />
                                          </div>

                                          <p className="text-xs text-slate-500">{item.helper}</p>
                                        </div>

                                        <Link
                                          to={item.to}
                                          className={`w-full py-2 px-3 rounded-xl text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors ${item.isDone
                                              ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                              : 'bg-teal-600 text-white hover:bg-teal-700'
                                            }`}
                                        >
                                          {item.cta}
                                          <FiArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* 3. One-Click "What's Left To Complete" Action Center */}
                              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                  <div>
                                    <h3 className="text-base font-bold text-slate-900">
                                      Quick Action Checklist — Finish Pending Items Here
                                    </h3>
                                    <p className="text-xs text-slate-500">
                                      Complete tasks, continue courses, or increment targets directly from this list
                                    </p>
                                  </div>
                                </div>

                                    {overallPct === 100 ? (
          <div className="p-8 text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <FiCheckCircle className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Everything is 100% Complete!</h4>
            <p className="text-sm text-slate-500">
              You have completed all assigned tasks, training courses, monthly targets, and profile fields.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Missing Profile Alert Row */}
            {missingFields.length > 0 && (
              <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/40">
                <div>
                  <span className="text-[11px] font-bold uppercase text-amber-700">Profile</span>
                  <p className="text-sm font-semibold text-slate-900">
                    Add missing profile details: {missingFields.join(', ')}
                  </p>
                </div>
                <Link
                  to="/portal/profile"
                  className="px-3.5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shrink-0 self-start sm:self-auto"
                >
                  Complete Profile
                </Link>
              </div>
            )}

            {/* Pending Tasks Quick Complete Rows */}
            {pendingTasks.slice(0, 3).map((task) => (
              <div
                key={task._id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-indigo-600">Task</span>
                    <span className="text-xs text-slate-400">• Due {formatDate(task.dueDate)}</span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{task.title}</p>
                </div>

                {updatingItemId === task._id ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                    <Spinner size="xs" /> Updating...
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(updateMyTaskStatus({ taskId: task._id, status: 'completed' }))
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shrink-0 self-start sm:self-auto"
                  >
                    <FiCheck className="h-3.5 w-3.5" />
                    Mark Task Done
                  </button>
                )}
              </div>
            ))}

            {/* Incomplete Courses Quick Row */}
            {incompleteCourses.slice(0, 2).map((course) => (
              <div
                key={course._id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-teal-700">Training</span>
                    <span className="text-xs font-semibold text-slate-500">
                      • {course.progress}% watched
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{course.courseTitle}</p>
                </div>

                <Link
                  to="/portal/trainings"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shrink-0 self-start sm:self-auto"
                >
                  <FiPlayCircle className="h-4 w-4 text-teal-400" />
                  Watch Video / PDF
                </Link>
              </div>
            ))}

            {/* Incomplete Monthly Targets Quick +1 Row */}
            {incompleteTargets.slice(0, 2).map((target) => (
              <div
                key={target._id}
                className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold uppercase text-emerald-700">
                      Monthly Target
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      • {target.achievedValue} / {target.targetValue} {target.unit}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{target.title}</p>
                </div>

                {updatingItemId === target._id ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                    <Spinner size="xs" /> Saving...
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      dispatch(
                        updateMyTargetProgress({
                          targetId: target._id,
                          achievedValue: Math.min(
                            target.targetValue,
                            (target.achievedValue || 0) + 1
                          ),
                        })
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold shrink-0 self-start sm:self-auto"
                  >
                    <FiPlus className="h-3.5 w-3.5" />
                    Log +1 {target.unit}
                  </button>
                )}
              </div>
            ))}
          </div>
                                    )}
                                  </div>
                                </div>
                                );
};
