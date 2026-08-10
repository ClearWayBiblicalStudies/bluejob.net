import { BadgeCheck, BriefcaseBusiness, FileCheck2, ShieldCheck } from 'lucide-react';
import AppShell from '../components/AppShell';
import ScoreRing from '../components/ScoreRing';

const jobs = [
  ['Commercial Metal Framing', 'Tampa, FL', '$18,000–$22,000', '94% Match'],
  ['Interior Buildout Crew', 'Brandon, FL', '$12,500–$16,000', '91% Match'],
  ['Concrete Form & Pour', 'Lakeland, FL', '$8,000–$11,500', '88% Match'],
];

export default function WorkerDashboard() {
  return (
    <AppShell role="worker">
      <div className="page-heading"><div><h1>Good morning, Austin!</h1><p>Here’s your BlueJob overview.</p></div></div>
      <section className="dashboard-grid dashboard-grid-score">
        <article className="card score-card"><ScoreRing score={846}/></article>
        <article className="card metric-card"><span className="kicker">WORK PASSPORT</span><strong>92%</strong><span>Complete</span><div className="progress"><i style={{width:'92%'}}/></div><p>Finish verifying your profile.</p></article>
        <article className="card metric-card"><span className="kicker">RECOMMENDED WORK</span><strong>12</strong><span>Matches</span><BriefcaseBusiness className="metric-icon"/><p>Based on your skills, location and availability.</p></article>
        <article className="card metric-card"><span className="kicker">VERIFIED HISTORY</span><strong>48</strong><span>Completed Jobs</span><FileCheck2 className="metric-icon"/><p>Your completed work continues strengthening your record.</p></article>
      </section>
      <section className="card next-step"><div><span className="kicker">NEXT BEST STEP</span><h2>Verify your insurance</h2><p>Upload your current certificate of insurance to strengthen your Work Passport.</p></div><div className="next-icon"><ShieldCheck/></div><button className="button button-primary">Take Action</button></section>
      <section className="section-heading"><div><h2>Recommended Work</h2><p>Opportunities aligned with your profile.</p></div><a href="#all">View all</a></section>
      <div className="jobs-grid">
        {jobs.map(([title, location, pay, match]) => <article className="card job-card" key={title}><span className="match-pill"><BadgeCheck size={14}/>{match}</span><h3>{title}</h3><p>{location}</p><strong>{pay}</strong><span>8 bids submitted</span><button className="button button-outline">View Opportunity</button></article>)}
      </div>
    </AppShell>
  );
}
