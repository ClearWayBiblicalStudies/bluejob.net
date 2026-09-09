import { Link } from 'react-router-dom';
import Logo from '../components/Logo';

export default function MembershipSuccessPage() {
  return (
    <div className="auth-page">
      <div className="auth-top"><Logo /></div>
      <div className="auth-card white-card">
        <h1>Subscription activated</h1>
        <p>Your BlueJob membership payment was successful.</p>
        <Link className="button button-primary button-full button-lg" to="/app/worker">Continue</Link>
      </div>
    </div>
  );
}
