# BlueJob — Repaired Cloudflare Production Package

This repository contains one production architecture:

1. `bluejob-net` serves the Vite/React application.
2. Requests under `/api/*` are forwarded through the existing `API` service binding.
3. `bluejob-api` connects to PostgreSQL through the existing `HYPERDRIVE` binding.
4. The migration runner creates and maintains the `bluejob` PostgreSQL schema.

The former Express backend, duplicate Cloudflare configuration, nested ZIP packages, fake marketplace records, and plaintext bootstrap credential have been removed from this repaired package.

## Required production configuration

GitHub Actions repository secret:

- `MIGRATION_DATABASE_URL` — direct PostgreSQL migration connection URI.

Cloudflare secret required by `bluejob-api`:

- `PASSWORD_PEPPER` — one stable random value of at least 32 characters. Never rotate it without a password migration plan.

Cloudflare secrets required for password reset:

- `RESEND_API_KEY`
- `PASSWORD_RESET_FROM`

Optional integrations:

- `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and `STRIPE_WEBHOOK_SECRET`
- `SMS_PROVIDER_URL` and `SMS_PROVIDER_TOKEN`
- R2 binding named `EVIDENCE_BUCKET` for private evidence uploads

`APP_ORIGIN=https://bluejob.net` and `MEMBERSHIP_ENFORCEMENT=false` are non-secret Worker variables. Set membership enforcement to `true` only after Stripe webhook verification passes.

## Deployment order

1. Push this repository to the existing GitHub `main` branch.
2. Run **BlueJob Production Database Migration** and confirm it reports the `users`, `sessions`, and `jobs` tables.
3. From `server/`, deploy `bluejob-api` with its existing Hyperdrive binding.
4. From the repository root, run the frontend build and deploy `bluejob-net`.
5. Verify `/healthz`, `/api/readyz`, signup, login, logout, password reset, and role isolation.

Do not alter DNS, Worker routes, or Cloudflare Access for this repair.

## Local verification

```bash
npm ci
npm run build
cd server
npm ci
npm run check
```

To test the migration locally, start PostgreSQL with `docker compose up -d db`, provide `DATABASE_URL`, then run `npm run migrate` from `server/`.

## Founder access

The migration provisions `director@clearestway.org` as `SUPER_ADMIN` with no usable password. Configure email delivery, open `/forgot-password`, and complete the one-hour password setup link. No administrator password is stored in this repository.
