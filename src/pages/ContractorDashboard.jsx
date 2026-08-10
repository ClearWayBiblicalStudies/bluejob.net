import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';

const projects = [
  ['Office Building Electrical','Tampa, FL','Bidding','12 Bids'],
  ['Warehouse Concrete','Lakeland, FL','In Progress','4 Bids'],
  ['Retail Renovation','Orlando, FL','Bidding','9 Bids'],
];

export default function ContractorDashboard() {
  return (
    <AppShell role="contractor">
      <div className="page-heading"><div><h1>Contractor Dashboard</h1><p>Manage your projects and build your subcontractor network.</p></div><Link to="/app/post-job" className="button button-primary">+ Post Job</Link></div>
      <section className="stat-row">
        <div className="card stat-card"><span>Active Projects</span><strong>8</strong><a>View all</a></div>
        <div className="card stat-card"><span>Bids Received</span><strong>27</strong><a>View all</a></div>
        <div className="card stat-card"><span>Project Coverage</span><strong className="green-text">72%</strong><small>Across 8 projects</small></div>
        <div className="card stat-card"><span>Contractor Work Score</span><strong>782</strong><small className="green-text">Good · ↑ 8 this month</small></div>
      </section>
      <div className="contractor-columns">
        <section className="card project-table-card"><div className="section-heading"><h2>Recent Projects</h2><a>View all</a></div>{projects.map(([name,loc,status,bids],i)=><div className="project-row" key={name}><div><strong>{name}</strong><span>{loc}</span></div><span className="status-chip">{status}</span><Link to={`/app/jobs/${i+1}/bids`}>{bids}</Link></div>)}</section>
        <aside className="action-stack"><div className="card action-card"><span className="kicker">POST A JOB</span><h3>Get matched with qualified subcontractors.</h3><p>Set your scope and budget, then let BlueJob organize the response.</p><Link to="/app/post-job" className="button button-primary button-full">Post New Job</Link></div><div className="card action-card"><span className="kicker">GROW YOUR SUB NETWORK</span><h3>Keep strong subcontractors close.</h3><p>Save and organize the people you want to work with again.</p><button className="button button-outline button-full">Invite Subcontractors</button></div></aside>
      </div>
    </AppShell>
  );
}
