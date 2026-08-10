import type { BidCompetition } from "./types";

type Props = { competition: BidCompetition };

export function BidIntelligenceCard({ competition }: Props) {
  const position = competition.currentUserPosition;
  return (
    <section className="bid-intelligence" aria-labelledby="bid-intelligence-title">
      <div className="bid-intelligence__header">
        <div>
          <span className="eyebrow">LIVE COMPETITION</span>
          <h3 id="bid-intelligence-title">
            {competition.totalBids} {competition.totalBids === 1 ? "Bid" : "Bids"} Submitted
          </h3>
        </div>
        <span className="live-badge">LIVE</span>
      </div>
      <div className="bid-stat-grid">
        <BidStat label="Verified" value={competition.verifiedBidders} />
        <BidStat label="Work Score 800+" value={competition.highScoreBidders} />
        <BidStat label="Average Score" value={competition.averageWorkScore ?? "—"} />
        <BidStat label="Within 25 Miles" value={competition.within25Miles} />
      </div>
      {position && (
        <div className="competitive-position">
          <div><span className="eyebrow">YOUR POSITION</span><h4>{formatStrength(position.strength)}</h4></div>
          <div className="position-score"><strong>{position.workScore}</strong><span>Work Score</span></div>
          <div className="position-details"><span>Qualification rank</span><strong>#{position.rank} of {position.totalRanked}</strong></div>
          {position.percentile !== null && (
            <p>Your verified work record currently ranks in approximately the top {100 - position.percentile + 1}% of scored bidders on this opportunity.</p>
          )}
        </div>
      )}
      <p className="competition-privacy">BlueJob shows competitive activity without exposing another subcontractor&apos;s confidential bid or identity.</p>
    </section>
  );
}

function BidStat({ label, value }: { label: string; value: string | number }) {
  return <div className="bid-stat"><strong>{value}</strong><span>{label}</span></div>;
}

function formatStrength(strength: "LEADING" | "STRONG" | "COMPETITIVE" | "BELOW_AVERAGE") {
  switch (strength) {
    case "LEADING": return "Leading Candidate";
    case "STRONG": return "Strong Position";
    case "COMPETITIVE": return "Competitive";
    default: return "Build Your Position";
  }
}
