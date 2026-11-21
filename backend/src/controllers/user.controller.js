const { User } = require('../models/User');
const { ActivityLog } = require('../models/ActivityLog');
const { evaluateProfileCompletion } = require('../services/profileCompletion');
const { logActivity } = require('../services/activity.service');
const { getDefaultStarterPack } = require('../seed/sampleData');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * GET /api/users
 * Server-side search, filter, sort, and pagination
 */
const getUsers = asyncHandler(async (req, res) => {
  const { page, limit, search, department, role, status, sortBy, sortOrder } = req.query;

  const filter = {};

  if (search) {
    const regex = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ fullName: regex }, { email: regex }, { designation: regex }];
  }

  if (department) {
    filter.department = department;
  }

  if (role) {
    filter.role = role;
  }

  if (status) {
    filter.status = status;
  }

  const sortDirection = sortOrder === 'asc' ? 1 : -1;
  const sortCriteria = { [sortBy]: sortDirection, _id: -1 };
  const skip = (page - 1) * limit;

  const [users, total] = await Promise.all([
    User.find(filter).sort(sortCriteria).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.status(200).json({
    success: true,
    message: 'Users fetched successfully',
    data: users,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

/**
 * GET /api/users/:id
 * Fetch full user profile, completion breakdown, and recent user-specific activity logs
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  const completion = evaluateProfileCompletion(user);
  const recentActivities = await ActivityLog.find({ targetUser: user._id })
    .populate('performedBy', 'fullName email role')
    .sort({ createdAt: -1 })
    .limit(10);

  res.status(200).json({
    success: true,
    data: {
      user,
      completion,
      recentActivities,
    },
  });
});

/**
 * POST /api/users
 * Create a new user profile
 */
const createUser = asyncHandler(async (req, res) => {
  const payload = { ...req.body };

  if (req.user.role === 'hr' && payload.role === 'admin') {
    throw new ApiError(403, 'HR members cannot create Admin accounts.');
  }

  const existing = await User.findOne({ email: payload.email });
  if (existing) {
    throw new ApiError(409, 'A user with this email already exists.');
  }

  if (req.file) {
    payload.profileImage = `/uploads/avatars/${req.file.filename}`;
  }

  // Attach default onboarding tasks, training sessions (video + PDF), and monthly targets for new employees/managers
  if (['employee', 'manager'].includes(payload.role || 'employee')) {
    const starter = getDefaultStarterPack();
    payload.tasks = payload.tasks || starter.tasks;
    payload.trainings = payload.trainings || starter.trainings;
    payload.monthlyTargets = payload.monthlyTargets || starter.monthlyTargets;
  }

  const newUser = await User.create(payload);

  await logActivity({
    action: 'USER_CREATED',
    performedBy: req.user._id,
    targetUser: newUser,
    details: `Created ${newUser.role} profile (${newUser.department || 'No Department'})`,
  });

  res.status(201).json({
    success: true,
    message: 'User profile created successfully',
    data: {
      user: newUser,
    },
  });
});

/**
 * PUT /api/users/:id
 * Update an existing user profile
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  if (req.user.role === 'hr' && (user.role === 'admin' || req.body.role === 'admin')) {
    throw new ApiError(403, 'HR members cannot modify Admin accounts or assign the Admin role.');
  }

  if (user._id.equals(req.user._id)) {
    if (req.body.status && req.body.status !== 'active') {
      throw new ApiError(400, 'You cannot deactivate your own active account.');
    }
    if (req.body.role && req.body.role !== user.role) {
      throw new ApiError(400, 'You cannot change your own role.');
    }
  }

  if (req.body.email && req.body.email !== user.email) {
    const emailTaken = await User.findOne({
      email: req.body.email,
      _id: { $ne: user._id },
    });
    if (emailTaken) {
      throw new ApiError(409, 'A user with this email already exists.');
    }
  }

  const previousStatus = user.status;
  const changedFields = [];

  const updatableFields = [
    'fullName',
    'email',
    'password',
    'phone',
    'profileImage',
    'department',
    'designation',
    'role',
    'joiningDate',
    'status',
    'bio',
    'skills',
  ];

  for (const key of updatableFields) {
    if (Object.prototype.hasOwnProperty.call(req.body, key)) {
      user[key] = req.body[key] ?? (key === 'joiningDate' ? null : '');
      if (key !== 'password') {
        changedFields.push(key);
      }
    }
  }

  if (req.file) {
    user.profileImage = `/uploads/avatars/${req.file.filename}`;
    if (!changedFields.includes('profileImage')) {
      changedFields.push('profileImage');
    }
  }

  await user.save();

  if (previousStatus !== user.status) {
    await logActivity({
      action: 'STATUS_CHANGED',
      performedBy: req.user._id,
      targetUser: user,
      details: `Changed status from ${previousStatus} to ${user.status}`,
    });
  } else {
    await logActivity({
      action: 'USER_UPDATED',
      performedBy: req.user._id,
      targetUser: user,
      details:
        changedFields.length > 0
          ? `Updated profile fields: ${changedFields.join(', ')}`
          : 'Updated user profile',
    });
  }

  res.status(200).json({
    success: true,
    message: 'User profile updated successfully',
    data: {
      user: user.toJSON(),
    },
  });
});

/**
 * PATCH /api/users/:id/status
 * Activate or deactivate a user account
 */
const updateUserStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  if (user._id.equals(req.user._id)) {
    throw new ApiError(400, 'You cannot deactivate or change status of your own account.');
  }

  if (req.user.role === 'hr' && user.role === 'admin') {
    throw new ApiError(403, 'HR members cannot change the status of an Admin account.');
  }

  const previousStatus = user.status;
  if (previousStatus === status) {
    return res.status(200).json({
      success: true,
      message: `User is already ${status}`,
      data: { user },
    });
  }

  user.status = status;
  await user.save();

  await logActivity({
    action: 'STATUS_CHANGED',
    performedBy: req.user._id,
    targetUser: user,
    details: `Changed account status from ${previousStatus} to ${status}`,
  });

  return res.status(200).json({
    success: true,
    message: `User account ${status === 'active' ? 'activated' : 'deactivated'} successfully`,
    data: {
      user,
    },
  });
});

/**
 * POST /api/users/:id/avatar
 * Upload and attach profile photo to a user
 */
const uploadUserAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, 'Please upload a valid image file (JPEG, PNG, or WEBP).');
  }

  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  if (req.user.role === 'hr' && user.role === 'admin') {
    throw new ApiError(403, 'HR members cannot modify Admin accounts.');
  }

  user.profileImage = `/uploads/avatars/${req.file.filename}`;
  await user.save();

  await logActivity({
    action: 'USER_UPDATED',
    performedBy: req.user._id,
    targetUser: user,
    details: 'Uploaded new profile image',
  });

  res.status(200).json({
    success: true,
    message: 'Profile image updated successfully',
    data: {
      user,
    },
  });
});

