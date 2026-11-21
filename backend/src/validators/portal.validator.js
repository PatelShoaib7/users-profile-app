const Joi = require('joi');

const phonePattern = /^[0-9+\-() ]{7,20}$/;

const updateOwnProfileSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(80),
  phone: Joi.string().trim().pattern(phonePattern).allow('', null).messages({
    'string.pattern.base': 'Phone number must be 7–20 digits and may include +, -, (, ) or spaces',
  }),
  bio: Joi.string().trim().max(500).allow('', null),
  skills: Joi.array().items(Joi.string().trim().max(40)).max(25),
  password: Joi.string().min(6).max(64).allow('', null),
}).min(1);

const updateTaskStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'in_progress', 'completed').required(),
});

const updateTrainingProgressSchema = Joi.object({
  progress: Joi.number().integer().min(0).max(100).required(),
});

const updateTargetProgressSchema = Joi.object({
  achievedValue: Joi.number().min(0).required(),
  status: Joi.string().valid('on_track', 'at_risk', 'achieved'),
});

const assignTaskSchema = Joi.object({
  title: Joi.string().trim().min(2).max(140).required(),
  description: Joi.string().trim().max(400).allow('').default(''),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  status: Joi.string().valid('pending', 'in_progress', 'completed').default('pending'),
  dueDate: Joi.date().iso().allow('', null).default(null),
});

const assignTrainingSchema = Joi.object({
  courseTitle: Joi.string().trim().min(2).max(140).required(),
  provider: Joi.string().trim().max(80).allow('').default('Internal Academy'),
  instructor: Joi.string().trim().max(80).allow('').default('PeoplePulse Learning Faculty'),
  description: Joi.string()
    .trim()
    .max(400)
    .allow('')
    .default('Practical training session with video walkthrough and downloadable PDF study guide.'),
  category: Joi.string()
    .valid('Technical', 'Compliance', 'Leadership', 'Product', 'Soft Skills')
    .default('Technical'),
  durationHours: Joi.number().min(1).max(200).default(4),
  videoUrl: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .default('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'),
  videoDuration: Joi.string().trim().max(30).allow('').default('15 mins'),
  pdfUrl: Joi.string()
    .trim()
    .max(500)
    .allow('')
    .default('/materials/react-redux-architecture.pdf'),
  pdfTitle: Joi.string().trim().max(120).allow('').default('Training_Session_Notes.pdf'),
  progress: Joi.number().integer().min(0).max(100).default(0),
  dueDate: Joi.date().iso().allow('', null).default(null),
});

const assignTargetSchema = Joi.object({
  title: Joi.string().trim().min(2).max(140).required(),
  month: Joi.string().trim().min(3).max(40).required(),
  targetValue: Joi.number().min(1).required(),
  achievedValue: Joi.number().min(0).default(0),
  unit: Joi.string().trim().max(30).default('items'),
  status: Joi.string().valid('on_track', 'at_risk', 'achieved').default('on_track'),
  notes: Joi.string().trim().max(300).allow('').default(''),
});

module.exports = {
  updateOwnProfileSchema,
  updateTaskStatusSchema,
  updateTrainingProgressSchema,
  updateTargetProgressSchema,
  assignTaskSchema,
  assignTrainingSchema,
  assignTargetSchema,
};
