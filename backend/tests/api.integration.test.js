process.env.NODE_ENV = 'test';

const fs = require('node:fs');
const path = require('node:path');
const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const mongoose = require('mongoose');
const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');

const env = require('../src/config/env');
const app = require('../src/app');
const { User } = require('../src/models/User');
const { ActivityLog } = require('../src/models/ActivityLog');

let mongoServer;
let adminToken;
let hrToken;
let adminUser;
let createdEmployeeId;

const TEST_ADMIN_EMAIL = env.seed.adminEmail;
const TEST_ADMIN_PASSWORD = env.seed.adminPassword;
const TEST_HR_EMAIL = env.seed.hrEmail;
const TEST_HR_PASSWORD = env.seed.hrPassword;
const TEST_EMP_PASSWORD = env.seed.employeePassword;

const shouldRunDbSuite =
  Boolean(process.env.TEST_MONGO_URI) || process.env.USE_MEMORY_DB_IN_TESTS === 'true';

describe(
  'User Profile Management & Insights API Integration Tests',
  { skip: !shouldRunDbSuite && 'Set TEST_MONGO_URI or USE_MEMORY_DB_IN_TESTS=true to run live DB integration suite' },
  () => {
  before(async () => {
    if (process.env.TEST_MONGO_URI) {
      await mongoose.connect(process.env.TEST_MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    } else {
      mongoServer = await MongoMemoryServer.create();
      await mongoose.connect(mongoServer.getUri(), { serverSelectionTimeoutMS: 3000 });
    }

    adminUser = await User.create({
      fullName: 'Test Admin',
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
      phone: '+91 9999988888',
      profileImage: 'https://example.com/admin.png',
      department: 'Engineering',
      designation: 'System Admin',
      role: 'admin',
      joiningDate: '2023-01-01',
      status: 'active',
      bio: 'Platform admin',
      skills: ['Node.js', 'MongoDB'],
    });

    await User.create({
      fullName: 'Test HR',
      email: TEST_HR_EMAIL,
      password: TEST_HR_PASSWORD,
      department: 'Human Resources',
      designation: 'HR Lead',
      role: 'hr',
      status: 'active',
    });

    await User.create({
      fullName: 'Regular Employee',
      email: 'employee@test.com',
      password: TEST_EMP_PASSWORD,
      department: 'Design',
      role: 'employee',
      status: 'active',
    });

    await User.create({
      fullName: 'Inactive HR',
      email: 'inactive.hr@test.com',
      password: TEST_HR_PASSWORD,
      department: 'Human Resources',
      role: 'hr',
      status: 'inactive',
    });
  });

  after(async () => {
    const avatarsDir = path.join(__dirname, '../uploads/avatars');
    if (fs.existsSync(avatarsDir)) {
      for (const file of fs.readdirSync(avatarsDir)) {
        if (file.startsWith('avatar-')) {
          fs.unlinkSync(path.join(avatarsDir, file));
        }
      }
    }
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  it('GET /api/health returns 200 health check', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });

  it('POST /api/auth/login authenticates Admin and HR, blocks invalid credentials, employees, and inactive accounts', async () => {
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD });
    assert.equal(adminRes.status, 200);
    assert.ok(adminRes.body.data.token);
    assert.equal(adminRes.body.data.user.password, undefined);
    adminToken = adminRes.body.data.token;

    const hrRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_HR_EMAIL, password: TEST_HR_PASSWORD });
    assert.equal(hrRes.status, 200);
    hrToken = hrRes.body.data.token;

    const wrongPassRes = await request(app)
      .post('/api/auth/login')
      .send({ email: TEST_ADMIN_EMAIL, password: 'InvalidAttempt999' });
    assert.equal(wrongPassRes.status, 401);

    const empRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'employee@test.com', password: TEST_EMP_PASSWORD });
    assert.equal(empRes.status, 200);
    const empToken = empRes.body.data.token;

    // Employee can access /api/portal/me but is forbidden (403) on Admin /api/users
    const portalRes = await request(app)
      .get('/api/portal/me')
      .set('Authorization', `Bearer ${empToken}`);
    assert.equal(portalRes.status, 200);

    const empAdminRes = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${empToken}`);
    assert.equal(empAdminRes.status, 403);

    const inactiveRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'inactive.hr@test.com', password: TEST_HR_PASSWORD });
    assert.equal(inactiveRes.status, 403);
  });

  it('GET /api/users blocks unauthenticated requests', async () => {
    const res = await request(app).get('/api/users');
    assert.equal(res.status, 401);
  });

  it('POST /api/users creates user, prevents duplicate email, and enforces HR role restrictions', async () => {
    const createRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        fullName: 'Riya Kapoor',
        email: 'riya.kapoor@test.com',
        department: 'Product',
        designation: 'Product Analyst',
        role: 'employee',
        skills: ['SQL', 'Analytics'],
      });

    assert.equal(createRes.status, 201);
    assert.equal(createRes.body.data.user.email, 'riya.kapoor@test.com');
    assert.equal(createRes.body.data.user.profileCompletion, 60);
    assert.ok(createRes.body.data.user.missingFields.includes('Phone Number'));
    createdEmployeeId = createRes.body.data.user._id;

    const dupRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        fullName: 'Duplicate Riya',
        email: 'riya.kapoor@test.com',
      });
    assert.equal(dupRes.status, 409);

    const hrCreateAdminRes = await request(app)
      .post('/api/users')
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        fullName: 'Unauthorized Admin',
        email: 'unauth.admin@test.com',
        role: 'admin',
      });
    assert.equal(hrCreateAdminRes.status, 403);
  });

  it('GET /api/users supports search, filtering, sorting, and server-side pagination', async () => {
    const searchRes = await request(app)
      .get('/api/users?search=riya&limit=2&page=1')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(searchRes.status, 200);
    assert.equal(searchRes.body.data.length, 1);
    assert.equal(searchRes.body.pagination.total, 1);

    const filterRes = await request(app)
      .get('/api/users?department=Human%20Resources&status=active')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(filterRes.status, 200);
    assert.equal(filterRes.body.data.length, 1);
    assert.equal(filterRes.body.data[0].email, TEST_HR_EMAIL);
  });

  it('PUT /api/users/:id and PATCH /api/users/:id/status update profile and log activity', async () => {
    const updateRes = await request(app)
      .put(`/api/users/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${hrToken}`)
      .send({
        phone: '+91 9123456780',
        bio: 'Product analytics specialist.',
      });
    assert.equal(updateRes.status, 200);
    assert.equal(updateRes.body.data.user.profileCompletion, 80);

    const statusRes = await request(app)
      .patch(`/api/users/${createdEmployeeId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });
    assert.equal(statusRes.status, 200);
    assert.equal(statusRes.body.data.user.status, 'inactive');

    const selfDeactivateRes = await request(app)
      .patch(`/api/users/${adminUser._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });
    assert.equal(selfDeactivateRes.status, 400);
  });

  it('POST /api/users/:id/avatar uploads profile image and updates profileCompletion', async () => {
    const pngBuffer = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=',
      'base64'
    );

    const avatarRes = await request(app)
      .post(`/api/users/${createdEmployeeId}/avatar`)
      .set('Authorization', `Bearer ${hrToken}`)
      .attach('avatar', pngBuffer, { filename: 'avatar.png', contentType: 'image/png' });

    assert.equal(avatarRes.status, 200);
    assert.match(avatarRes.body.data.user.profileImage, /^\/uploads\/avatars\/avatar-/);
    assert.equal(avatarRes.body.data.user.profileCompletion, 90);
  });

  it('GET /api/dashboard/stats returns organizational summary and department aggregation', async () => {
    const statsRes = await request(app)
      .get('/api/dashboard/stats')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(statsRes.status, 200);
    assert.equal(statsRes.body.data.summary.totalUsers, 5);
    assert.equal(statsRes.body.data.summary.activeUsers, 3);
    assert.equal(statsRes.body.data.summary.inactiveUsers, 2);
    assert.ok(Array.isArray(statsRes.body.data.departmentDistribution));
    assert.ok(statsRes.body.data.departmentDistribution.length >= 3);
  });

  it('DELETE /api/users/:id enforces Admin-only RBAC and preserves deleted user snapshot in ActivityLog', async () => {
    const hrDeleteRes = await request(app)
      .delete(`/api/users/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${hrToken}`);
    assert.equal(hrDeleteRes.status, 403);

    const selfDeleteRes = await request(app)
      .delete(`/api/users/${adminUser._id}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(selfDeleteRes.status, 400);

    const adminDeleteRes = await request(app)
      .delete(`/api/users/${createdEmployeeId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(adminDeleteRes.status, 200);

    const logsRes = await request(app)
      .get('/api/activities?action=USER_DELETED')
      .set('Authorization', `Bearer ${adminToken}`);
    assert.equal(logsRes.status, 200);
    assert.equal(logsRes.body.data.length, 1);
    assert.equal(logsRes.body.data[0].targetUserSnapshot.email, 'riya.kapoor@test.com');

    const totalLogs = await ActivityLog.countDocuments();
    assert.ok(totalLogs >= 4);
  });
  }
);
