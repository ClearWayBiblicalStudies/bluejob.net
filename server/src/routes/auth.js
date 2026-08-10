import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../lib/db.js';
import { signUser, requireAuth } from '../lib/auth.js';
import crypto from 'node:crypto';
const router = Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, role = 'WORKER' } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email and an 8-character password are required' });
  const hash = await bcrypt.hash(password, 12);
  try {
    const { rows } = await pool.query('INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role,organization_id,email_verified,mfa_enabled', [name, email.toLowerCase(), hash, role === 'CONTRACTOR' ? 'CONTRACTOR' : 'WORKER']);
    res.status(201).json({ user: rows[0], token: signUser(rows[0]) });
  } catch (e) { res.status(e.code === '23505' ? 409 : 500).json({ error: e.code === '23505' ? 'Email already registered' : 'Unable to create account' }); }
});
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT id,name,email,role,organization_id,password_hash,email_verified,mfa_enabled,mfa_secret FROM users WHERE email=$1', [String(email || '').toLowerCase()]);
  if (!rows[0] || !(await bcrypt.compare(password || '', rows[0].password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
  const { password_hash, mfa_secret, ...user } = rows[0];
  if (user.mfa_enabled) return res.json({ mfaRequired: true, challenge: crypto.randomUUID(), userId: user.id });
  res.json({ user, token: signUser(user) });
});
router.post('/mfa/verify-login', async (req,res) => {
  const { rows } = await pool.query('SELECT id,name,email,role,organization_id,mfa_secret FROM users WHERE id=$1 AND mfa_enabled=true',[req.body.userId]);
  if (!rows[0] || !validTotp(rows[0].mfa_secret, req.body.code)) return res.status(401).json({error:'Invalid MFA code'});
  const {mfa_secret, ...user} = rows[0]; res.json({user, token: signUser(user)});
});
function validTotp(secret, value) {
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; let bits=''; for (const c of secret.replace(/=+$/,'').toUpperCase()) bits += alphabet.indexOf(c).toString(2).padStart(5,'0');
  const key=Buffer.alloc(Math.floor(bits.length/8)); for(let i=0;i<key.length;i++) key[i]=parseInt(bits.slice(i*8,i*8+8),2);
  const counter=Math.floor(Date.now()/30000); const b=Buffer.alloc(8); b.writeBigInt64BE(BigInt(counter));
  const h=crypto.createHmac('sha1',key).update(b).digest(); const o=h[19]&15; const n=(h.readUInt32BE(o)&0x7fffffff)%1000000;
  return String(n).padStart(6,'0')===String(value);
}
router.post('/mfa/setup', requireAuth, async (req,res) => {
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; const bytes=crypto.randomBytes(20); let bits=''; for(const b of bytes) bits+=b.toString(2).padStart(8,'0'); let secret=''; for(let i=0;i<bits.length;i+=5) secret+=alphabet[parseInt(bits.slice(i,i+5).padEnd(5,'0'),2)];
  await pool.query('UPDATE users SET mfa_secret=$1 WHERE id=$2',[secret,req.user.sub]);
  res.json({secret, otpauth:`otpauth://totp/BlueJob:${encodeURIComponent(req.user.sub)}?secret=${secret}&issuer=BlueJob`});
});
router.post('/mfa/enable', requireAuth, async (req,res) => {
  const {rows}=await pool.query('SELECT mfa_secret FROM users WHERE id=$1',[req.user.sub]); if(!rows[0]?.mfa_secret || !validTotp(rows[0].mfa_secret,req.body.code)) return res.status(400).json({error:'Invalid MFA code'});
  await pool.query('UPDATE users SET mfa_enabled=true WHERE id=$1',[req.user.sub]); res.json({enabled:true});
});
router.get('/settings', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT email,email_verified,phone,phone_verified,mfa_enabled FROM users WHERE id=$1', [req.user.sub]);
  rows[0] ? res.json({ settings: rows[0] }) : res.status(404).json({ error: 'User not found' });
});
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id,name,email,role,organization_id FROM users WHERE id=$1', [req.user.sub]);
  rows[0] ? res.json({ user: rows[0] }) : res.status(401).json({ error: 'User not found' });
});
export default router;
