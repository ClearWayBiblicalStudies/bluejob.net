import express from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { calculateWorkScore } from "./scoring.js";
import jobBidRoutes from "./routes/job-bids.js";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());
app.use("/api", jobBidRoutes);

const WorkerSchema = z.object({
  email: z.string().email(),
  phone: z.string().optional(),
  legalName: z.string().min(2),
  primaryTrade: z.string().optional()
});

const EvidenceSchema = z.object({
  type: z.enum([
    "BLUEJOB_JOB",
    "PAYMENT",
    "INVOICE",
    "EMPLOYMENT",
    "LICENSE",
    "CERTIFICATION",
    "INSURANCE",
    "CONTRACTOR_ATTESTATION"
  ]),
  source: z.enum([
    "BLUEJOB",
    "PAYMENT_PROVIDER",
    "PAYROLL_PROVIDER",
    "GOVERNMENT_REGISTRY",
    "INSURANCE_PROVIDER",
    "USER_UPLOAD",
    "COUNTERPARTY"
  ]),
  externalRef: z.string().optional(),
  trade: z.string().optional(),
  monetaryValueCents: z.number().int().nonnegative().optional(),
  occurredAt: z.string().datetime().optional(),
  confidence: z.number().min(0).max(1),
  metadata: z.record(z.string(), z.unknown()).optional()
});

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "bluejob-api" });
});

app.post("/workers", async (req, res) => {
  const parsed = WorkerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const worker = await prisma.worker.create({ data: parsed.data });
  res.status(201).json(worker);
});

app.post("/workers/:workerId/evidence", async (req, res) => {
  const parsed = EvidenceSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const data = parsed.data;
  const evidence = await prisma.workEvidence.create({
    data: {
      workerId: req.params.workerId,
      type: data.type,
      source: data.source,
      externalRef: data.externalRef,
      trade: data.trade,
      monetaryValueCents: data.monetaryValueCents,
      occurredAt: data.occurredAt ? new Date(data.occurredAt) : undefined,
      confidence: data.confidence,
      metadata: data.metadata,
      status: data.confidence >= 0.5 ? "VERIFIED" : "PENDING",
      verifiedAt: data.confidence >= 0.5 ? new Date() : undefined
    }
  });

  res.status(201).json(evidence);
});

app.post("/workers/:workerId/score/recalculate", async (req, res) => {
  const worker = await prisma.worker.findUnique({
    where: { id: req.params.workerId },
    include: { evidence: { where: { status: "VERIFIED" } } }
  });

  if (!worker) return res.status(404).json({ error: "Worker not found" });

  const result = calculateWorkScore(
    worker.evidence.map((e) => ({
      type: e.type,
      source: e.source,
      confidence: e.confidence,
      monetaryValueCents: e.monetaryValueCents,
      metadata: (e.metadata ?? undefined) as Record<string, unknown> | undefined
    }))
  );

  const snapshot = await prisma.workScoreSnapshot.create({
    data: {
      workerId: worker.id,
      score: result.score,
      status: result.status,
      reliability: result.components.reliability,
      completion: result.components.completion,
      experience: result.components.experience,
      repeatTrust: result.components.repeatTrust,
      compliance: result.components.compliance,
      evidenceStrength: result.components.evidenceStrength,
      explanation: result.explanation
    }
  });

  res.json(snapshot);
});

app.get("/workers/:workerId/work-passport", async (req, res) => {
  const worker = await prisma.worker.findUnique({
    where: { id: req.params.workerId },
    include: {
      evidence: {
        where: { status: "VERIFIED" },
        orderBy: { createdAt: "desc" }
      },
      scoreSnapshots: {
        orderBy: { calculatedAt: "desc" },
        take: 1
      }
    }
  });

  if (!worker) return res.status(404).json({ error: "Worker not found" });

  res.json({
    worker: {
      id: worker.id,
      legalName: worker.legalName,
      primaryTrade: worker.primaryTrade,
      identityStatus: worker.identityStatus
    },
    workScore: worker.scoreSnapshots[0] ?? null,
    verifiedEvidence: worker.evidence
  });
});

const port = Number(process.env.PORT ?? 3000);

app.listen(port, () => {
  console.log(`BlueJob API listening on http://localhost:${port}`);
});
