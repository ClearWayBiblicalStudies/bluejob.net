import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../lib/db.js';
import { signUser, requireAuth } from '../lib/auth.js';
const router = Router();

router.post('/signup', async (req, res) => {
  const { name, email, password, role = 'WORKER' } = req.body;
  if (!name || !email || !password || password.length < 8) return res.status(400).json({ error: 'Name, email and an 8-character password are required' });
  const hash = await bcrypt.hash(password, 12);
  try {
    const { rows } = await pool.query('INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,$4) RETURNING id,name,email,role,organization_id', [name, email.toLowerCase(), hash, role === 'CONTRACTOR' ? 'CONTRACTOR' : 'WORKER']);
    res.status(201).json({ user: rows[0], token: signUser(rows[0]) });
  } catch (e) { res.status(e.code === '23505' ? 409 : 500).json({ error: e.code === '23505' ? 'Email already registered' : 'Unable to create account' }); }
});
router.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  const { rows } = await pool.query('SELECT id,name,email,role,organization_id,password_hash FROM users WHERE email=$1', [String(email || '').toLowerCase()]);
  if (!rows[0] || !(await bcrypt.compare(password || '', rows[0].password_hash))) return res.status(401).json({ error: 'Invalid email or password' });
  const { password_hash, ...user } = rows[0]; res.json({ user, token: signUser(user) });
});
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await pool.query('SELECT id,name,email,role,organization_id FROM users WHERE id=$1', [req.user.sub]);
  rows[0] ? res.json({ user: rows[0] }) : res.status(401).json({ error: 'User not found' });
});
export default router;
