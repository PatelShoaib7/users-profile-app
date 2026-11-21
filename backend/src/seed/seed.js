const env = require('../config/env');
const { connectDB, disconnectDB } = require('../config/db');
const { User } = require('../models/User');
const { ActivityLog } = require('../models/ActivityLog');
const { buildSampleUsers } = require('./sampleData');

/**
 * Populates Users and sample ActivityLog records using credentials from backend/.env.
 */
const seedDatabase = async ({ clearExisting = true } = {}) => {
  const sampleUsers = buildSampleUsers();

  if (clearExisting) {
    await Promise.all([User.deleteMany({}), ActivityLog.deleteMany({})]);
  }

  const createdUsers = [];
  for (const userData of sampleUsers) {
    const user = await User.create(userData);
    createdUsers.push(user);
  }

  const adminUser = createdUsers.find((u) => u.role === 'admin') || createdUsers[0];
  const hrUser = createdUsers.find((u) => u.role === 'hr') || adminUser;

  const sampleLogs = [
    {
      action: 'USER_CREATED',
      performedBy: adminUser._id,
      targetUser: hrUser._id,
      targetUserSnapshot: { fullName: hrUser.fullName, email: hrUser.email },
      details: 'Created hr profile (Human Resources)',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72),
    },
    {
      action: 'USER_CREATED',
      performedBy: hrUser._id,
      targetUser: createdUsers[5]._id,
      targetUserSnapshot: { fullName: createdUsers[5].fullName, email: createdUsers[5].email },
      details: 'Created employee profile (Engineering)',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48),
    },
    {
      action: 'USER_UPDATED',
      performedBy: hrUser._id,
      targetUser: createdUsers[3]._id,
      targetUserSnapshot: { fullName: createdUsers[3].fullName, email: createdUsers[3].email },
      details: 'Updated profile fields: designation, skills, bio',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
      action: 'STATUS_CHANGED',
      performedBy: adminUser._id,
      targetUser: createdUsers[8]._id,
      targetUserSnapshot: { fullName: createdUsers[8].fullName, email: createdUsers[8].email },
      details: 'Changed account status from active to inactive',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 12),
    },
    {
      action: 'USER_CREATED',
      performedBy: hrUser._id,
      targetUser: createdUsers[11]._id,
      targetUserSnapshot: { fullName: createdUsers[11].fullName, email: createdUsers[11].email },
      details: 'Created employee profile (Product)',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3),
    },
  ];

  await ActivityLog.insertMany(sampleLogs);

  return {
    usersCount: createdUsers.length,
    logsCount: sampleLogs.length,
  };
};

if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      const result = await seedDatabase({ clearExisting: true });
      console.log(
        `[Seed] Successfully seeded ${result.usersCount} users and ${result.logsCount} activity logs (using credentials configured in backend/.env).`
      );
      await disconnectDB();
      process.exit(0);
    } catch (error) {
      console.error('[Seed] Failed to seed database:', error.message);
      process.exit(1);
    }
  })();
}

module.exports = {
  seedDatabase,
};
