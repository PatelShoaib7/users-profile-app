import { useEffect } from 'react';
import { FiCheck, FiCheckCircle, FiMinus, FiPlus, FiTarget } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchMyPortal, updateMyTargetProgress } from '../../store/slices/portalSlice';
import { PortalSkeleton } from '../../components/loaders/Skeletons';
import { Spinner } from '../../components/loaders/Spinner';
import { EmptyState } from '../../components/common/StateFeedback';

export const UserTargetsPage = () => {
  const dispatch = useAppDispatch();
  const { profile, summary, loading, updatingItemId } = useAppSelector(
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

  const targets = profile?.monthlyTargets || [];
  const achievedCount = targets.filter(
    (t) => t.status === 'achieved' || (t.achievedValue || 0) >= (t.targetValue || 1)
  ).length;
  const overallScore = summary?.overallTargetCompletion ?? 0;

    const adjustTarget = (target, nextVal) => {
      const clamped = Math.max(0, nextVal);
      dispatch(
        updateMyTargetProgress({
          targetId: target._id,
          achievedValue: clamped,
        })
      );
    };

    return (
            <div className="space-y-6">
              {/* Monthly Targets Progress Banner */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                      Step 3 of 4 • Monthly Goals
                    </span>
                    <h1 className="text-xl font-bold text-slate-900 mt-0.5">
                      Targets To Achieve This Month
                    </h1>
                    <p className="text-sm text-slate-500">
                      Use <strong>+1</strong> to log progress as you complete deliverables, or click{' '}
                      <strong>Mark Target Achieved</strong> when done.
                    </p>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-2xl font-extrabold text-slate-900">{overallScore}%</span>
                    <p className="text-xs font-medium text-slate-500">
                      {achievedCount} of {targets.length} monthly goals achieved
                    </p>
                  </div>
                </div>

                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${overallScore >= 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                    style={{ width: `${overallScore}%` }}
                  />
                </div>
              </div>

              {targets.length === 0 ? (
                <EmptyState
                  title="No monthly targets set yet"
                  description="Your monthly deliverables and KPI goals assigned by your manager or HR will appear here."
                />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {targets.map((target) => {
                    const pct = Math.min(
                      100,
                      Math.round(((target.achievedValue || 0) / (target.targetValue || 1)) * 100)
                    );
                    const remaining = Math.max(0, (target.targetValue || 0) - (target.achievedValue || 0));
                    const isAchieved = remaining === 0;
                    const isUpdating = updatingItemId === target._id;

                    return (
                      <div
                        key={target._id}
                        className={`bg-white rounded-2xl border p-5 shadow-sm flex flex-col justify-between gap-4 transition-all ${isAchieved ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                          }`}
                      >
                              <div className="space-y-2.5">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
                                    {target.month}
                                  </span>

                                  {isAchieved ? (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                                      <FiCheckCircle className="h-3.5 w-3.5" /> Target Achieved
                                    </span>
                                  ) : (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800">
                                      {remaining} {target.unit} remaining
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                                  <FiTarget className="h-4 w-4 text-indigo-600 shrink-0" />
                                  {target.title}
                                </h3>

                                {target.notes && (
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {target.notes}
                    </p>
                  )}
                </div>

                {/* Clear Visual Progress + One-Click Stepper */}
                <div className="space-y-3 pt-3.5 border-t border-slate-100">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600">
                        Progress:{' '}
                        <strong className="text-slate-900 text-sm">
                          {target.achievedValue} / {target.targetValue} {target.unit}
                        </strong>
                      </span>
                      <span className="font-bold text-indigo-700">{pct}%</span>
                    </div>

                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isAchieved ? 'bg-emerald-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
                    {isUpdating ? (
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700">
                        <Spinner size="xs" /> Updating target...
                      </span>
                    ) : (
                      <>
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={(target.achievedValue || 0) <= 0}
                            onClick={() => adjustTarget(target, (target.achievedValue || 0) - 1)}
                            className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-35"
                            title="Decrease by 1"
                          >
                            <FiMinus className="h-3.5 w-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => adjustTarget(target, (target.achievedValue || 0) + 1)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-teal-300 bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold"
                          >
                            <FiPlus className="h-3.5 w-3.5" />
                            Log +1 {target.unit}
                          </button>
                        </div>

                        {!isAchieved && (
                          <button
                            type="button"
                            onClick={() => adjustTarget(target, target.targetValue)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                          >
                            <FiCheck className="h-3.5 w-3.5" />
                            Mark Target Achieved
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
