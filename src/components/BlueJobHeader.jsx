import { Link } from 'react-router-dom';
export default function BlueJobHeader() {
  return <header className="bj-header container"><Link className="bj-brand" to="/"><span>BLUEJOB</span></Link><nav><Link className="button button-ghost" to="/signin">Log in</Link><Link className="button button-primary" to="/signup">Join BlueJob</Link></nav></header>;
}
