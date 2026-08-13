import { Router } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import { pool } from '../lib/db.js';
import { requireAuth } from '../lib/auth.js';
import { scanFile } from '../lib/malware.js';
const uploadDirectory = path.resolve(process.env.UPLOAD_DIR || 'uploads');
fs.mkdirSync(uploadDirectory, { recursive: true });
const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);
const upload = multer({
  dest: uploadDirectory,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => allowedMimeTypes.has(file.mimetype)
    ? callback(null, true)
    : callback(new Error('Only PDF, JPEG, PNG, or WebP files are allowed')),
});
const router = Router(); router.use(requireAuth);
router.get('/', async (req, res) => { const { rows } = await pool.query('SELECT * FROM passports WHERE user_id=$1', [req.user.sub]); res.json({ passport: rows[0] || null }); });
router.put('/', async (req, res) => {
  const p = req.body;
  const { rows } = await pool.query(`INSERT INTO passports (user_id,name,location,travel_radius,trade,worker_type,crew_size,years_experience,skills,availability,tools,transportation,history) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT (user_id) DO UPDATE SET name=EXCLUDED.name,location=EXCLUDED.location,travel_radius=EXCLUDED.travel_radius,trade=EXCLUDED.trade,worker_type=EXCLUDED.worker_type,crew_size=EXCLUDED.crew_size,years_experience=EXCLUDED.years_experience,skills=EXCLUDED.skills,availability=EXCLUDED.availability,tools=EXCLUDED.tools,transportation=EXCLUDED.transportation,history=EXCLUDED.history,updated_at=now() RETURNING *`, [req.user.sub,p.name,p.location,p.travelRadius,p.trade,p.workerType,p.crewSize,p.yearsExperience,p.skills,p.availability,p.tools,p.transportation,JSON.stringify(p.history || [])]);
  res.json({ passport: rows[0] });
});
router.get('/evidence', async (req,res) => { const { rows } = await pool.query('SELECT id,type,original_name AS file,status,created_at FROM evidence WHERE user_id=$1 ORDER BY created_at DESC',[req.user.sub]); res.json({ evidence: rows }); });
router.post('/evidence', upload.single('file'), async (req,res) => { if (!req.file) return res.status(400).json({ error:'A document is required' }); const scan=await scanFile(req.file.path); if(scan.status==='Rejected') { const safeUnlinkPath=path.join(uploadDirectory,path.basename(req.file.path)); fs.unlink(safeUnlinkPath, () => {}); return res.status(422).json({error:'File failed malware scan'}); } const { rows } = await pool.query('INSERT INTO evidence (user_id,type,original_name,stored_name,status,sha256) VALUES ($1,$2,$3,$4,$5,$6) RETURNING id,type,original_name AS file,status,created_at',[req.user.sub,req.body.type,req.file.originalname,req.file.filename,scan.status,scan.sha256]); res.status(201).json({ evidence: rows[0] }); });
export default router;
