const express = require('express');
const {
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
} = require('../controllers/user.controller');
const { protect, authorize } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  listUsersQuerySchema,
} = require('../validators/user.validator');
const {
  assignTaskSchema,
  assignTrainingSchema,
  assignTargetSchema,
} = require('../validators/portal.validator');

const router = express.Router();

// All user management routes require Admin or HR authentication
router.use(protect, authorize('admin', 'hr'));

router
  .route('/')
  .get(validate(listUsersQuerySchema, 'query'), getUsers)
  .post(uploadAvatar.single('avatar'), validate(createUserSchema), createUser);

router
  .route('/:id')
  .get(getUserById)
  .put(uploadAvatar.single('avatar'), validate(updateUserSchema), updateUser)
  .delete(authorize('admin'), deleteUser);

router.patch('/:id/status', validate(updateStatusSchema), updateUserStatus);
router.post('/:id/avatar', uploadAvatar.single('avatar'), uploadUserAvatar);

// Admin/HR assignment of Tasks, Trainings, and Monthly Targets
router.post('/:id/tasks', validate(assignTaskSchema), addTaskToUser);
router.delete('/:id/tasks/:taskId', removeTaskFromUser);

router.post('/:id/trainings', validate(assignTrainingSchema), addTrainingToUser);
router.delete('/:id/trainings/:trainingId', removeTrainingFromUser);

router.post('/:id/targets', validate(assignTargetSchema), addTargetToUser);
router.delete('/:id/targets/:targetId', removeTargetFromUser);

module.exports = router;
