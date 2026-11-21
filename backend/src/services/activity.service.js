const { ActivityLog } = require('../models/ActivityLog');

/**
 * Records an administrative user management event in the audit log.
 */
const logActivity = async ({ action, performedBy, targetUser, details = '' }) => {
  try {
    if (!performedBy || !action) return null;

    const isUserObject =
      targetUser !== null &&
      typeof targetUser === 'object' &&
      ('fullName' in targetUser || 'email' in targetUser || '_id' in targetUser);

    const targetId = isUserObject ? targetUser._id || null : targetUser || null;
    const snapshot = isUserObject
      ? {
          fullName: targetUser.fullName || '',
          email: targetUser.email || '',
        }
      : { fullName: '', email: '' };

    return await ActivityLog.create({
      action,
      performedBy,
      targetUser: targetId,
      targetUserSnapshot: snapshot,
      details,
    });
  } catch (error) {
    // Non-blocking logging: log warning without breaking primary request
    console.error('[ActivityLog] Failed to record activity:', error.message);
    return null;
  }
};

module.exports = {
  logActivity,
};
