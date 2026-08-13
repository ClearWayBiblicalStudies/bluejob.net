import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { pool } from './db.js';

const cookieName = 'bluejob_access';

export function signUser(user) {
  return jwt.sign({ sub: user.id, role: user.role, organizationId: user.organization_id || null }, process.env.JWT_SECRET, { expiresIn: '8h', jwtid: crypto.randomUUID() });
}
export function requireAuth(req, res, next) {
  const cookies = Object.fromEntries(String(req.headers.cookie || '').split(';').filter(Boolean).map((part) => {
    const [key, ...value] = part.trim().split('=');
    return [key, decodeURIComponent(value.join('='))];
  }));
  const token = cookies[cookieName];
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Authentication required' });
  }
  if (!payload.jti) return res.status(401).json({ error: 'Authentication required' });
  pool.query('SELECT 1 FROM revoked_tokens WHERE jti=$1 AND expires_at > now()', [payload.jti])
    .then(({ rows }) => {
      if (rows[0]) return res.status(401).json({ error: 'Authentication required' });
      req.user = payload;
      next();
    })
    .catch(() => res.status(401).json({ error: 'Authentication required' }));
}
export function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Forbidden' });
}
export function setAuthCookie(res, token) {
  res.setHeader('Set-Cookie', `${cookieName}=${encodeURIComponent(token)}; Path=/; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax; Max-Age=28800`);
}
export function clearAuthCookie(res) {
  res.setHeader('Set-Cookie', `${cookieName}=; Path=/; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}SameSite=Lax; Max-Age=0`);
}
export async function revokeToken(token) {
  try {
    const decoded = jwt.decode(token);
    if (!decoded?.jti || !decoded?.exp) return;
    await pool.query(
      'INSERT INTO revoked_tokens(jti,expires_at) VALUES($1,to_timestamp($2)) ON CONFLICT DO NOTHING',
      [decoded.jti, decoded.exp]
    );
  } catch {}
}
