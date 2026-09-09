import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { api } from '../lib/api';

export default function SignInPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const destination = (user) => {
    const role = user?.role || (Array.isArray(user?.roles) ? user.roles[0] : null);
    if (role === 'SUPER_ADMIN' || role === 'ADMIN') return '/app/admin';
    return `/app/${role === 'CONTRACTOR' ? 'contractor' : 'worker'}`;
  };
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /><span>New to BlueJob? <Link to="/signup">Create account</Link></span></div>
      <div className="auth-card white-card">
        <h1>Welcome Back</h1>
        <p>Sign in to continue to BlueJob.</p>
        <form onSubmit={async (e) => { e.preventDefault(); setError(''); const form = new FormData(e.currentTarget); try { const result = await api.signin({ email: form.get('email'), password: form.get('password') }); navigate(destination(result.user)); } catch (err) { setError(err.message); } }}>
          <label>Email<input name="email" type="email" placeholder="you@company.com" required /></label>
          <label>Password<input name="password" type="password" placeholder="••••••••••" required /></label>
          <div className="form-inline"><span>Secure session stays active after refresh.</span><Link to="/forgot-password">Forgot password?</Link></div>
          <button className="button button-primary button-full button-lg">Sign In</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </div>
  );
}
