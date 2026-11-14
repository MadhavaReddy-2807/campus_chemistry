# Campus Chemistry

Campus Chemistry is a private, verified IIT/NIT campus social network for friendships, dating (18+ and opt-in), interests, and meetups.

This repository is in active Phase 1/2 development. The current home surface is a responsive development-mode UI with sample data; it does not claim to be connected to a production database yet.

## Local setup

Requirements: Node.js 20+ and npm.

```bash
npm install
copy .env.example .env.local
npm run dev
```

Add a Supabase project URL and publishable key to `.env.local` before using the auth actions. The migration can be applied with the Supabase CLI once a project is selected:

```bash
supabase db push
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in browser code or commit real credentials.

## Checks

```bash
npm run lint
npm run build
```

## Current routes

- `/` — responsive home shell with development data
- `/login` — validated Supabase email/password login boundary
- `/signup` — validated Supabase signup boundary
- `/onboarding` — first-step institute selection experience

## Documentation

Research, architecture, design tokens, feature prioritization, progress, decisions, known issues, and release gates live in [`docs/`](./docs).

## Product safety boundary

Selecting an IIT/NIT never grants verification. Dating operations must require verified institute membership, age 18+, dating opt-in, mutual eligibility, and block/report checks on the server. Social participation remains separate from dating consent.
