import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import RatingGate from '../components/RatingGate';
import { api } from '../lib/api';
export default function ContractorDashboard() {
  const [jobs, setJobs] = useState([]); const [pending, setPending] = useState([]);
  useEffect(() => { api.jobs().then(({ jobs: value }) => setJobs(value)).catch(() => {}); api.pendingRatings().then(({ pending: value }) => setPending(value)).catch(() => {}); }, []);
  return <AppShell role="contractor"><div className="page-heading"><div><h1>Contractor Dashboard</h1><p>Manage real projects and subcontractor responses.</p></div><Link to="/app/post-job" className="button button-primary">Post Job</Link></div>{pending[0] && <RatingGate job={pending[0]} onStartRating={() => window.location.assign(`/app/jobs/${pending[0].id}/rating`)} />}<section className="jobs-grid">{jobs.length ? jobs.map((job) => <article className="card job-card" key={job.id}><h3>{job.title}</h3><p>{job.location}</p><strong>${Number(job.budget).toLocaleString()}</strong><span>{job.bid_count} real bids</span></article>) : <div className="card empty-state"><strong>No active jobs yet</strong><span>Post a job with a required budget to begin.</span></div>}</section></AppShell>;
}
