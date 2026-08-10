import { BadgeCheck, Edit3, FileCheck2, MapPin, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import AppShell from '../components/AppShell';
import ScoreRing from '../components/ScoreRing';
import { readEvidence, readPassport } from '../lib/passport';

export default function PassportPage() {
  const passport = readPassport();
  const evidence = readEvidence();
  const verified = evidence.filter((item) => item.status === 'Verified').length;
  const displayName = passport.name || 'Your professional identity';
  const skills = passport.skills ? passport.skills.split(',').map((skill) => skill.trim()).filter(Boolean) : [];

  return (
    <AppShell role="worker" user={{ initials: displayName.slice(0, 2).toUpperCase(), name: displayName }}>
      <div className="page-heading">
        <div><span className="kicker">PUBLIC PROFESSIONAL RECORD</span><h1>Work Passport</h1><p>Show the professional record. Keep private documents private.</p></div>
        <Link to="/app/passport/edit" className="button button-primary"><Edit3 size={15}/> Edit Passport</Link>
      </div>
      <section className="passport-hero card">
        <div className="passport-identity">
          <div className="passport-avatar">{displayName.slice(0, 2).toUpperCase()}</div>
          <div><h2>{displayName}</h2><p>{passport.trade || 'Trade not added yet'} · {passport.workerType}</p><span className="location-line"><MapPin size={14}/>{passport.location || 'Location not added yet'} {passport.travelRadius && `· Travels ${passport.travelRadius} miles`}</span></div>
        </div>
        <div className="passport-score"><ScoreRing score={Math.min(900, verified ? 600 + verified * 50 : 0)}/><strong>WORK SCORE</strong><span>BUILDING</span></div>
      </section>
      <section className="passport-grid">
        <article className="card passport-panel"><div className="section-heading"><h2>Professional details</h2><BadgeCheck className="green-text"/></div><div className="detail-grid"><div><span>Years of experience</span><strong>{passport.yearsExperience || 'Not added'}</strong></div><div><span>Crew size</span><strong>{passport.crewSize || 'Not added'}</strong></div><div><span>Availability</span><strong>{passport.availability || 'Not added'}</strong></div><div><span>Transportation</span><strong>{passport.transportation || 'Not added'}</strong></div></div><h3>Skills</h3><div className="tag-list">{skills.length ? skills.map((skill) => <span key={skill}>{skill}</span>) : <span className="muted-text">Add skills to start matching.</span>}</div></article>
        <article className="card passport-panel"><div className="section-heading"><h2>Verification center</h2><ShieldCheck className="green-text"/></div><p className="panel-copy">Evidence is reviewed before it can affect your Work Score. Public viewers only see the result.</p><div className="verification-summary"><strong>{verified} Verified</strong><span>{evidence.length - verified} Pending Verification</span></div><Link to="/app/verification" className="button button-outline button-full">Manage evidence</Link></article>
      </section>
      <section className="card passport-history"><div className="section-heading"><div><h2>Work history</h2><p>Résumé-style experience shown on your public Passport.</p></div><Link to="/app/passport/edit">Add history</Link></div>{passport.history.length ? passport.history.map((job) => <div className="history-row" key={`${job.company}-${job.title}`}><FileCheck2 size={18}/><div><strong>{job.title}</strong><span>{job.company} · {job.dates}</span><p>{job.description}</p></div></div>) : <div className="empty-state"><FileCheck2 size={24}/><strong>No work history yet</strong><span>Add completed work so companies can understand your experience.</span></div>}</section>
    </AppShell>
  );
}
