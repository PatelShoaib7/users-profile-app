const Joi = require('joi');
const env = require('../config/env');
const { DEPARTMENTS, ROLES, STATUSES } = require('../models/User');

const phonePattern = /^[0-9+\-() ]{7,20}$/;

const baseProfileFields = {
  phone: Joi.string()
    .trim()
    .pattern(phonePattern)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Phone number must be 7–20 digits and may include +, -, (, ) or spaces',
    }),
  profileImage: Joi.string().trim().max(500).allow('', null),
  department: Joi.string()
    .valid('', ...DEPARTMENTS)
    .allow(null)
    .messages({
      'any.only': `Department must be one of: ${DEPARTMENTS.join(', ')}`,
    }),
  designation: Joi.string().trim().max(80).allow('', null),
  role: Joi.string().valid(...ROLES),
  joiningDate: Joi.date().iso().allow('', null),
  status: Joi.string().valid(...STATUSES),
  bio: Joi.string().trim().max(500).allow('', null),
  skills: Joi.array().items(Joi.string().trim().max(40)).max(25),
};

const createUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(80).required().messages({
    'string.min': 'Full name must be at least 2 characters',
    'any.required': 'Full name is required',
  }),
  email: Joi.string().trim().lowercase().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required',
  }),
  password: Joi.string().min(6).max(64).default(env.defaultNewUserPassword).messages({
    'string.min': 'Password must be at least 6 characters',
  }),
  ...baseProfileFields,
});

const updateUserSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(80),
  email: Joi.string().trim().lowercase().email(),
  password: Joi.string().min(6).max(64).allow('', null),
  ...baseProfileFields,
}).min(1);

const updateStatusSchema = Joi.object({
  status: Joi.string()
    .valid(...STATUSES)
    .required()
    .messages({
      'any.only': 'Status must be either active or inactive',
      'any.required': 'Status is required',
    }),
});

const listUsersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(8),
  search: Joi.string().trim().max(100).allow('').default(''),
  department: Joi.string().trim().allow('').default(''),
  role: Joi.string().trim().allow('').default(''),
  status: Joi.string().trim().allow('').default(''),
  sortBy: Joi.string()
    .valid('createdAt', 'updatedAt', 'fullName', 'joiningDate', 'department', 'profileCompletion')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  updateStatusSchema,
  listUsersQuerySchema,
};
