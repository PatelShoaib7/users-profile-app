const express = require('express');
const {
  getMyPortalData,
  updateMyProfile,
  uploadMyAvatar,
  updateMyTaskStatus,
  updateMyTrainingProgress,
  updateMyTargetProgress,
} = require('../controllers/portal.controller');
const { protect } = require('../middleware/auth.middleware');
const { uploadAvatar } = require('../middleware/upload.middleware');
const validate = require('../middleware/validate.middleware');
const {
  updateOwnProfileSchema,
  updateTaskStatusSchema,
  updateTrainingProgressSchema,
  updateTargetProgressSchema,
} = require('../validators/portal.validator');

const router = express.Router();

// Accessible to any authenticated active user
router.use(protect);

router.get('/me', getMyPortalData);
router.put('/profile', validate(updateOwnProfileSchema), updateMyProfile);
router.post('/avatar', uploadAvatar.single('avatar'), uploadMyAvatar);
router.patch('/tasks/:taskId', validate(updateTaskStatusSchema), updateMyTaskStatus);
router.patch('/trainings/:trainingId', validate(updateTrainingProgressSchema), updateMyTrainingProgress);
router.patch('/targets/:targetId', validate(updateTargetProgressSchema), updateMyTargetProgress);

module.exports = router;
