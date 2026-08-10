import { Link, useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, FileWarning, ShieldCheck, Users } from 'lucide-react';
import AppShell from '../components/AppShell';

const workspaces = [
  ['Personal Work Passport', '/app/worker'],
  ['Chrome Construction', '/app/contractor'],
  ['Gulfside Improvements', '/app/contractor?workspace=gulfside'],
  ['BlueJob Administration', '/app/admin'],
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  return (
    <AppShell role="admin" user={{ initials: 'AA', name: 'Austin Alfonsi' }}>
      <div className="workspace-bar">
        <span className="kicker">ACTIVE WORKSPACE</span>
        <select defaultValue="/app/admin" aria-label="Workspace" onChange={(event) => navigate(event.target.value)}>
          {workspaces.map(([label, value]) => <option value={value} key={label}>{label}</option>)}
        </select>
      </div>
      <div className="page-heading">
        <div><span className="kicker">PRIVATE ADMINISTRATION</span><h1>Operations Command Center</h1><p>Manage BlueJob operations without exposing administrative access on public Work Passports.</p></div>
        <span className="admin-pill"><ShieldCheck size={14}/> SUPER_ADMIN</span>
      </div>
      <section className="stat-row">
        <div className="card stat-card"><span>Total Users</span><strong>0</strong><small>Awaiting first platform members</small></div>
        <div className="card stat-card"><span>Organizations</span><strong>2</strong><small>Chrome Construction · Gulfside Improvements</small></div>
        <div className="card stat-card"><span>Open Verification</span><strong>0</strong><small>No evidence awaiting review</small></div>
        <div className="card stat-card"><span>Open Disputes</span><strong>0</strong><small>No active disputes</small></div>
      </section>
      <div className="admin-grid">
        <section className="card admin-panel" id="organizations">
          <div className="section-heading"><h2>Organizations</h2><Building2 size={18}/></div>
          <div className="admin-list"><div><strong>Chrome Construction</strong><span>Empty operational state</span></div><div><strong>Gulfside Improvements</strong><span>Empty operational state</span></div></div>
        </section>
        <section className="card admin-panel" id="verification">
          <div className="section-heading"><h2>Integrity Queue</h2><ShieldCheck size={18}/></div>
          <div className="empty-state"><CheckCircle2 size={24}/><strong>Nothing requires review</strong><span>Scores are calculated by the scoring engine from approved evidence. Admins cannot manually award or type scores.</span></div>
        </section>
        <section className="card admin-panel" id="scores">
          <div className="section-heading"><h2>Work Score Integrity</h2><FileWarning size={18}/></div>
          <p className="admin-copy">Review evidence, resolve disputes, and remove fraud. The scoring engine alone calculates Work Scores.</p>
          <Link to="/app/admin#verification" className="button button-outline">Review evidence queue</Link>
        </section>
        <section className="card admin-panel" id="users">
          <div className="section-heading"><h2>Platform Users</h2><Users size={18}/></div>
          <div className="empty-state"><Users size={24}/><strong>No users yet</strong><span>The initial organizations are ready for real members without seeded jobs or fake users.</span></div>
        </section>
      </div>
    </AppShell>
  );
}
