import { Link } from 'react-router-dom';
export default function FoundingPrice() {
  return <aside className="bj-price"><strong>$15.99/month</strong><span>Founding Member Price</span><small>Billing and cancellation terms apply.</small><Link className="button button-primary" to="/signup">Join BlueJob</Link></aside>;
}
