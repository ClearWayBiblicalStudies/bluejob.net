# BlueJob

BlueJob is a mobile-first Work Passport and Work Score experience for blue-collar workers, subcontractors, contractors, and employers.

## Run the frontend

```bash
npm install
npm run dev
```

The frontend uses local mock state so the entire onboarding and worker dashboard flow can be previewed immediately. Sample records are explicitly labeled **Demo** and do not represent production-verified data.

## Included experience

- Worker account onboarding and identity verification
- Primary trade and skill selection
- Verified evidence ledger
- Work Score `BUILDING` state until evidence thresholds are met
- Score components and “Why this score?” explanation
- Work Passport profile with verification badges and work metrics
- Mobile dashboard navigation for Home, Jobs, Work Passport, and Profile

The root `src/server.ts`, `src/scoring.ts`, `prisma/`, `tsconfig.json`, and `.env.example` files are the extracted backend starter slice, ready to be connected behind the frontend service boundary.
