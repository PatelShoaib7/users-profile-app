const { User } = require('../models/User');
const { evaluateProfileCompletion } = require('../services/profileCompletion');
const { logActivity } = require('../services/activity.service');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/portal/me
 * Returns authenticated user's profile, completion breakdown, tasks, trainings, and monthly targets
 */
const getMyPortalData = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  const completion = evaluateProfileCompletion(user);

  const tasks = user.tasks || [];
  const trainings = user.trainings || [];
  const monthlyTargets = user.monthlyTargets || [];

  const totalTargetPct =
    monthlyTargets.length > 0
      ? Math.round(
          monthlyTargets.reduce((sum, t) => {
            const pct = Math.min(100, Math.round(((t.achievedValue || 0) / (t.targetValue || 1)) * 100));
            return sum + pct;
          }, 0) / monthlyTargets.length
        )
      : 0;

  const summary = {
    totalTasks: tasks.length,
    pendingTasks: tasks.filter((t) => t.status !== 'completed').length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    totalTrainings: trainings.length,
    completedTrainings: trainings.filter((c) => c.status === 'completed' || c.progress === 100).length,
    avgTrainingProgress:
      trainings.length > 0
        ? Math.round(trainings.reduce((acc, c) => acc + (c.progress || 0), 0) / trainings.length)
        : 0,
    totalTargets: monthlyTargets.length,
    achievedTargets: monthlyTargets.filter((t) => t.status === 'achieved' || t.achievedValue >= t.targetValue).length,
    overallTargetCompletion: totalTargetPct,
  };

  res.status(200).json({
    success: true,
    data: {
      user: user.toJSON(),
      completion,
      summary,
    },
  });
});

/**
 * PUT /api/portal/profile
 * Allows logged-in employee/user to update their own editable profile details
 */
const updateMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  const editableFields = ['fullName', 'phone', 'bio', 'skills', 'password'];
  const changed = [];

  for (const field of editableFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      user[field] = req.body[field] ?? '';
      if (field !== 'password') changed.push(field);
    }
  }

  await user.save();

  await logActivity({
    action: 'USER_UPDATED',
    performedBy: user._id,
    targetUser: user,
    details: changed.length > 0 ? `Self-updated profile: ${changed.join(', ')}` : 'Self-updated profile',
  });

  res.status(200).json({
    success: true,
    message: 'Your profile has been updated',
    data: {
      user: user.toJSON(),
      completion: evaluateProfileCompletion(user),
    },
  });
});

/**
 * POST /api/portal/avatar
 * Allows logged-in employee/user to upload their own profile photo
 */
const uploadMyAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please select a valid image file (JPEG, PNG, or WEBP).');
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  user.profileImage = `/uploads/avatars/${req.file.filename}`;
  await user.save();

  await logActivity({
    action: 'USER_UPDATED',
    performedBy: user._id,
    targetUser: user,
    details: 'Updated own profile photo',
  });

  res.status(200).json({
    success: true,
    message: 'Profile photo updated successfully',
    data: {
      user: user.toJSON(),
      completion: evaluateProfileCompletion(user),
    },
  });
});

/**
 * PATCH /api/portal/tasks/:taskId
 * Update status of an assigned task
 */
const updateMyTaskStatus = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const task = user?.tasks?.id(req.params.taskId);
  if (!task) {
    throw new ApiError(404, 'Task not found.');
  }

  task.status = req.body.status;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Task status updated',
    data: {
      user: user.toJSON(),
    },
  });
});

/**
 * PATCH /api/portal/trainings/:trainingId
 * Update course completion progress (0-100)
 */
const updateMyTrainingProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const training = user?.trainings?.id(req.params.trainingId);
  if (!training) {
    throw new ApiError(404, 'Training course not found.');
  }

  const progress = req.body.progress;
  training.progress = progress;
  if (progress >= 100) {
    training.status = 'completed';
  } else if (progress > 0) {
    training.status = 'in_progress';
  } else {
    training.status = 'not_started';
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Course progress updated',
    data: {
      user: user.toJSON(),
    },
  });
});

/**
 * PATCH /api/portal/targets/:targetId
 * Update achieved value for a monthly target
 */
const updateMyTargetProgress = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const target = user?.monthlyTargets?.id(req.params.targetId);
  if (!target) {
    throw new ApiError(404, 'Monthly target not found.');
  }

  target.achievedValue = req.body.achievedValue;
  if (target.achievedValue >= target.targetValue) {
    target.status = 'achieved';
  } else if (req.body.status) {
    target.status = req.body.status;
  } else {
    target.status = 'on_track';
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Monthly target progress updated',
    data: {
      user: user.toJSON(),
    },
  });
});

module.exports = {
  getMyPortalData,
  updateMyProfile,
  uploadMyAvatar,
  updateMyTaskStatus,
  updateMyTrainingProgress,
  updateMyTargetProgress,
};
