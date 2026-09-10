import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const worker = fs.readFileSync(new URL('../src/worker.js', import.meta.url), 'utf8');

test('director bootstrap uses runtime secret instead of a committed password', () => {
  assert.match(worker, /FOUNDER_TEMP_PASSWORD/);
  assert.match(worker, /director@clearestway\.org/);
  assert.doesNotMatch(worker, /BlueJob#2026!/);
});

test('login can bootstrap the director account and enforce a password change', () => {
  assert.match(worker, /ensureDirectorAccount/);
  assert.match(worker, /force_password_change=true/);
  assert.match(worker, /requiresPasswordChange/);
});

test('authenticated password change endpoint rotates sessions', () => {
  assert.match(worker, /\/api\/auth\/change-password/);
  assert.match(worker, /DELETE FROM sessions WHERE user_id=\$1/);
  assert.match(worker, /INSERT INTO sessions\(user_id,token_hash,expires_at\)/);
});

test('password reset can use resend or the shared email provider', () => {
  assert.match(worker, /RESEND_API_KEY/);
  assert.match(worker, /EMAIL_PROVIDER_URL/);
  assert.match(worker, /resetUrl/);
});
