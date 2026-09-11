import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { passwordHash, passwordMatches, verifyTotp } from '../src/worker.js';

const worker = fs.readFileSync(new URL('../src/worker.js', import.meta.url), 'utf8');
const migration = fs.readFileSync(new URL('../migrations/000_cloudflare_canonical.sql', import.meta.url), 'utf8');
const frontendApi = fs.readFileSync(new URL('../../src/lib/api.js', import.meta.url), 'utf8');
const frontendIndex = fs.readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

test('production password hashing accepts the correct password only', async () => {
  const pepper = 'test-pepper-with-more-than-thirty-two-characters';
  const stored = await passwordHash('ValidPassword123', pepper);
  assert.match(stored, /^pbkdf2\$600000\$/);
  assert.equal(await passwordMatches('ValidPassword123', stored, pepper), true);
  assert.equal(await passwordMatches('WrongPassword123', stored, pepper), false);
});

test('malformed MFA codes are rejected', async () => {
  assert.equal(await verifyTotp('JBSWY3DPEHPK3PXP', '12x456'), false);
});

test('sessions are secure cookies and only hashes are stored', () => {
  assert.match(worker, /HttpOnly; Secure; SameSite=Lax/);
  assert.match(worker, /token_hash/);
  assert.doesNotMatch(frontendApi, /localStorage|sessionStorage|Authorization/);
});

test('canonical migration creates the deployed Worker contract', () => {
  for (const table of ['users','roles','user_roles','sessions','password_reset_tokens','companies','company_memberships','work_passports','jobs','bids']) assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}\\b`));
});

test('authentication and health routes exist in the deployed Worker', () => {
  for (const route of ['/api/auth/signup','/api/auth/login','/api/auth/forgot-password','/api/auth/reset-password','/api/auth/logout','/api/readyz']) assert.ok(worker.includes(route));
});

test('Vite builds the React application and uses same-origin API calls', () => {
  assert.match(frontendIndex, /id="root"/);
  assert.match(frontendIndex, /\/src\/main\.jsx/);
  assert.match(frontendApi, /'\/api'/);
  assert.doesNotMatch(frontendApi, /localhost:3001/);
});
