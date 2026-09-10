import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Logo from '../components/Logo';
import { api } from '../lib/api';

const destination = (user) => {
  const role = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : null);
  if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/app/admin';
  return `/app/${role === 'CONTRACTOR' ? 'contractor' : 'worker'}`;
};

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    api.me()
      .then(({ user }) => {
        if (!user?.requiresPasswordChange) {
          navigate(destination(user), { replace: true });
          return;
        }
        setReady(true);
      })
      .catch(() => navigate('/signin', { replace: true }));
  }, [navigate]);

  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /><span>Need a different account? <Link to="/signin">Log in</Link></span></div>
      <div className="auth-card white-card">
        <h1>Change your temporary password</h1>
        <p>For security, choose a new password before continuing.</p>
        {!ready ? (
          <p>Loading…</p>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            setError('');
            const form = new FormData(e.currentTarget);
            const password = String(form.get('password') || '');
            if (password !== String(form.get('confirmPassword') || '')) {
              setError('Passwords do not match');
              return;
            }
            try {
              const result = await api.changePassword({ password });
              navigate(destination(result.user), { replace: true });
            } catch (err) {
              setError(err.message);
            }
          }}>
            <label>New password<input name="password" type="password" minLength="8" required /></label>
            <label>Confirm password<input name="confirmPassword" type="password" minLength="8" required /></label>
            <button className="button button-primary button-full button-lg">Update password</button>
            {error && <p role="alert">{error}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
