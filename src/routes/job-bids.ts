import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { calculateBidIntelligence } from "../services/bid-intelligence.js";

const router = Router();
const prisma = new PrismaClient();

router.get("/jobs/:jobId/bid-intelligence", async (req, res) => {
  try {
    const { jobId } = req.params;
    const currentUserId = (req as any).user?.workerId ?? undefined;
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        bids: {
          where: { status: { in: ["SUBMITTED", "VIEWED", "SHORTLISTED", "AWARDED"] } },
          include: {
            bidder: {
              include: { scoreSnapshots: { orderBy: { calculatedAt: "desc" }, take: 1 } },
            },
          },
        },
      },
    });
    if (!job) return res.status(404).json({ error: "Job not found" });
    const bidders = job.bids.map((bid) => {
      const latestScore = bid.bidder.scoreSnapshots[0];
      return {
        bidderId: bid.bidderId,
        workScore: latestScore?.score ?? null,
        verified: bid.bidder.identityStatus === "VERIFIED",
        distanceMiles: null,
      };
    });
    return res.json({
      jobId: job.id,
      competition: calculateBidIntelligence({ currentUserId, bidders }),
      privacy: { competitorNamesVisible: false, competitorBidAmountsVisible: false },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to calculate bid intelligence" });
  }
});

router.post("/jobs/:jobId/bids", async (req, res) => {
  try {
    const workerId = (req as any).user?.workerId;
    if (!workerId) return res.status(401).json({ error: "Authentication required" });
    const { jobId } = req.params;
    const { amountCents, proposedStartDate, estimatedDays, message } = req.body;
    if (!Number.isInteger(amountCents) || amountCents <= 0) {
      return res.status(400).json({ error: "Valid bid amount required" });
    }
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.status !== "OPEN") {
      return res.status(400).json({ error: "This job is not accepting bids" });
    }
    const bid = await prisma.bid.upsert({
      where: { jobId_bidderId: { jobId, bidderId: workerId } },
      create: {
        jobId, bidderId: workerId, amountCents,
        proposedStartDate: proposedStartDate ? new Date(proposedStartDate) : undefined,
        estimatedDays, message,
      },
      update: {
        amountCents,
        proposedStartDate: proposedStartDate ? new Date(proposedStartDate) : undefined,
        estimatedDays, message, status: "SUBMITTED",
      },
    });
    return res.status(201).json({ success: true, bid });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Unable to submit bid" });
  }
});

export default router;
