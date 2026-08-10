import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { api, setToken } from '../lib/api';

export default function SignInPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('worker'); const [error, setError] = useState('');
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /><span>New to BlueJob? <Link to="/signup">Create account</Link></span></div>
      <div className="auth-card white-card">
        <h1>Welcome Back</h1>
        <p>Sign in to continue to BlueJob.</p>
        <form onSubmit={async (e) => { e.preventDefault(); setError(''); const form = new FormData(e.currentTarget); try { const result = await api.signin({ email: form.get('email'), password: form.get('password') }); setToken(result.token); navigate(result.user.role === 'SUPER_ADMIN' ? '/app/admin' : `/app/${result.user.role === 'CONTRACTOR' ? 'contractor' : 'worker'}`); } catch (err) { setError(err.message); } }}>
          <label>Email<input name="email" type="email" placeholder="you@company.com" required /></label>
          <label>Password<input name="password" type="password" placeholder="••••••••••" required /></label>
          <label>Account type<select value={role} onChange={(e) => setRole(e.target.value)}><option value="worker">Subcontractor / Skilled Professional</option><option value="contractor">Contractor / GC / Company</option></select></label>
          <div className="form-inline"><label className="checkbox"><input type="checkbox"/> Remember me</label><a href="#reset">Forgot password?</a></div>
          <button className="button button-primary button-full button-lg">Sign In</button>
          {error && <p role="alert">{error}</p>}
        </form>
      </div>
    </div>
  );
}
