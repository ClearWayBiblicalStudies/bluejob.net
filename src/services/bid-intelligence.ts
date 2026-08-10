export type BidderInput = {
  bidderId: string;
  workScore: number | null;
  verified: boolean;
  distanceMiles: number | null;
};

export type BidIntelligenceInput = {
  currentUserId?: string;
  bidders: BidderInput[];
};

export function calculateBidIntelligence({
  currentUserId,
  bidders,
}: BidIntelligenceInput) {
  const validScores = bidders
    .map((bidder) => bidder.workScore)
    .filter((score): score is number => typeof score === "number");
  const ranked = bidders
    .filter((bidder) => typeof bidder.workScore === "number")
    .sort((a, b) => (b.workScore ?? 0) - (a.workScore ?? 0));
  const totalBids = bidders.length;
  const verifiedBidders = bidders.filter((bidder) => bidder.verified).length;
  const highScoreBidders = bidders.filter(
    (bidder) => typeof bidder.workScore === "number" && bidder.workScore >= 800,
  ).length;
  const within25Miles = bidders.filter(
    (bidder) =>
      typeof bidder.distanceMiles === "number" && bidder.distanceMiles <= 25,
  ).length;
  const averageWorkScore =
    validScores.length > 0
      ? Math.round(validScores.reduce((sum, score) => sum + score, 0) / validScores.length)
      : null;

  let currentUserPosition: {
    rank: number;
    totalRanked: number;
    percentile: number;
    strength: "LEADING" | "STRONG" | "COMPETITIVE" | "BELOW_AVERAGE";
    workScore: number;
  } | null = null;
  const currentUser = currentUserId
    ? bidders.find((bidder) => bidder.bidderId === currentUserId)
    : undefined;
  if (currentUser && typeof currentUser.workScore === "number") {
    const rank = ranked.findIndex((bidder) => bidder.bidderId === currentUserId) + 1;
    const percentile = Math.round(((ranked.length - rank + 1) / ranked.length) * 100);
    const strength =
      percentile >= 80 ? "LEADING" :
      percentile >= 60 ? "STRONG" :
      percentile >= 40 ? "COMPETITIVE" : "BELOW_AVERAGE";
    currentUserPosition = {
      rank,
      totalRanked: ranked.length,
      percentile,
      strength,
      workScore: currentUser.workScore,
    };
  }

  return {
    totalBids,
    verifiedBidders,
    highScoreBidders,
    averageWorkScore,
    within25Miles,
    currentUserPosition,
  };
}
