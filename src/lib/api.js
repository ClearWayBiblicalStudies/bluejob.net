const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
let token = null;
export function setToken(value) { token = value; }
async function request(path, options = {}) {
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...(token ? { Authorization: ['Bearer', token].join(' ') } : {}), ...options.headers };
  const response = await fetch(`${API}${path}`, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
export const api = {
  signin: (body) => request('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  passport: () => request('/passport'),
  savePassport: (body) => request('/passport', { method: 'PUT', body: JSON.stringify(body) }),
  evidence: () => request('/passport/evidence'),
  uploadEvidence: (body) => request('/passport/evidence', { method: 'POST', body }),
  adminSummary: () => request('/admin/summary'),
};
