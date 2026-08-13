import { Router } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { pool } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';

const router = Router();
const code = () => String(crypto.randomInt(100000, 1000000));
async function issue(req, res, type) {
  const user = (await pool.query('SELECT email,phone FROM users WHERE id=$1', [req.user.sub])).rows[0];
  const value = type === 'email' ? user?.email : req.body.phone;
  if (!value) return res.status(400).json({ error: `${type} is required` });
  const raw = code();
  await pool.query(`INSERT INTO verification_codes (user_id,type,target,code_hash,expires_at)
    VALUES ($1,$2,$3,$4,now()+interval '10 minutes')`, [req.user.sub, type, value, await bcrypt.hash(raw, 10)]);
  const provider = type === 'email' ? process.env.EMAIL_PROVIDER_URL : process.env.SMS_PROVIDER_URL;
  if (!provider) {
    return res.status(202).json({ sent: false, error: 'Verification provider is not configured' });
  }
  const headers = { 'content-type': 'application/json' };
  if (process.env.VERIFICATION_PROVIDER_TOKEN) headers.authorization = 'Bearer ' + process.env.VERIFICATION_PROVIDER_TOKEN;
  const response = await fetch(provider, { method: 'POST', headers, body: JSON.stringify({ to: value, code: raw }) });
  if (!response.ok) return res.status(502).json({ sent: false, error: 'Verification provider unavailable' });
  res.status(202).json({ sent: true });
}
router.use(requireAuth);
router.post('/email/send', (req, res) => issue(req, res, 'email'));
router.post('/phone/send', (req, res) => issue(req, res, 'phone'));
router.post('/:type/confirm', async (req, res) => {
  if (!['email', 'phone'].includes(req.params.type)) return res.status(400).json({ error: 'Invalid verification type' });
  const { rows } = await pool.query(`SELECT * FROM verification_codes WHERE user_id=$1 AND type=$2 AND consumed_at IS NULL AND expires_at>now() ORDER BY created_at DESC LIMIT 1`, [req.user.sub, req.params.type]);
  if (!rows[0] || !(await bcrypt.compare(String(req.body.code || ''), rows[0].code_hash))) return res.status(400).json({ error: 'Invalid or expired code' });
  await pool.query(`UPDATE verification_codes SET consumed_at=now() WHERE id=$1`, [rows[0].id]);
  await pool.query(`UPDATE users SET ${req.params.type}_verified=true WHERE id=$1`, [req.user.sub]);
  res.json({ verified: true });
});
export default router;
