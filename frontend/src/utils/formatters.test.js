import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getInitials,
  getYoutubeEmbedUrl,
  resolveAvatarUrl,
  resolveMaterialDownloadUrl,
  resolveMaterialViewUrl,
  toDateInputValue,
} from './formatters.js';
import { calculateUserWorkspaceProgress } from './portalProgress.js';

test('getInitials extracts two-letter initials cleanly', () => {
  assert.equal(getInitials('Shoaib Patel'), 'SP');
  assert.equal(getInitials('Ananya'), 'AN');
  assert.equal(getInitials(''), 'U');
});

test('toDateInputValue converts ISO date to YYYY-MM-DD', () => {
  assert.equal(toDateInputValue('2024-02-05T00:00:00.000Z'), '2024-02-05');
  assert.equal(toDateInputValue(''), '');
  assert.equal(toDateInputValue('invalid-date'), '');
});

test('resolveAvatarUrl preserves relative upload paths and external URLs', () => {
  assert.equal(resolveAvatarUrl(''), '');
  assert.equal(resolveAvatarUrl('/uploads/avatars/a.png'), '/uploads/avatars/a.png');
  assert.equal(resolveAvatarUrl('https://example.com/p.jpg'), 'https://example.com/p.jpg');
});

test('resolveMaterialViewUrl and resolveMaterialDownloadUrl build valid PDF view & download links', () => {
  assert.equal(
    resolveMaterialViewUrl('/materials/design-systems-handbook.pdf'),
    '/materials/design-systems-handbook.pdf'
  );
  assert.equal(
    resolveMaterialDownloadUrl('/materials/design-systems-handbook.pdf', 'Guide.pdf'),
    '/materials/design-systems-handbook.pdf/download?name=Guide.pdf'
  );
});

test('getYoutubeEmbedUrl parses YouTube watch and short links cleanly', () => {
  assert.equal(
    getYoutubeEmbedUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'),
    'https://www.youtube.com/embed/dQw4w9WgXcQ'
  );
  assert.equal(getYoutubeEmbedUrl('https://example.com/video.mp4'), null);
});

test('calculateUserWorkspaceProgress computes overallPct and 4 pillar breakdowns accurately', () => {
  const sampleProfile = {
    profileCompletion: 80,
    missingFields: ['Phone Number', 'Bio'],
    tasks: [{ status: 'completed' }, { status: 'pending' }],
    trainings: [{ progress: 100, status: 'completed' }, { progress: 50, status: 'in_progress' }],
    monthlyTargets: [{ targetValue: 4, achievedValue: 4, status: 'achieved' }],
  };

  const progress = calculateUserWorkspaceProgress(sampleProfile, null);
  assert.equal(progress.pillars.profile.pct, 80);
  assert.equal(progress.pillars.tasks.pct, 50);
  assert.equal(progress.pillars.trainings.pct, 75);
  assert.equal(progress.pillars.targets.pct, 100);
  assert.equal(progress.overallPct, 76);
});
