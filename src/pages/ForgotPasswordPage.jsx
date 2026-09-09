import { Link } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { api } from '../lib/api';

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /><span>Remembered your password? <Link to="/signin">Log in</Link></span></div>
      <div className="auth-card white-card">
        <h1>Reset your password</h1>
        <p>Enter your account email and we&apos;ll send a secure reset link.</p>
        <form onSubmit={async (e) => { e.preventDefault(); setError(''); const form = new FormData(e.currentTarget); try { await api.forgotPassword({ email: form.get('email') }); setMessage('If an account exists, a reset link has been sent.'); } catch (err) { setError(err.message); } }}>
          <label>Email<input name="email" type="email" placeholder="you@company.com" required /></label>
          <button className="button button-primary button-full button-lg">Send reset link</button>
          {message && <p role="status">{message}</p>}
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </div>
  );
}
