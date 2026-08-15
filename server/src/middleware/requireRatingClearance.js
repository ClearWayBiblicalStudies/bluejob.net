import { pool } from '../lib/db.js';

export async function requireRatingClearance(req, res, next) {
  const { rows } = await pool.query(
    `SELECT j.id FROM jobs j
     LEFT JOIN bids accepted ON accepted.job_id=j.id AND accepted.status='ACCEPTED'
     WHERE j.status='COMPLETED' AND (j.owner_id=$1 OR accepted.bidder_id=$1)
     AND NOT EXISTS (SELECT 1 FROM job_ratings r WHERE r.job_id=j.id AND r.rated_by_user_id=$1)
     LIMIT 1`, [req.user.sub]
  );
  if (rows[0]) return res.status(423).json({ error: 'RATING_REQUIRED', jobId: rows[0].id, message: 'Complete your required Work Score rating before starting new work.' });
  next();
}
