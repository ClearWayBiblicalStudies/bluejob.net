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

The production migration provisions `director@clearestway.org` with the `ADMIN` role. To activate the one-time administrator login without committing a plaintext password, set `FOUNDER_TEMP_PASSWORD` as a Cloudflare secret on the deployed API (and optionally `FOUNDER_EMAIL` if the email ever changes). On the first successful login, BlueJob forces that account through `/change-password` before any protected API route is available. Password-reset emails still require either `RESEND_API_KEY` plus `PASSWORD_RESET_FROM`, or an existing `EMAIL_PROVIDER_URL` provider with an optional bearer token. The migration workflow runs only from `main`; run it after the change is deployed.
