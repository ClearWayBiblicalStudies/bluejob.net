# BlueJob White UI

White/blue BlueJob frontend matching the approved visual direction.

## Run

```bash
npm install
npm run dev
```

## Included routes

- `/` — public landing page
- `/signup` — account creation
- `/signin` — sign in
- `/choose-path` — subcontractor vs contractor path
- `/app/worker` — Work Score / Work Passport worker dashboard
- `/app/passport` — public Work Passport
- `/app/passport/edit` — structured Passport editor
- `/app/verification` — private evidence submission and review states
- `/app/contractor` — contractor operations dashboard
- `/app/post-job` — 5-step job posting flow
- `/app/jobs/1/bids` — bid comparison + bidding insights
- `/app/admin` — private Super Admin Command Center (requires `SUPER_ADMIN` session role)

## Important

This package is the UI/application shell. Work Passport and verification drafts currently persist in browser storage for this build; replace them, frontend-only auth, and example values with production API/database/private document storage before public launch. Passwords, payment data, verification documents, Work Score decisions, and admin authorization must be server-side.

## Admin bootstrap

The production migration provisions `director@clearestway.org` with the `ADMIN` role and no usable password. Before requesting its setup link, configure the deployed API with `RESEND_API_KEY`, `PASSWORD_RESET_FROM`, and an HTTPS `APP_ORIGIN`. The director can then use `/forgot-password` to receive a one-hour, single-use `/reset-password` link and choose a password. The migration workflow runs only from `main`; run it after the change is deployed.
