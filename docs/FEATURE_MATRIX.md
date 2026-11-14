# Feature matrix

Legend: P0 = launch critical, P1 = important enhancement, P2 = later; ✓ = planned implementation surface.

| Area | Capability | Priority | Data / authorization requirement | Status |
|---|---|---:|---|---|
| Auth | Email signup/login/reset/logout | P0 | Supabase Auth; secure sessions | Partial: signup/login boundary, live provider pending |
| Verification | IIT/NIT directory and approved domains | P0 | Admin-maintained allowlist; no inferred domains | Partial: two reviewed pilot institutes |
| Verification | Email proof and manual review fallback | P0 | Private artifacts, retention/deletion, audit trail | Partial: domain-validated request and moderator review |
| Identity | Profile, photos, prompts, interests | P0 | Owner writes; visibility-aware reads | Partial: profile editing/visibility, photo metadata pending |
| Consent | Dating opt-in and 18+ enforcement | P0 | Server-side gating on every dating operation | Partial: server-side dating eligibility/RPC |
| Discovery | Campus/inter-campus filters and explainable ranking | P0 | Mutual preferences, block exclusion, cursor pagination | Partial: eligibility, preferences, action ranking foundation |
| Dating | Like/pass/save/comment, atomic mutual match | P0 | Transaction, unique pair constraint, block checks | Partial: like/pass/save and atomic match |
| Messaging | Match/approved-DM/event conversations | P0 | Membership policies and per-conversation access | Partial: authorized conversations, send, scoped realtime |
| Social | Posts, media, likes, comments, follows, bookmarks | P0 | Audience controls, ownership, reportability | Partial: posts, likes, comments, follows, audience RLS |
| Stories | 24h stories, views, replies | P1 | Expiry and visibility policies | Planned |
| Events | Create, RSVP, limits, waitlist, cancel | P0 | Host permissions, capacity transaction, location privacy | Partial: create, RSVP, waitlist, withdrawal, audience RLS |
| Valentine's | Hub, configurable dates, themed calendar, icebreakers | P1 | Opt-in; secret crush and rate limits remain planned | Partial |
| Communities | Membership, roles, moderation, events | P1 | Community roles separate from global admin | Planned |
| Notifications | In-app/email/push preferences and deep links | P1 | No private-message content in analytics | Partial: in-app reads, read state, triggers, and preference controls |
| Safety | Block, report, moderation, appeals, audit logs | P0 | Backend enforcement and admin RBAC | Partial: block/report/moderation/audit foundations |
| Admin | Verification/report/content/event review | P0 | Least privilege; private-message access excluded by default | Partial: moderator queue/report resolution |
| Quality | Responsive UI, keyboard, axe, Playwright, RLS tests | P0 | CI gates | Partial: responsive smoke/axe/unit gates; live RLS pending |

