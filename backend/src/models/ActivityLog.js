const mongoose = require('mongoose');

const ACTIVITY_ACTIONS = [
  'USER_CREATED',
  'USER_UPDATED',
  'USER_DELETED',
  'STATUS_CHANGED',
];

const activityLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ACTIVITY_ACTIONS,
      required: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    targetUserSnapshot: {
      fullName: { type: String, default: '' },
      email: { type: String, default: '' },
    },
    details: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });
activityLogSchema.index({ targetUser: 1, createdAt: -1 });

const ActivityLog = mongoose.model('ActivityLog', activityLogSchema);

module.exports = {
  ActivityLog,
  ACTIVITY_ACTIONS,
};
