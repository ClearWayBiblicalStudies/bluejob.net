import { Router } from 'express';
import { pool } from '../lib/db.js';
import { BLUEJOB } from '../config/bluejob.js';

const router = Router();
router.get('/healthz', async (_req, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, database: 'connected' }); }
  catch { res.status(503).json({ ok: false, database: 'unavailable' }); }
});
router.get('/api/public/platform', (_req, res) => res.json({
  brand: BLUEJOB.BRAND_NAME, scoreName: BLUEJOB.SCORE_NAME,
  foundingPrice: BLUEJOB.FOUNDING_MONTHLY_PRICE_LABEL,
  promise: 'Know the budget. Match with the right people. Get to work.'
}));
export default router;
