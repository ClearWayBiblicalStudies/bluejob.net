import { Check, Eye } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';

export default function SignUpPage() {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /><span>Already have an account? <Link to="/signin">Log in</Link></span></div>
      <div className="auth-card white-card">
        <h1>Create Your BlueJob Account</h1>
        <p>Join thousands of professionals building stronger work relationships.</p>
        <form onSubmit={(e) => { e.preventDefault(); navigate('/choose-path'); }}>
          <label>Full Name<input required /></label>
          <label>Email<input type="email" required /></label>
          <label>Password<div className="password-field"><input type="password" required /><Eye size={18}/></div></label>
          <div className="password-rules"><span><Check/> At least 8 characters</span><span><Check/> One uppercase letter</span><span><Check/> One number</span></div>
          <button className="button button-primary button-full button-lg">Create Account</button>
        </form>
        <small>By creating an account, you agree to our Terms of Service and Privacy Policy.</small>
      </div>
    </div>
  );
}
