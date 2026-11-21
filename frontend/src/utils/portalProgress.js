/**
 * Computes unified progress across all 4 employee workspace pillars:
 * 1. Profile Completeness
 * 2. Assigned Tasks
 * 3. Training & Courses
 * 4. Monthly Targets
 */
export const calculateUserWorkspaceProgress = (profile, summary) => {
  if (!profile) {
    return {
      overallPct: 0,
      pillars: {
        profile: { pct: 0, label: '0% complete', isDone: false },
        tasks: { pct: 0, completed: 0, total: 0, remaining: 0, label: '0/0 done', isDone: false },
        trainings: { pct: 0, completed: 0, total: 0, label: '0% watched', isDone: false },
        targets: { pct: 0, achieved: 0, total: 0, label: '0/0 hit', isDone: false },
      },
    };
  }

  const tasks = profile.tasks || [];
  const trainings = profile.trainings || [];
  const targets = profile.monthlyTargets || [];

  const profilePct = Math.min(100, Math.max(0, Number(profile.profileCompletion) || 0));

  const totalTasks = summary?.totalTasks ?? tasks.length;
  const completedTasks =
    summary?.completedTasks ?? tasks.filter((t) => t.status === 'completed').length;
  const remainingTasks = Math.max(0, totalTasks - completedTasks);
  const tasksPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

  const totalTrainings = summary?.totalTrainings ?? trainings.length;
  const completedTrainings =
    summary?.completedTrainings ??
    trainings.filter((c) => c.progress >= 100 || c.status === 'completed').length;
  const trainingsPct =
    totalTrainings > 0
      ? summary?.avgTrainingProgress ??
        Math.round(trainings.reduce((acc, c) => acc + (c.progress || 0), 0) / totalTrainings)
      : 100;

  const totalTargets = summary?.totalTargets ?? targets.length;
  const achievedTargets =
    summary?.achievedTargets ??
    targets.filter((t) => t.status === 'achieved' || t.achievedValue >= t.targetValue).length;
  const targetsPct =
    totalTargets > 0
      ? summary?.overallTargetCompletion ??
        Math.round(
          targets.reduce(
            (acc, t) =>
              acc + Math.min(100, Math.round(((t.achievedValue || 0) / (t.targetValue || 1)) * 100)),
            0
          ) / totalTargets
        )
      : 100;

  const overallPct = Math.round((profilePct + tasksPct + trainingsPct + targetsPct) / 4);

  return {
    overallPct,
    pillars: {
      profile: {
        pct: profilePct,
        missingCount: (profile.missingFields || []).length,
        label: profilePct === 100 ? 'Complete' : `${profilePct}%`,
        isDone: profilePct === 100,
      },
      tasks: {
        pct: tasksPct,
        completed: completedTasks,
        total: totalTasks,
        remaining: remainingTasks,
        label: `${completedTasks}/${totalTasks} done`,
        isDone: totalTasks > 0 ? remainingTasks === 0 : true,
      },
      trainings: {
        pct: trainingsPct,
        completed: completedTrainings,
        total: totalTrainings,
        label: `${trainingsPct}%`,
        isDone: totalTrainings > 0 ? trainingsPct === 100 : true,
      },
      targets: {
        pct: targetsPct,
        achieved: achievedTargets,
        total: totalTargets,
        label: `${achievedTargets}/${totalTargets} hit`,
        isDone: totalTargets > 0 ? achievedTargets === totalTargets : true,
      },
    },
  };
};
