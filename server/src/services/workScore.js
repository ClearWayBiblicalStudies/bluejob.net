import { BLUEJOB } from '../config/bluejob.js';

const WEIGHTS = {
  showed_up_as_agreed: .15, completed_agreed_scope: .15, quality_right_first_time: .20,
  stayed_on_schedule: .10, communicated_early: .08, handled_changes_fairly: .07,
  respected_agreed_budget: .05, professional_and_reliable: .07,
  trust_with_larger_job: .07, work_together_again: .06
};

export async function recalculateWorkScore(db, userId) {
  const columns = Object.keys(WEIGHTS);
  const averages = columns.map((column) => `AVG(${column}) AS ${column}`).join(',');
  const { rows: [result] } = await db.query(
    `SELECT ${averages}, COUNT(*)::int AS rating_count FROM job_ratings WHERE rated_user_id=$1`, [userId]
  );
  const count = Number(result.rating_count || 0);
  if (!count) {
    await db.query('UPDATE users SET work_score=NULL, work_score_rating_count=0, work_score_updated_at=now() WHERE id=$1', [userId]);
    return null;
  }
  const weighted = Object.entries(WEIGHTS).reduce((total, [column, weight]) => total + Number(result[column]) * weight, 0);
  const score = Math.max(BLUEJOB.SCORE_MIN, Math.min(BLUEJOB.SCORE_MAX,
    Math.round(BLUEJOB.SCORE_MIN + ((weighted - 1) / 4) * (BLUEJOB.SCORE_MAX - BLUEJOB.SCORE_MIN))));
  await db.query('UPDATE users SET work_score=$1, work_score_rating_count=$2, work_score_updated_at=now() WHERE id=$3', [score, count, userId]);
  return score;
}
