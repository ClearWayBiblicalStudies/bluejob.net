import { Router } from 'express';
import { pool } from '../lib/db.js';
import { requireAuth, requireRole } from '../lib/auth.js';
const router = Router(); router.use(requireAuth, requireRole('SUPER_ADMIN'));
router.get('/summary', async (_,res) => { const [u,o,e] = await Promise.all([pool.query('SELECT count(*)::int AS count FROM users'),pool.query('SELECT id,name FROM organizations ORDER BY name'),pool.query("SELECT count(*)::int AS count FROM evidence WHERE status='Pending Verification'")]); res.json({ users:u.rows[0].count, organizations:o.rows, openVerification:e.rows[0].count }); });
export default router;
