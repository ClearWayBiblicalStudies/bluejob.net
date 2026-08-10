import jwt from 'jsonwebtoken';

export function signUser(user) {
  return jwt.sign({ sub: user.id, role: user.role, organizationId: user.organization_id || null }, process.env.JWT_SECRET, { expiresIn: '8h' });
}
export function requireAuth(req, res, next) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Authentication required' }); }
}
export function requireRole(...roles) {
  return (req, res, next) => roles.includes(req.user?.role) ? next() : res.status(403).json({ error: 'Forbidden' });
}
