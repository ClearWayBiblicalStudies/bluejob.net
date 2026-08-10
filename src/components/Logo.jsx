import { Link } from 'react-router-dom';

export default function Logo({ compact = false }) {
  return (
    <Link to="/" className={`brand ${compact ? 'brand--compact' : ''}`}>
      <img src="/bluejob-logo.png" alt="BlueJob" />
      <span>BLUEJOB</span>
    </Link>
  );
}