/**
 * DELETE /api/users/:id
 * Permanently delete user profile (Admin only)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new ApiError(404, 'User profile not found.');
  }

  if (user._id.equals(req.user._id)) {
    throw new ApiError(400, 'You cannot delete your own active account.');
  }

  const snapshotUser = {
    _id: null,
    fullName: user.fullName,
    email: user.email,
  };
  const departmentLabel = user.department || 'Unassigned';

  await user.deleteOne();

  await logActivity({
    action: 'USER_DELETED',
    performedBy: req.user._id,
    targetUser: snapshotUser,
    details: `Deleted ${user.role} profile from ${departmentLabel}`,
  });

  res.status(200).json({
    success: true,
    message: 'User profile deleted successfully',
  });
});

/**
 * POST /api/users/:id/tasks
 * Admin/HR assigns a new task to a user
 */
const addTaskToUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User profile not found.');

  user.tasks.unshift(req.body);
  await user.save();

  await logActivity({
    action: 'USER_UPDATED',
    performedBy: req.user._id,
    targetUser: user,
    details: `Assigned task: "${req.body.title}"`,
  });

  res.status(201).json({
    success: true,
    message: 'Task assigned successfully',
    data: { user },
  });
});

/**
 * DELETE /api/users/:id/tasks/:taskId
 */
const removeTaskFromUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User profile not found.');

  const task = user.tasks.id(req.params.taskId);
  if (!task) throw new ApiError(404, 'Task not found.');

  task.deleteOne();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Task removed',
    data: { user },
  });
});

/**
 * POST /api/users/:id/trainings
 * Admin/HR enrolls user in a training course
 */
const addTrainingToUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User profile not found.');

  const status =
    req.body.progress >= 100
      ? 'completed'
      : req.body.progress > 0
      ? 'in_progress'
      : 'not_started';

  user.trainings.unshift({ ...req.body, status });
  await user.save();

  await logActivity({
    action: 'USER_UPDATED',
    performedBy: req.user._id,
    targetUser: user,
    details: `Assigned training course: "${req.body.courseTitle}"`,
  });

  res.status(201).json({
    success: true,
    message: 'Training course assigned',
    data: { user },
  });
});

/**
 * DELETE /api/users/:id/trainings/:trainingId
 */
const removeTrainingFromUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User profile not found.');

  const course = user.trainings.id(req.params.trainingId);
  if (!course) throw new ApiError(404, 'Training course not found.');

  course.deleteOne();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Training course removed',
    data: { user },
  });
});

/**
 * POST /api/users/:id/targets
 * Admin/HR sets a monthly target for a user
 */
const addTargetToUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User profile not found.');

  const status =
    req.body.achievedValue >= req.body.targetValue ? 'achieved' : req.body.status || 'on_track';

  user.monthlyTargets.unshift({ ...req.body, status });
  await user.save();

  await logActivity({
    action: 'USER_UPDATED',
    performedBy: req.user._id,
    targetUser: user,
    details: `Assigned monthly target: "${req.body.title}" (${req.body.month})`,
  });

  res.status(201).json({
    success: true,
    message: 'Monthly target assigned',
    data: { user },
  });
});

/**
 * DELETE /api/users/:id/targets/:targetId
 */
const removeTargetFromUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User profile not found.');

  const target = user.monthlyTargets.id(req.params.targetId);
  if (!target) throw new ApiError(404, 'Monthly target not found.');

  target.deleteOne();
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Monthly target removed',
    data: { user },
  });
});

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserStatus,
  uploadUserAvatar,
  deleteUser,
  addTaskToUser,
  removeTaskFromUser,
  addTrainingToUser,
  removeTrainingFromUser,
  addTargetToUser,
  removeTargetFromUser,
};
