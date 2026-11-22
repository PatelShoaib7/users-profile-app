const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { evaluateProfileCompletion } = require('../services/profileCompletion');

const DEPARTMENTS = [
  'Engineering',
  'Human Resources',
  'Product',
  'Design',
  'Marketing',
  'Sales',
  'Finance',
  'Operations',
];

const ROLES = ['admin', 'hr', 'manager', 'employee'];
const STATUSES = ['active', 'inactive'];

const taskSubSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    description: { type: String, trim: true, maxlength: 400, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending',
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const trainingSubSchema = new mongoose.Schema(
  {
    courseTitle: { type: String, required: true, trim: true, maxlength: 140 },
    provider: { type: String, trim: true, maxlength: 80, default: 'Internal Academy' },
    instructor: {
      type: String,
      trim: true,
      maxlength: 80,
      default: 'PeoplePulse Learning Faculty',
    },
    description: {
      type: String,
      trim: true,
      maxlength: 400,
      default: 'Hands-on session covering practical workflows, architecture standards, and key takeaways.',
    },
    category: {
      type: String,
      enum: ['Technical', 'Compliance', 'Leadership', 'Product', 'Soft Skills'],
      default: 'Technical',
    },
    durationHours: { type: Number, min: 1, max: 200, default: 4 },
    videoUrl: {
      type: String,
      trim: true,
      default: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    },
    videoDuration: { type: String, trim: true, default: '15 mins' },
    pdfUrl: {
      type: String,
      trim: true,
      default: '/materials/leadership-onboarding-handbook.pdf',
    },
    pdfTitle: {
      type: String,
      trim: true,
      default: 'Session_Reference_Handbook.pdf',
    },
    progress: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started',
    },
    dueDate: { type: Date, default: null },
  },
  { timestamps: true }
);

const monthlyTargetSubSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 140 },
    month: { type: String, required: true, trim: true, maxlength: 40 },
    targetValue: { type: Number, required: true, min: 1 },
    achievedValue: { type: Number, default: 0, min: 0 },
    unit: { type: String, trim: true, maxlength: 30, default: 'items' },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'on_track', 'at_risk', 'achieved'],
      default: 'not_started',
    },
    notes: { type: String, trim: true, maxlength: 300, default: '' },
  },
  { timestamps: true }
);

const attendanceLogSubSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    checkIn: { type: String, trim: true, default: '09:05 AM' },
    checkOut: { type: String, trim: true, default: '06:15 PM' },
    status: {
      type: String,
      enum: ['present', 'late', 'absent', 'leave'],
      default: 'present',
    },
    lateByMinutes: { type: Number, min: 0, default: 0 },
    remark: { type: String, trim: true, maxlength: 200, default: '' },
  },
  { _id: true }
);

const attendanceSummarySubSchema = new mongoose.Schema(
  {
    month: { type: String, trim: true, default: 'November 2026' },
    workingDays: { type: Number, min: 0, default: 22 },
    presentDays: { type: Number, min: 0, default: 20 },
    absentDays: { type: Number, min: 0, default: 0 },
    leaveDays: { type: Number, min: 0, default: 2 },
    lateMarks: { type: Number, min: 0, default: 0 },
    avgCheckInTime: { type: String, trim: true, default: '09:10 AM' },
    logs: { type: [attendanceLogSubSchema], default: [] },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [80, 'Full name cannot exceed 80 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    profileImage: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      enum: {
        values: ['', ...DEPARTMENTS],
        message: '{VALUE} is not a supported department',
      },
      default: '',
    },
    designation: {
      type: String,
      trim: true,
      maxlength: [80, 'Designation cannot exceed 80 characters'],
      default: '',
    },
    role: {
      type: String,
      enum: {
        values: ROLES,
        message: '{VALUE} is not a valid role',
      },
      default: 'employee',
    },
    joiningDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: STATUSES,
        message: '{VALUE} is not a valid account status',
      },
      default: 'active',
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    profileCompletion: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    tasks: {
      type: [taskSubSchema],
      default: [],
    },
    trainings: {
      type: [trainingSubSchema],
      default: [],
    },
    monthlyTargets: {
      type: [monthlyTargetSubSchema],
      default: [],
    },
    attendance: {
      type: attendanceSummarySubSchema,
      default: () => ({}),
    },
    monthlyBudgetAllocation: {
      type: Number,
      min: 0,
      default: 85000,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete ret.password;
        delete ret.__v;
        const completion = evaluateProfileCompletion(ret);
        ret.profileCompletion = completion.percentage;
        ret.missingFields = completion.missingFields;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

userSchema.index({ fullName: 1 });
userSchema.index({ department: 1, status: 1, role: 1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ updatedAt: -1 });
userSchema.index({ profileCompletion: -1 });

userSchema.pre('save', async function preSave() {
  if (Array.isArray(this.skills)) {
    this.skills = [
      ...new Set(this.skills.map((s) => String(s).trim()).filter(Boolean)),
    ];
  }

  this.profileCompletion = evaluateProfileCompletion(this).percentage;

  if (this.isModified('password')) {
    const saltRounds = 10;
    this.password = await bcrypt.hash(this.password, saltRounds);
  }
});

userSchema.methods.comparePassword = async function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  DEPARTMENTS,
  ROLES,
  STATUSES,
};
