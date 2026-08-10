export type Evidence = {
  type:
    | "BLUEJOB_JOB"
    | "PAYMENT"
    | "INVOICE"
    | "EMPLOYMENT"
    | "LICENSE"
    | "CERTIFICATION"
    | "INSURANCE"
    | "CONTRACTOR_ATTESTATION";
  source:
    | "BLUEJOB"
    | "PAYMENT_PROVIDER"
    | "PAYROLL_PROVIDER"
    | "GOVERNMENT_REGISTRY"
    | "INSURANCE_PROVIDER"
    | "USER_UPLOAD"
    | "COUNTERPARTY";
  confidence: number;
  monetaryValueCents?: number | null;
  metadata?: Record<string, unknown> | null;
};

export type ScoreResult = {
  status: "BUILDING" | "ACTIVE";
  score: number | null;
  components: {
    reliability: number | null;
    completion: number | null;
    experience: number | null;
    repeatTrust: number | null;
    compliance: number | null;
    evidenceStrength: number;
  };
  explanation: {
    verifiedEvidenceCount: number;
    highConfidenceEvidenceCount: number;
    verifiedWorkValueCents: number;
    reasons: string[];
  };
};

const clamp = (n: number, min = 0, max = 100) =>
  Math.max(min, Math.min(max, Math.round(n)));

export function calculateWorkScore(evidence: Evidence[]): ScoreResult {
  const verified = evidence.filter((e) => e.confidence >= 0.5);
  const highConfidence = verified.filter((e) => e.confidence >= 0.85);
  const verifiedWorkValueCents = verified.reduce(
    (sum, e) => sum + (e.monetaryValueCents ?? 0),
    0
  );

  const evidenceStrength = clamp(
    (highConfidence.length * 9) +
    (verified.length * 3) +
    Math.log10(Math.max(1, verifiedWorkValueCents / 100 + 1)) * 6
  );

  // Critical launch rule:
  // BlueJob does NOT fabricate a consumer-looking score before enough proof exists.
  const enoughEvidence =
    highConfidence.length >= 3 &&
    verified.length >= 5 &&
    evidenceStrength >= 30;

  if (!enoughEvidence) {
    return {
      status: "BUILDING",
      score: null,
      components: {
        reliability: null,
        completion: null,
        experience: null,
        repeatTrust: null,
        compliance: null,
        evidenceStrength
      },
      explanation: {
        verifiedEvidenceCount: verified.length,
        highConfidenceEvidenceCount: highConfidence.length,
        verifiedWorkValueCents,
        reasons: [
          "Work Score is still building because the account does not yet have enough independently verified evidence.",
          "Self-reported claims do not create a numerical Work Score.",
          "Connect verified jobs, payments, employment, licenses, certifications, or insurance to strengthen the record."
        ]
      }
    };
  }

  const jobs = verified.filter((e) => e.type === "BLUEJOB_JOB");
  const completedJobs = jobs.filter((e) => e.metadata?.completed === true);
  const onTimeJobs = completedJobs.filter((e) => e.metadata?.onTime === true);
  const repeatHires = completedJobs.filter((e) => e.metadata?.repeatHire === true);

  const reliability = clamp(
    completedJobs.length
      ? (onTimeJobs.length / completedJobs.length) * 100
      : 70 + evidenceStrength * 0.15
  );

  const completion = clamp(
    jobs.length
      ? (completedJobs.length / jobs.length) * 100
      : 70 + evidenceStrength * 0.15
  );

  const experience = clamp(
    verified.length * 4 +
    Math.log10(Math.max(1, verifiedWorkValueCents / 100 + 1)) * 9
  );

  const repeatTrust = clamp(
    completedJobs.length
      ? 55 + (repeatHires.length / completedJobs.length) * 45
      : 55 + highConfidence.length * 3
  );

  const hasLicense = verified.some((e) => e.type === "LICENSE");
  const hasInsurance = verified.some((e) => e.type === "INSURANCE");
  const hasCertification = verified.some((e) => e.type === "CERTIFICATION");

  const compliance = clamp(
    55 +
    (hasLicense ? 20 : 0) +
    (hasInsurance ? 15 : 0) +
    (hasCertification ? 10 : 0)
  );

  const weighted =
    reliability * 0.25 +
    completion * 0.25 +
    experience * 0.20 +
    repeatTrust * 0.15 +
    compliance * 0.10 +
    evidenceStrength * 0.05;

  // 300-900 public scale. 300 means poor/immature verified record;
  // 900 means exceptional. This is versioned logic and should be calibrated
  // against real marketplace outcomes before production use.
  const score = clamp(300 + weighted * 6, 300, 900);

  return {
    status: "ACTIVE",
    score,
    components: {
      reliability,
      completion,
      experience,
      repeatTrust,
      compliance,
      evidenceStrength
    },
    explanation: {
      verifiedEvidenceCount: verified.length,
      highConfidenceEvidenceCount: highConfidence.length,
      verifiedWorkValueCents,
      reasons: [
        "The score is calculated only from evidence that meets BlueJob verification thresholds.",
        "Higher-confidence sources carry more credibility than user-submitted claims.",
        "The score is a snapshot and should be recalculated when new verified work evidence arrives."
      ]
    }
  };
}
