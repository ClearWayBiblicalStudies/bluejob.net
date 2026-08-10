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
- `/app/contractor` — contractor operations dashboard
- `/app/post-job` — 5-step job posting flow
- `/app/jobs/1/bids` — bid comparison + bidding insights
- `/app/admin` — private Super Admin Command Center (requires `SUPER_ADMIN` session role)

## Important

This package is the UI/application shell. Replace frontend-only auth and example values with production API/database services before public launch. Passwords, payment data, verification documents, Work Score decisions, and admin authorization must be server-side.
