import { useEffect } from 'react';
import {
  FiAward,
  FiBookOpen,
  FiCheck,
  FiClock,
  FiDownload,
  FiFileText,
  FiPlayCircle,
  FiPlus,
  FiUser,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import {
  closeTrainingMediaModal,
  fetchMyPortal,
  openTrainingMediaModal,
  updateMyTrainingProgress,
} from '../../store/slices/portalSlice';
import { PortalSkeleton } from '../../components/loaders/Skeletons';
import { Spinner } from '../../components/loaders/Spinner';
import { EmptyState } from '../../components/common/StateFeedback';
import { TrainingMediaModal } from '../../components/portal/TrainingMediaModal';
import { formatDate, resolveMaterialDownloadUrl } from '../../utils/formatters';

export const UserTrainingsPage = () => {
  const dispatch = useAppDispatch();
  const { profile, mediaModal, loading, updatingItemId } = useAppSelector(
    (state) => state.portal
  );

  useEffect(() => {
    if (!profile) {
      dispatch(fetchMyPortal());
    }
    return () => {
      dispatch(closeTrainingMediaModal());
    };
  }, [dispatch, profile]);

  if (loading && !profile) {
    return <PortalSkeleton />;
  }

  const trainings = profile?.trainings || [];
  const completedCount = trainings.filter(
    (c) => c.progress >= 100 || c.status === 'completed'
  ).length;
  const avgProgress =
    trainings.length > 0
      ? Math.round(trainings.reduce((sum, c) => sum + (c.progress || 0), 0) / trainings.length)
      : 100;

  const activeCourse = trainings.find((c) => c._id === mediaModal.courseId) || null;

  return (
          <div className="space-y-6">
            {/* Learning Progress Banner + 3-Step Guide */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                    Step 2 of 4 • Learning &amp; Upskilling
                  </span>
                  <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                    Training Videos &amp; PDF Study Guides
                  </h1>
                  <p className="text-sm text-slate-500">
                    Watch each session video, read or download the PDF notes, and mark the course complete.
                  </p>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <span className="text-2xl font-extrabold text-slate-900">{avgProgress}%</span>
                  <p className="text-xs font-medium text-slate-500">
                    {completedCount} of {trainings.length} courses completed
                  </p>
                </div>
              </div>

                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${avgProgress === 100 ? 'bg-emerald-500' : 'bg-teal-600'
                        }`}
                      style={{ width: `${avgProgress}%` }}
                    />
                  </div>

                  {/* Simple How-To Guide Strip */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 font-medium text-slate-700">
                      <span className="h-5 w-5 rounded-full bg-slate-900 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        1
                      </span>
                      Click <strong>Watch Video</strong> to play the session
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 font-medium text-slate-700">
                      <span className="h-5 w-5 rounded-full bg-teal-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        2
                      </span>
                      Click <strong>View PDF</strong> or <strong>Download PDF</strong>
                    </div>
                    <div className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 font-medium text-slate-700">
                      <span className="h-5 w-5 rounded-full bg-emerald-600 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        3
                      </span>
                      Click <strong>Mark 100% Complete</strong> when done
                    </div>
                  </div>
                </div>

      {trainings.length === 0 ? (
                <EmptyState
                  title="No training courses enrolled"
                  description="Assigned upskilling and compliance courses from HR or your manager will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {trainings.map((course) => {
                    const isUpdating = updatingItemId === course._id;
                    const isCompleted = course.progress >= 100 || course.status === 'completed';
                    const downloadHref = resolveMaterialDownloadUrl(course.pdfUrl, course.pdfTitle);

                    return (
                      <div
                        key={course._id}
                        className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${isCompleted ? 'border-emerald-200 bg-emerald-50/15' : 'border-slate-200'
                          }`}
                      >
                              <div className="space-y-3">
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                                      {course.category}
                                    </span>
                                    <span className="text-xs text-slate-500">{course.provider}</span>
                                  </div>

                                  {isCompleted ? (
                                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                        <FiAward className="h-3.5 w-3.5" /> 100% Completed
                                      </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
                                          <FiClock className="h-3.5 w-3.5" /> {course.durationHours} hrs
                                        </span>
                    )}
                                      </div>

                                      <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                        <FiBookOpen className="h-4 w-4 text-teal-600 shrink-0" />
                                        {course.courseTitle}
                                      </h3>

                                      {course.description && (
                    <p className="text-xs text-slate-600 leading-relaxed">{course.description}</p>
                                      )}

                                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
                                          <span className="inline-flex items-center gap-1">
                                            <FiUser className="h-3.5 w-3.5 text-slate-400" />
                                            {course.instructor || 'PeoplePulse Faculty'}
                                          </span>
                                          <span>
                                            Due <strong className="text-slate-700">{formatDate(course.dueDate)}</strong>
                                          </span>
                                        </div>

                                          {/* Primary Media Buttons */}
                                          <div className="pt-1 flex flex-wrap items-center gap-2">
                                            {course.videoUrl && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  dispatch(
                                                    openTrainingMediaModal({
                                                      courseId: course._id,
                                                      mode: 'video',
                                                    })
                                                  )
                                                }
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm"
                                              >
                                                <FiPlayCircle className="h-4 w-4 text-teal-400" />
                                                Watch Video {course.videoDuration ? `(${course.videoDuration})` : ''}
                                              </button>
                                            )}

                                            {course.pdfUrl && (
                                              <>
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    dispatch(
                                                      openTrainingMediaModal({
                                                        courseId: course._id,
                                                        mode: 'pdf',
                                                      })
                                                    )
                                                  }
                                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold"
                                                >
                                                  <FiFileText className="h-3.5 w-3.5" />
                                                  View PDF
                                                </button>

                                                <a
                                                  href={downloadHref}
                                                  download={course.pdfTitle || true}
                                                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                                                >
                                                  <FiDownload className="h-3.5 w-3.5 text-slate-500" />
                                                  Download PDF
                                                </a>
                                              </>
                                            )}
                                          </div>
                                        </div>

                                          {/* Clear Progress Bar + Simple Completion Buttons */}
                                          <div className="pt-3.5 border-t border-slate-100 space-y-3">
                                            <div>
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                  <span className="font-medium text-slate-600">Your Course Progress</span>
                                                  <span className="font-bold text-teal-700">{course.progress}%</span>
                                                </div>
                                                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                                                  <div
                                                    className={`h-full rounded-full transition-all duration-300 ${isCompleted ? 'bg-emerald-500' : 'bg-teal-600'
                                                      }`}
                                                    style={{ width: `${course.progress}%` }}
                                                  />
                                                </div>
                                              </div>

                                              <div className="flex items-center justify-between gap-2 flex-wrap">
                                                {isUpdating ? (
                                                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                                                      <Spinner size="xs" /> Saving progress...
                                                    </span>
                                                    ) : isCompleted ? (
                                                    <div className="flex items-center justify-between w-full">
                                                      <span className="text-xs font-semibold text-emerald-700">
                                                        Course finished! You can still re-watch or download the PDF anytime.
                                                      </span>
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          dispatch(
                                                            updateMyTrainingProgress({
                                                              trainingId: course._id,
                                                              progress: 50,
                                                            })
                                                          )
                                                        }
                                                        className="text-xs text-slate-400 hover:text-slate-700 underline"
                                                      >
                                                        Reset to 50%
                                                      </button>
                                                    </div>
                                                    ) : (
                                                    <>
                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          dispatch(
                                                            updateMyTrainingProgress({
                                                              trainingId: course._id,
                                                              progress: Math.min(100, (course.progress || 0) + 25),
                                                            })
                                                          )
                                                        }
                                                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                                                      >
                                                        <FiPlus className="h-3.5 w-3.5" />
                                                        Add +25% Progress
                                                      </button>

                                                      <button
                                                        type="button"
                                                        onClick={() =>
                                                          dispatch(
                                                            updateMyTrainingProgress({
                                                              trainingId: course._id,
                                                              progress: 100,
                                                            })
                                                          )
                                                        }
                                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                                                      >
                                                        <FiCheck className="h-3.5 w-3.5" />
                                                        Mark 100% Complete
                                                      </button>
                                                    </>
                    )}
                                                  </div>
                </div>
                                            </div>
                                            );
          })}
                                          </div>
      )}

                                          <TrainingMediaModal
                                            open={mediaModal.open}
                                            mode={mediaModal.mode}
                                            course={activeCourse}
                                            updating={Boolean(activeCourse && updatingItemId === activeCourse._id)}
                                            onSwitchMode={(nextMode) =>
                                              activeCourse &&
                                              dispatch(openTrainingMediaModal({ courseId: activeCourse._id, mode: nextMode }))
                                            }
                                            onUpdateProgress={(pct) =>
                                              activeCourse &&
                                              dispatch(updateMyTrainingProgress({ trainingId: activeCourse._id, progress: pct }))
                                            }
                                            onClose={() => dispatch(closeTrainingMediaModal())}
                                          />
                                        </div>
                                        );
};
