import { useBlueJob } from "../context/BlueJobContext";

export function ContractorDashboard() {
  const { user } = useBlueJob();
  return <main className="dashboard-shell">
    <header className="dashboard-header"><div><span className="eyebrow">BLUEJOB CONTRACTOR</span><h1>{user?.name}</h1></div><button className="primary-button">+ Post Job</button></header>
    <section className="dashboard-grid">
      <article className="main-score-card"><span className="eyebrow">CONTRACTOR WORK SCORE</span><strong className="building-score">BUILDING</strong><p>Build trust through organized jobs, accurate scopes, fair treatment, successful completion, and dependable payment.</p></article>
      <article className="dashboard-card"><span className="eyebrow">ACTIVE JOBS</span><h2>0</h2><p>Post your first scope to start building your subcontractor network.</p><button className="secondary-button">Post Work</button></article>
      <article className="dashboard-card"><span className="eyebrow">PROJECT COVERAGE</span><h2>No Active Projects</h2><p>BlueJob will show which scopes are covered and which still need qualified subcontractors.</p></article>
    </section>
  </main>;
}
