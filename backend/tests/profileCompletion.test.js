process.env.NODE_ENV = 'test';

const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');
const env = require('../src/config/env');
const { evaluateProfileCompletion } = require('../src/services/profileCompletion');

test('env loader reads required configuration from .env files without hardcoded secrets', () => {
  assert.ok(env.jwtSecret.length >= 16);
  assert.ok(env.mongoUri.startsWith('mongodb://') || env.mongoUri.startsWith('mongodb+srv://'));
  assert.equal(env.nodeEnv, 'test');
});

test('evaluateProfileCompletion returns 100% and empty missingFields for complete profile', () => {
  const completeUser = {
    fullName: 'Shoaib Patel',
    email: 'shoaib@company.com',
    phone: '+91 9876543210',
    profileImage: '/uploads/avatars/avatar.png',
    department: 'Engineering',
    designation: 'Senior Developer',
    role: 'admin',
    joiningDate: new Date('2023-05-01'),
    bio: 'Building practical MERN stack platforms.',
    skills: ['React', 'Node.js', 'MongoDB'],
  };

  const result = evaluateProfileCompletion(completeUser);
  assert.equal(result.percentage, 100);
  assert.equal(result.completedCount, 10);
  assert.deepEqual(result.missingFields, []);
});

test('evaluateProfileCompletion identifies missing fields and computes exact percentage', () => {
  const partialUser = {
    fullName: 'Neha Kulkarni',
    email: 'neha@company.com',
    phone: '',
    profileImage: '',
    department: 'Engineering',
    designation: 'Frontend Developer',
    role: 'employee',
    joiningDate: '2024-02-05',
    bio: '   ',
    skills: [],
  };

  const result = evaluateProfileCompletion(partialUser);
  assert.equal(result.percentage, 60);
  assert.deepEqual(result.missingFields, [
    'Phone Number',
    'Profile Image',
    'Bio',
    'Skills',
  ]);
});

test('GET /api/health returns 200 and structured JSON envelope', async () => {
  const res = await request(app).get('/api/health');
  assert.equal(res.status, 200);
  assert.equal(res.body.success, true);
  assert.ok(res.body.timestamp);
});

test('POST /api/auth/login validates input via Joi middleware (400 Bad Request)', async () => {
  const res = await request(app)
    .post('/api/auth/login')
    .send({ email: 'not-an-email', password: '123' });

  assert.equal(res.status, 400);
  assert.equal(res.body.success, false);
  assert.ok(Array.isArray(res.body.errors));
});

test('Protected endpoints reject missing or invalid JWT tokens (401 Unauthorized)', async () => {
  const missingRes = await request(app).get('/api/users');
  assert.equal(missingRes.status, 401);

  const invalidRes = await request(app)
    .get('/api/dashboard/stats')
    .set('Authorization', 'Bearer invalid.jwt.token');
  assert.equal(invalidRes.status, 401);
});

test('Unknown API route returns centralized 404 JSON error', async () => {
  const res = await request(app).get('/api/unknown-endpoint');
  assert.equal(res.status, 404);
  assert.equal(res.body.success, false);
});
