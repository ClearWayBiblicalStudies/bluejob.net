import { pool } from '../lib/db.js';

export async function requireActiveMembership(req, res, next) {
  const { rows: [membership] } = await pool.query(
    `SELECT COALESCE(u.membership_status, m.status, 'NONE') AS status, u.membership_expires_at
     FROM users u LEFT JOIN memberships m ON m.user_id=u.id WHERE u.id=$1`, [req.user.sub]
  );
  const active = ['ACTIVE', 'TRIAL', 'COMPED'].includes(membership?.status);
  const current = !membership?.membership_expires_at || new Date(membership.membership_expires_at) > new Date();
  if (!active || !current) return res.status(402).json({ error: 'MEMBERSHIP_REQUIRED' });
  next();
}
