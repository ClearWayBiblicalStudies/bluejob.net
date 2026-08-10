const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
export function setToken() {}
async function request(path, options = {}) {
  const headers = { ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }), ...options.headers };
  const response = await fetch(`${API}${path}`, { ...options, headers, credentials: 'include' });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || 'Request failed');
  return data;
}
export const api = {
  logout: () => request('/auth/logout', { method: 'POST' }),
  signin: (body) => request('/auth/signin', { method: 'POST', body: JSON.stringify(body) }),
  signup: (body) => request('/auth/signup', { method: 'POST', body: JSON.stringify(body) }),
  me: () => request('/auth/me'),
  passport: () => request('/passport'),
  savePassport: (body) => request('/passport', { method: 'PUT', body: JSON.stringify(body) }),
  evidence: () => request('/passport/evidence'),
  uploadEvidence: (body) => request('/passport/evidence', { method: 'POST', body }),
  adminSummary: () => request('/admin/summary'),
  health: () => request('/health'),
  readiness: () => request('/ready'),
  settings: () => request('/auth/settings'),
  enableMfa: (body) => request('/auth/mfa/setup', { method: 'POST', body: JSON.stringify(body) }),
  verifyMfa: (body) => request('/auth/mfa/verify', { method: 'POST', body: JSON.stringify(body) }),
  sendEmailVerification: () => request('/verification/email/send', { method: 'POST' }),
  confirmEmail: (code) => request('/verification/email/confirm', { method: 'POST', body: JSON.stringify({ code }) }),
  sendPhoneVerification: (body) => request('/verification/phone/send', { method: 'POST', body: JSON.stringify(body) }),
  confirmPhone: (code) => request('/verification/phone/confirm', { method: 'POST', body: JSON.stringify({ code }) }),
  membershipCheckout: () => request('/billing/membership/checkout', { method: 'POST' }),
  jobs: () => request('/jobs'),
  createJob: (body) => request('/jobs', { method: 'POST', body: JSON.stringify(body) }),
  updateJobStatus: (id, status) => request(`/jobs/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  bids: (id) => request(`/jobs/${id}/bids`),
  submitBid: (id, body) => request(`/jobs/${id}/bids`, { method: 'POST', body: JSON.stringify(body) }),
};
