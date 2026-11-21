const ApiError = require('../utils/ApiError');

/**
 * Normalizes multipart/form-data fields (e.g., skills sent as JSON or CSV string)
 * before running Joi schema validation.
 */
const normalizeBody = (body) => {
  if (!body || typeof body !== 'object') return body;
  const clone = { ...body };

  if (typeof clone.skills === 'string') {
    const trimmed = clone.skills.trim();
    if (!trimmed) {
      clone.skills = [];
    } else if (trimmed.startsWith('[')) {
      try {
        clone.skills = JSON.parse(trimmed);
      } catch {
        clone.skills = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
      }
    } else {
      clone.skills = trimmed.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  if (clone.joiningDate === '') {
    clone.joiningDate = null;
  }

  if (clone.password === '') {
    delete clone.password;
  }

  return clone;
};

const validate = (schema, source = 'body') => (req, _res, next) => {
  const input = source === 'body' ? normalizeBody(req[source]) : req[source];

  const { error, value } = schema.validate(input, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const messages = error.details.map((detail) => detail.message.replace(/"/g, ''));
    return next(new ApiError(400, messages[0] || 'Validation failed', messages));
  }

  req[source] = value;
  return next();
};

module.exports = validate;
