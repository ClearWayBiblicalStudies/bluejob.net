import { useEffect, useState } from 'react';
import AppShell from '../components/AppShell';
import WorkScoreCard from '../components/WorkScoreCard';
import RatingGate from '../components/RatingGate';
import { api } from '../lib/api';
export default function WorkerDashboard() {
  const [user, setUser] = useState(null); const [pending, setPending] = useState([]);
  useEffect(() => { api.me().then(({ user: value }) => setUser(value)).catch(() => {}); api.pendingRatings().then(({ pending: value }) => setPending(value)).catch(() => {}); }, []);
  return <AppShell role="worker"><div className="page-heading"><div><h1>My Work</h1><p>Real BlueJob work and reputation.</p></div></div>{pending[0] && <RatingGate job={pending[0]} onStartRating={() => window.location.assign(`/app/jobs/${pending[0].id}/rating`)} />}{user && <WorkScoreCard score={user.work_score} ratingCount={user.work_score_rating_count} verifiedWorkValue={user.verified_work_value} completedJobs={user.completed_jobs} />}<section className="card empty-state"><strong>No active jobs yet</strong><span>New matching opportunities will appear here when real work is available.</span></section></AppShell>;
}
