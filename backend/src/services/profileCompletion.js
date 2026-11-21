const PROFILE_CHECKS = [
  {
    key: 'fullName',
    label: 'Full Name',
    isComplete: (u) => typeof u.fullName === 'string' && u.fullName.trim().length > 0,
  },
  {
    key: 'email',
    label: 'Email',
    isComplete: (u) => typeof u.email === 'string' && u.email.trim().length > 0,
  },
  {
    key: 'phone',
    label: 'Phone Number',
    isComplete: (u) => typeof u.phone === 'string' && u.phone.trim().length > 0,
  },
  {
    key: 'profileImage',
    label: 'Profile Image',
    isComplete: (u) => typeof u.profileImage === 'string' && u.profileImage.trim().length > 0,
  },
  {
    key: 'department',
    label: 'Department',
    isComplete: (u) => typeof u.department === 'string' && u.department.trim().length > 0,
  },
  {
    key: 'designation',
    label: 'Designation',
    isComplete: (u) => typeof u.designation === 'string' && u.designation.trim().length > 0,
  },
  {
    key: 'role',
    label: 'Role',
    isComplete: (u) => typeof u.role === 'string' && u.role.trim().length > 0,
  },
  {
    key: 'joiningDate',
    label: 'Joining Date',
    isComplete: (u) => Boolean(u.joiningDate),
  },
  {
    key: 'bio',
    label: 'Bio',
    isComplete: (u) => typeof u.bio === 'string' && u.bio.trim().length > 0,
  },
  {
    key: 'skills',
    label: 'Skills',
    isComplete: (u) =>
      Array.isArray(u.skills) && u.skills.some((skill) => typeof skill === 'string' && skill.trim().length > 0),
  },
];

/**
 * Calculates profile completion percentage and lists missing fields.
 * @param {Object} user - User document or plain object
 * @returns {{ percentage: number, completedCount: number, totalFields: number, missingFields: string[] }}
 */
const evaluateProfileCompletion = (user = {}) => {
  const missingFields = [];
  let completedCount = 0;

  for (const field of PROFILE_CHECKS) {
    if (field.isComplete(user)) {
      completedCount += 1;
    } else {
      missingFields.push(field.label);
    }
  }

  const totalFields = PROFILE_CHECKS.length;
  const percentage = Math.round((completedCount / totalFields) * 100);

  return {
    percentage,
    completedCount,
    totalFields,
    missingFields,
  };
};

module.exports = {
  PROFILE_CHECKS,
  evaluateProfileCompletion,
};
