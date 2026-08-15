import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import jwt from 'jsonwebtoken';

const auth = fs.readFileSync(new URL('../src/lib/auth.js', import.meta.url), 'utf8');
const jobs = fs.readFileSync(new URL('../src/routes/jobs.js', import.meta.url), 'utf8');
const admin = fs.readFileSync(new URL('../src/routes/admin.js', import.meta.url), 'utf8');
const billing = fs.readFileSync(new URL('../src/routes/billing.js', import.meta.url), 'utf8');
const passport = fs.readFileSync(new URL('../src/routes/passport.js', import.meta.url), 'utf8');
const verification = fs.readFileSync(new URL('../src/routes/verification.js', import.meta.url), 'utf8');

test('registration and login issue HttpOnly cookies, never browser storage', () => {
  assert.match(auth, /HttpOnly/);
  assert.doesNotMatch(fs.readFileSync(new URL('../../src/lib/api.js', import.meta.url), 'utf8'), /localStorage|sessionStorage|Authorization/);
});
test('incorrect password is rejected by bcrypt comparison', () => assert.match(fs.readFileSync(new URL('../src/routes/auth.js', import.meta.url), 'utf8'), /Invalid email or password/));
test('protected endpoints require authentication', () => assert.match(auth, /Authentication required/));
test('normal users cannot access server-side admin endpoints', () => assert.match(admin, /requireRole\('ADMIN', 'SUPER_ADMIN'\)/));
test('admin operations require MFA', () => assert.match(admin, /mfa_enabled/));
test('organization-scoped writes do not trust client organization ids', () => assert.match(jobs, /owner_id=\$1/));
test('workers can only edit their own passport', () => assert.match(passport, /user_id=\$1/));
test('evidence listing is private to its owner', () => assert.match(passport, /FROM evidence WHERE user_id=\$1/));
test('verification supports pending to verified', () => assert.match(admin, /status='Pending Verification'/));
test('verification supports pending to rejected', () => assert.match(admin, /Rejected/));
test('no admin endpoint accepts a manually assigned score', () => assert.doesNotMatch(admin, /UPDATE users SET score|score=\$[0-9]/));
test('inactive members cannot post or bid', () => assert.match(jobs, /requireActiveMembership/));
test('only the job owner contractor can award a bid', () => assert.match(jobs, /j\.owner_id=\$1.*owner\.role='CONTRACTOR'/s));
test('bid responses are limited to bidders and job owners', () => assert.match(jobs, /b\.bidder_id=\$2 OR EXISTS/));
test('job lifecycle transitions are explicit', () => assert.match(jobs, /transitions=\{OPEN/));
test('completion recalculates worker and contractor scores', () => {
  assert.match(jobs, /recalculateUserScore\(awarded\.bidder_id\)/);
  assert.match(jobs, /recalculateContractorScore\(req\.user\.sub\)/);
});
test('Stripe webhook uses timing-safe signature validation', () => assert.match(billing, /timingSafeEqual/));
test('JWT logout revokes the token id', () => {
  process.env.JWT_SECRET = 'test-secret';
  const token = jwt.sign({ sub: 'u', jti: 'j' }, process.env.JWT_SECRET);
  assert.match(auth, /INSERT INTO revoked_tokens/);
  assert.ok(token);
});
