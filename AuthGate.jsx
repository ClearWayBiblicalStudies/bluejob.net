import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function AuthGate({ children, roles }) {
  const [state, setState] = useState({ loading: true, user: null });
  useEffect(() => { api.me().then(({ user }) => setState({ loading: false, user })).catch(() => setState({ loading: false, user: null })); }, []);
  if (state.loading) return <div className="route-loading">Loading BlueJob…</div>;
  if (!state.user) return <Navigate to="/signin" replace />;
  if (roles && !roles.includes(state.user.role)) return <Navigate to={state.user.role === 'CONTRACTOR' ? '/app/contractor' : '/app/worker'} replace />;
  return children;
}
