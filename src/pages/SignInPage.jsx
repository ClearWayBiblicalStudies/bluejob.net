import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';

export default function SignInPage() {
  const navigate = useNavigate();
  const [role, setRole] = useState('worker');
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /><span>New to BlueJob? <Link to="/signup">Create account</Link></span></div>
      <div className="auth-card white-card">
        <h1>Welcome Back</h1>
        <p>Sign in to continue to BlueJob.</p>
        <form onSubmit={(e) => { e.preventDefault(); navigate(`/app/${role}`); }}>
          <label>Email<input type="email" placeholder="you@company.com" required /></label>
          <label>Password<input type="password" placeholder="••••••••••" required /></label>
          <label>Account type<select value={role} onChange={(e) => setRole(e.target.value)}><option value="worker">Subcontractor / Skilled Professional</option><option value="contractor">Contractor / GC / Company</option></select></label>
          <div className="form-inline"><label className="checkbox"><input type="checkbox"/> Remember me</label><a href="#reset">Forgot password?</a></div>
          <button className="button button-primary button-full button-lg">Sign In</button>
        </form>
      </div>
    </div>
  );
}
