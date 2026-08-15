import { Router } from 'express';
import { pool } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { recalculateWorkScore } from '../services/workScore.js';

const router = Router();
const fields = ['showedUpAsAgreed', 'completedAgreedScope', 'qualityRightFirstTime', 'stayedOnSchedule', 'communicatedEarly', 'handledChangesFairly', 'respectedAgreedBudget', 'professionalAndReliable', 'trustWithLargerJob', 'workTogetherAgain'];
const columns = ['showed_up_as_agreed', 'completed_agreed_scope', 'quality_right_first_time', 'stayed_on_schedule', 'communicated_early', 'handled_changes_fairly', 'respected_agreed_budget', 'professional_and_reliable', 'trust_with_larger_job', 'work_together_again'];
router.use(requireAuth);

async function pendingFor(userId) {
  return pool.query(
    `SELECT j.id,j.title FROM jobs j LEFT JOIN bids accepted ON accepted.job_id=j.id AND accepted.status='ACCEPTED'
     WHERE j.status='COMPLETED' AND (j.owner_id=$1 OR accepted.bidder_id=$1)
     AND NOT EXISTS (SELECT 1 FROM job_ratings r WHERE r.job_id=j.id AND r.rated_by_user_id=$1)`, [userId]
  );
}
router.get('/ratings/pending', async (req, res) => {
  const { rows } = await pendingFor(req.user.sub);
  res.json({ pending: rows });
});
router.post('/jobs/:jobId/rating', async (req, res, next) => {
  if (fields.some((field) => !Number.isInteger(req.body[field]) || req.body[field] < 1 || req.body[field] > 5)) {
    return res.status(400).json({ error: 'All Work Score rating questions must be scored from 1 to 5.' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [job] } = await client.query(
      `SELECT j.id,j.owner_id,accepted.bidder_id FROM jobs j LEFT JOIN bids accepted ON accepted.job_id=j.id AND accepted.status='ACCEPTED'
       WHERE j.id=$1 AND j.status='COMPLETED' AND ($2=j.owner_id OR $2=accepted.bidder_id)`, [req.params.jobId, req.user.sub]
    );
    if (!job || !job.bidder_id) { await client.query('ROLLBACK'); return res.status(403).json({ error: 'You cannot rate this job.' }); }
    const gc = String(job.owner_id) === String(req.user.sub);
    const values = fields.map((field) => req.body[field]);
    const { rows } = await client.query(
      `INSERT INTO job_ratings(job_id,rated_by_user_id,rated_user_id,rater_role,${columns.join(',')},private_note)
       VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
       ON CONFLICT(job_id,rated_by_user_id) DO NOTHING RETURNING id`,
      [job.id, req.user.sub, gc ? job.bidder_id : job.owner_id, gc ? 'GC' : 'SUB', ...values, req.body.privateNote || null]
    );
    if (!rows[0]) { await client.query('ROLLBACK'); return res.status(409).json({ error: 'Already rated.' }); }
    const score = await recalculateWorkScore(client, gc ? job.bidder_id : job.owner_id);
    await client.query('COMMIT');
    res.status(201).json({ success: true, workScore: score });
  } catch (error) {
    await client.query('ROLLBACK'); next(error);
  } finally { client.release(); }
});
export default router;
