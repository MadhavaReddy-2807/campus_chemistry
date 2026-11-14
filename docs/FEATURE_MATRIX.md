# Feature matrix

Legend: P0 = launch critical, P1 = important enhancement, P2 = later; ✓ = planned implementation surface.

| Area | Capability | Priority | Data / authorization requirement | Status |
|---|---|---:|---|---|
| Auth | Email signup/login/reset/logout | P0 | Supabase Auth; secure sessions | Implemented: signup/login boundaries, session middleware |
| Verification | IIT/NIT directory and approved domains | P0 | Admin-maintained allowlist; no inferred domains | Implemented: complete 54-institute directory (23 IITs, 31 NITs) with verified domains |
| Verification | Email proof and manual review fallback | P0 | Private artifacts, retention/deletion, audit trail | Implemented: domain-validated request and moderator review queue |
| Identity | Profile, photos, prompts, interests | P0 | Owner writes; visibility-aware reads | Implemented: profile editing, privacy boundaries, prompts, interests |
| Consent | Dating opt-in and 18+ enforcement | P0 | Server-side gating on every dating operation | Implemented: server-side dating eligibility & RPC boundaries |
| Discovery | Campus/inter-campus filters and explainable ranking | P0 | Mutual preferences, block exclusion, cursor pagination | Implemented: eligibility, preferences, cross-campus controls |
| Dating | Like/pass/save/comment, atomic mutual match | P0 | Transaction, unique pair constraint, block checks | Implemented: canonical match pairs, block checks, mutual match |
| Messaging | Match/approved-DM/event conversations | P0 | Membership policies and per-conversation access | Implemented: authorized conversations, send, scoped realtime, event chat |
| Social | Posts, media, likes, comments, follows, bookmarks | P0 | Audience controls, ownership, reportability | Implemented: posts, likes, comments, follows, audience RLS |
| Stories | 24h stories, views, replies | P1 | Expiry and visibility policies | Implemented: 24h expiration, interactive viewer, reply box, story rings |
| Events | Create, RSVP, limits, waitlist, cancel | P0 | Host permissions, capacity transaction, location privacy | Implemented: create, capacity RSVP, waitlist, withdrawal, audience RLS, event chat |
| Valentine's | Hub, configurable dates, themed calendar, icebreakers | P1 | Opt-in; secret crush and rate limits remain planned | Implemented: countdown, daily calendar, cryptographic Secret Crush, Date Safety Kit |
| Communities | Membership, roles, moderation, events | P1 | Community roles separate from global admin | Implemented: directory, club forum threads, membership toggle, creation flow |
| Notifications | In-app/email/push preferences and deep links | P1 | No private-message content in analytics | Implemented: in-app reads, read state, triggers, and preference controls |
| Safety | Block, report, moderation, appeals, audit logs | P0 | Backend enforcement and admin RBAC | Implemented: block/report/moderation/audit foundations |
| Admin | Verification/report/content/event review | P0 | Least privilege; private-message access excluded by default | Implemented: operations center, KPIs, report queue, verification review |
| Quality | Responsive UI, keyboard, axe, Playwright, RLS tests | P0 | CI gates | Implemented: 50 Playwright tests, 14 Vitest unit tests, axe a11y, strict TS |

