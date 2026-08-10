import { Check, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Logo from '../components/Logo';
import { api, setToken } from '../lib/api';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /><span>Already have an account? <Link to="/signin">Log in</Link></span></div>
      <div className="auth-card white-card">
        <h1>Create Your BlueJob Account</h1>
        <p>Join thousands of professionals building stronger work relationships.</p>
        <form onSubmit={async (e) => { e.preventDefault(); setError(''); const form = new FormData(e.currentTarget); try { const result = await api.signup({ name: form.get('name'), email: form.get('email'), password: form.get('password') }); setToken(result.token); navigate('/choose-path'); } catch (err) { setError(err.message); } }}>
          <label>Full Name<input name="name" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Password<div className="password-field"><input name="password" type="password" minLength="8" required /><Eye size={18}/></div></label>
          <div className="password-rules"><span><Check/> At least 8 characters</span><span><Check/> One uppercase letter</span><span><Check/> One number</span></div>
          <button className="button button-primary button-full button-lg">Create Account</button>
          {error && <p role="alert">{error}</p>}
        </form>
        <small>By creating an account, you agree to our Terms of Service and Privacy Policy.</small>
      </div>
    </div>
  );
}
