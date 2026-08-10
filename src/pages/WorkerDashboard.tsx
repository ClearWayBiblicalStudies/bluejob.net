import { useBlueJob } from "../context/BlueJobContext";

export function WorkerDashboard() {
  const { user } = useBlueJob();
  return <main className="dashboard-shell">
    <header className="dashboard-header"><div><span className="eyebrow">BLUEJOB</span><h1>Good morning, {user?.name}</h1></div></header>
    <section className="dashboard-grid">
      <article className="main-score-card"><span className="eyebrow">WORK SCORE</span><strong className="building-score">BUILDING</strong><p>Complete verification and BlueJob work to establish your score.</p><button className="primary-button">Strengthen My Work Score</button></article>
      <article className="dashboard-card"><span className="eyebrow">BLUEJOB SETUP</span><h2>62% Complete</h2><div className="setup-checklist"><span>✓ Account Created</span><span>✓ Work Passport Started</span><span>○ Work History</span><span>○ Verification</span><span>○ First Verified Job</span></div></article>
      <article className="dashboard-card"><span className="eyebrow">RECOMMENDED WORK</span><h2>Find your next BlueJob.</h2><p>Opportunities matching your profile will appear here.</p><button className="secondary-button">Browse Jobs</button></article>
    </section>
  </main>;
}
