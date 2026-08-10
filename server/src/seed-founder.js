import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from './lib/db.js';
if (!process.env.FOUNDER_EMAIL || !process.env.FOUNDER_PASSWORD) throw new Error('FOUNDER_EMAIL and FOUNDER_PASSWORD are required; no default password exists');
const hash = await bcrypt.hash(process.env.FOUNDER_PASSWORD, 12);
const client = await pool.connect();
try {
  await client.query('BEGIN');
  await client.query("INSERT INTO organizations (name) VALUES ('Chrome Construction'), ('Gulfside Improvements') ON CONFLICT (name) DO NOTHING");
  const { rows } = await client.query("SELECT id FROM organizations WHERE name='Chrome Construction'");
  await client.query("INSERT INTO users (name,email,password_hash,role,organization_id) VALUES ($1,$2,$3,'SUPER_ADMIN',$4) ON CONFLICT (email) DO UPDATE SET role='SUPER_ADMIN', password_hash=EXCLUDED.password_hash, organization_id=EXCLUDED.organization_id", ['BlueJob Founder', process.env.FOUNDER_EMAIL.toLowerCase(), hash, rows[0].id]);
  await client.query('COMMIT');
} catch (error) {
  await client.query('ROLLBACK');
  throw error;
} finally {
  client.release();
}
await pool.end();
console.log('Founder account seeded.');
