import { pool } from './db.js';

export async function recalculateUserScore(userId) {
  const { rows } = await pool.query(
    `UPDATE users SET score = COALESCE((SELECT round(avg(score)::numeric, 2) FROM ratings WHERE rated_user_id=$1), 0)
     WHERE id=$1 RETURNING id, score`, [userId]);
  return rows[0];
}

export async function recalculateContractorScore(userId) {
  return recalculateUserScore(userId);
}
