import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function MembershipCancelPage() {
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /></div>
      <div className="auth-card white-card">
        <h1>Checkout canceled</h1>
        <p>No charge was made. You can return when you are ready.</p>
        <Link className="button button-outline button-full button-lg" to="/app/security">Return to billing</Link>
      </div>
    </div>
  );
}
