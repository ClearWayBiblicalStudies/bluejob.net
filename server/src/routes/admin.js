import { Router } from 'express';
import { pool } from '../lib/db.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { recalculateUserScore } from '../lib/score.js';
const router = Router(); router.use(requireAuth, requireRole('SUPER_ADMIN'));
router.use(async (req, res, next) => {
  const { rows } = await pool.query('SELECT mfa_enabled FROM users WHERE id=$1', [req.user.sub]);
  if (!rows[0]?.mfa_enabled) return res.status(403).json({ error: 'MFA is required for admin operations' });
  next();
});
router.get('/summary', async (_,res) => { const [u,o,e] = await Promise.all([pool.query('SELECT count(*)::int AS count FROM users'),pool.query('SELECT id,name FROM organizations ORDER BY name'),pool.query("SELECT count(*)::int AS count FROM evidence WHERE status='Pending Verification'")]); res.json({ users:u.rows[0].count, organizations:o.rows, openVerification:e.rows[0].count }); });
router.patch('/evidence/:id', async (req, res) => {
  if (!['Verified', 'Rejected'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid evidence status' });
  const { rows } = await pool.query("UPDATE evidence SET status=$1, verified_at=now(), verified_by=$2 WHERE id=$3 AND status='Pending Verification' RETURNING id,user_id,status", [req.body.status, req.user.sub, req.params.id]);
  if (!rows[0]) return res.status(404).json({ error: 'Evidence not found' });
  if (rows[0].status === 'Verified') await recalculateUserScore(rows[0].user_id);
  res.json({ evidence: rows[0] });
});
export default router;
