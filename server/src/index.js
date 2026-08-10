import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import auth from './routes/auth.js';
import passport from './routes/passport.js';
import admin from './routes/admin.js';
import verification from './routes/verification.js';
import jobs from './routes/jobs.js';
import billing from './routes/billing.js';
import { validateEnvironment } from './lib/config.js';
import { pool } from './lib/db.js';
const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173' }));
app.use(express.json({ verify: (req, _res, buffer) => { if (req.originalUrl === '/api/billing/webhook') req.rawBody = buffer; } }));
app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: 'draft-7', legacyHeaders: false }));
app.get('/api/health', (_,res) => res.json({ ok:true }));
app.get('/api/readiness', async (_, res) => {
  try { await pool.query('SELECT 1'); res.json({ ok: true, database: 'up' }); }
  catch { res.status(503).json({ ok: false, database: 'down' }); }
});
app.use('/api/auth', auth); app.use('/api/verification', verification);
app.use('/api/jobs', jobs); app.use('/api/billing', billing);
app.use('/api/passport', passport); app.use('/api/admin', admin);
app.use((err, _req, res, _next) => res.status(500).json({ error: 'Unexpected server error' }));
validateEnvironment();
app.listen(process.env.PORT || 3001, () => console.log(`BlueJob API listening on ${process.env.PORT || 3001}`));
