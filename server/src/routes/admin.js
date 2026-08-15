import { Router } from 'express';
import { pool } from '../lib/db.js';
import { requireAuth, requireRole } from '../lib/auth.js';
import { recalculateUserScore } from '../lib/score.js';
const router = Router(); router.use(requireAuth, requireRole('ADMIN', 'SUPER_ADMIN'));
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
async function audit(adminId, action, targetType, targetId, metadata = {}) {
  await pool.query('INSERT INTO admin_audit_log(admin_user_id,action,target_type,target_id,metadata) VALUES($1,$2,$3,$4,$5)', [adminId, action, targetType, String(targetId), metadata]);
}
router.get('/jobs', async (_req, res) => {
  const { rows } = await pool.query('SELECT id,title,description,location,budget,starts_at,status,created_at FROM jobs ORDER BY created_at DESC LIMIT 250');
  res.json({ jobs: rows });
});
router.post('/jobs', async (req, res) => {
  const { title, description, location, budget, startsAt } = req.body;
  const numericBudget = Number(budget);
  if (!title || !description || !location || !Number.isFinite(numericBudget) || numericBudget <= 0) return res.status(400).json({ error: 'title, description, location, and a positive budget are required' });
  const { rows } = await pool.query(
    `INSERT INTO jobs(owner_id,title,description,location,budget,starts_at,status) VALUES($1,$2,$3,$4,$5,$6,'OPEN') RETURNING *`,
    [req.user.sub, title, description, location, numericBudget, startsAt || null]
  );
  await audit(req.user.sub, 'PUBLISH_JOB', 'job', rows[0].id, { budget: numericBudget });
  res.status(201).json({ job: rows[0] });
});
router.delete('/jobs/:jobId', async (req, res) => {
  const { rows } = await pool.query('DELETE FROM jobs WHERE id=$1 RETURNING id,title', [req.params.jobId]);
  if (!rows[0]) return res.status(404).json({ error: 'Job not found' });
  await audit(req.user.sub, 'DELETE_JOB', 'job', rows[0].id, { title: rows[0].title });
  res.json({ success: true });
});
export default router;
