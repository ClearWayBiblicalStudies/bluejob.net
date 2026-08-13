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

Authentication uses server-side JWT in HttpOnly cookies. Work Passport data, verification evidence, and all application state persist in the database via the backend API. Passwords, payment data, verification documents, Work Score decisions, and admin authorization are all handled server-side.

## Admin bootstrap

The production migration provisions `director@clearestway.org` with the `ADMIN` role and no usable password. Before requesting its setup link, configure the deployed API with `RESEND_API_KEY`, `PASSWORD_RESET_FROM`, and an HTTPS `APP_ORIGIN`. The director can then use `/forgot-password` to receive a one-hour, single-use `/reset-password` link and choose a password. The migration workflow runs only from `main`; run it after the change is deployed.
