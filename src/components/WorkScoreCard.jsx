export default function WorkScoreCard({ score, ratingCount = 0, verifiedWorkValue = 0, completedJobs = 0 }) {
  const rated = Number.isFinite(Number(score)) && score !== null;
  return <section className="bj-score-card">
    <div><p className="bj-eyebrow">MY WORK SCORE</p><div className="bj-score-number">{rated ? score : 'UNRATED'}</div><p>{rated ? `${ratingCount} verified evaluations` : 'Complete verified BlueJob work to begin building your score.'}</p></div>
    <div className="bj-score-stats"><div><strong>${Number(verifiedWorkValue).toLocaleString()}</strong><span>Verified Work Value</span></div><div><strong>{completedJobs}</strong><span>Completed Jobs</span></div></div>
  </section>;
}
