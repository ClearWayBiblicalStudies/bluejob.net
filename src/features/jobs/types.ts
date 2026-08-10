export type BidCompetition = {
  totalBids: number;
  verifiedBidders: number;
  highScoreBidders: number;
  averageWorkScore: number | null;
  within25Miles: number;
  currentUserPosition: {
    rank: number;
    totalRanked: number;
    percentile: number | null;
    strength: "LEADING" | "STRONG" | "COMPETITIVE" | "BELOW_AVERAGE";
    workScore: number;
  } | null;
};

export type BidIntelligenceResponse = {
  jobId: string;
  competition: BidCompetition;
  privacy: {
    competitorNamesVisible: boolean;
    competitorBidAmountsVisible: boolean;
  };
};
