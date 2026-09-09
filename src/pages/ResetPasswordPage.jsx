import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { api } from '../lib/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [error, setError] = useState('');
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /><span>Need a new link? <Link to="/forgot-password">Request reset</Link></span></div>
      <div className="auth-card white-card">
        <h1>Create a new password</h1>
        <p>Set a new password for your BlueJob account.</p>
        <form onSubmit={async (e) => { e.preventDefault(); setError(''); const form = new FormData(e.currentTarget); const password = String(form.get('password') || ''); if (password !== String(form.get('confirmPassword') || '')) { setError('Passwords do not match'); return; } try { await api.resetPassword({ token, password }); navigate('/signin'); } catch (err) { setError(err.message); } }}>
          <label>New password<input name="password" type="password" minLength="8" required /></label>
          <label>Confirm password<input name="confirmPassword" type="password" minLength="8" required /></label>
          <button className="button button-primary button-full button-lg" disabled={!token}>Reset password</button>
          {!token && <p role="alert">Invalid password reset link.</p>}
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </div>
  );
}
