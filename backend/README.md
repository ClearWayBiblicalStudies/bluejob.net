# BlueJob Starter

This is the first backend slice for BlueJob's **Work Passport + Work Score**.

## What is implemented

- Worker records
- Identity verification status placeholder
- Evidence ledger
- Evidence provenance/source
- Confidence levels
- Work Score "BUILDING" state
- Numerical score only after minimum evidence thresholds
- Component scores
- Immutable score snapshots
- Work Passport endpoint

## Why the score starts as BUILDING

A new user should not type in a few claims and receive a fake-looking number.
The public score unlocks only after enough independently verified evidence exists.

## Run locally

1. Install PostgreSQL.
2. Copy `.env.example` to `.env`.
3. Run:

```bash
npm install
npx prisma migrate dev --name init
npm run dev
```

## API

### Create worker

`POST /workers`

```json
{
  "email": "worker@example.com",
  "legalName": "Mike Builder",
  "primaryTrade": "Commercial Framing"
}
```

### Add verified work evidence

`POST /workers/:workerId/evidence`

```json
{
  "type": "BLUEJOB_JOB",
  "source": "BLUEJOB",
  "externalRef": "job_123",
  "trade": "Commercial Framing",
  "monetaryValueCents": 420000,
  "confidence": 0.98,
  "metadata": {
    "completed": true,
    "onTime": true,
    "repeatHire": true
  }
}
```

### Recalculate score

`POST /workers/:workerId/score/recalculate`

### Read Work Passport

`GET /workers/:workerId/work-passport`

## Important production rule

The included scoring formula is **v0 prototype logic**, not a claim of validated predictive accuracy.

Before BlueJob markets Work Score as a consequential measure of worker quality, the model should be calibrated against real marketplace outcomes, tested for manipulation and disparate impact, versioned, appealable, and auditable.

## Next build targets

1. Real identity/KYC verification adapter
2. Business/license registry verification
3. Payment provider connection
4. Job ledger + counterparties
5. Anti-fraud graph
6. Score versioning
7. Score dispute/appeal workflow
8. React/React Native onboarding experience
