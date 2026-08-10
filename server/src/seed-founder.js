import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './lib/db.js';
if (!process.env.FOUNDER_EMAIL || !process.env.FOUNDER_PASSWORD) throw new Error('FOUNDER_EMAIL and FOUNDER_PASSWORD are required; no default password exists');
const hash = await bcrypt.hash(process.env.FOUNDER_PASSWORD, 12);
await pool.query("INSERT INTO users (name,email,password_hash,role) VALUES ($1,$2,$3,'SUPER_ADMIN') ON CONFLICT (email) DO UPDATE SET role='SUPER_ADMIN', password_hash=EXCLUDED.password_hash", ['BlueJob Founder', process.env.FOUNDER_EMAIL.toLowerCase(), hash]);
await pool.end();
console.log('Founder account seeded.');
