# Architecture

## System shape

Campus Chemistry is a modular monolith. The browser uses Next.js App Router and shared TypeScript domain types. Server components render read-heavy pages; server actions/route handlers perform validated mutations. Supabase is the source of truth for Auth, Postgres, Storage, and Realtime.

```text
Browser (mobile / tablet / desktop)
        |
Next.js route handlers + server actions
        |-- zod validation
        |-- authorization helpers
        |-- domain services (dating, social, messaging, events, safety)
        |
Supabase Auth | Postgres + RLS | Storage | Realtime
        |
GitHub Actions -> typecheck / lint / unit / integration / Playwright / axe
```

## Domains

- identity: auth, profiles, institutes, verification, onboarding
- social: posts, comments, follows, stories, search, bookmarks
- dating: preferences, discovery actions, matches, secret crush
- messaging: conversations, members, messages, reactions
- events: events, RSVPs, waitlists, invitations, reminders
- communities: membership, roles, moderation
- safety: blocks, reports, moderation queue, appeals, audit logs
- notifications: in-app delivery and preference-aware external delivery
- admin: role-gated operational views and feature flags

## Authorization model

The client is never authoritative for user IDs, dating eligibility, verification, role, match state, event capacity, or visibility. Every mutation validates the authenticated subject and relies on RLS plus server-side domain checks. Service-role access is server-only and limited to jobs/admin workflows.

Dating requires: verified institute membership, current account, age >= 18, dating enabled, no block pair, and mutual hard-preference compatibility. Social access is available without dating consent.

## Feed and discovery

Use indexed, cursor-based queries. Start with deterministic filters and a weighted score from mutual preferences, shared interests, campus scope, opted-in activity recency, profile completeness, and prior interaction penalties. Do not use protected traits or hidden sensitive inferences.

## Realtime

Subscribe only to conversation IDs the current user is a member of. Messages are inserted through an authorized server action and filtered by RLS. Presence and typing are ephemeral; messages remain Postgres records.

## Media

Upload through signed, validated paths. Enforce MIME/size/dimensions, strip metadata where feasible, generate responsive variants, and keep verification artifacts in a separate private bucket with short retention.

## Deployment

Vercel hosts the Next.js app; Supabase hosts managed services. Environment-specific variables are documented in `.env.example`. CI runs without production secrets; preview environments use isolated Supabase projects or an explicit local test database.

