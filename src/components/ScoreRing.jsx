export default function ScoreRing({ score = null, label = 'UNRATED', change = null }) {
  const pct = Math.max(0, Math.min(100, ((score - 300) / 600) * 100));
  return (
    <div className="score-ring-wrap">
      <div className="score-ring" style={{ '--score': `${pct * 3.6}deg` }}>
        <div className="score-ring-inner">
          <strong>{score}</strong>
          <span>of 900</span>
        </div>
      </div>
      <div className="score-copy">
        <span className="kicker">WORK SCORE</span>
        <div className="score-big">{score}</div>
        <div className="status-positive">● {label}</div>
        <p>↑ {change} points this month</p>
      </div>
    </div>
  );
}
