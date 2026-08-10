import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

const revoked = new Set();
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
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    if (!req.user.jti || revoked.has(req.user.jti)) throw new Error('revoked');
    next();
  }
  catch { res.status(401).json({ error: 'Authentication required' }); }
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
export function revokeToken(token) {
  try { revoked.add(jwt.decode(token)?.jti); } catch {}
}
