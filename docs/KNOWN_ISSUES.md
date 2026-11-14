# Known issues

- No Supabase project credentials are available yet; backend integration runs behind the explicit `.env.example` configuration boundary.
- The complete IIT/NIT institute directory and domain allowlist still needs systematic official-source verification and admin import tooling.
- `supabase/seed.sql` intentionally contains only two reviewed pilot institutes; it is not yet the complete launch directory.
- The research baseline is 23 IITs and 31 NITs, but only two domains are currently approved in seed data; the remaining domains must be reviewed from each institute's official IT source before enabling verification.
- No production moderation vendor, email provider, push provider, monitoring provider, or human review team has been authorized.
- This workspace is not yet a release candidate; the documents are the Phase 1 foundation.
- `npm install` currently reports 7 moderate vulnerabilities from the generated dependency tree; investigate with `npm audit` before release and avoid blind bulk upgrades.
- Production dependencies are currently clean under `npm audit --omit=dev`; the remaining moderate findings are in development tooling and still need review before CI is treated as release-ready.
- The new event/messaging RPCs and RLS policies still need authenticated multi-user integration tests; schema/seed smoke checks are now available through `npm run db:check`.
- The profile update security migration is present but still needs to be applied and exercised against the live Supabase project before it can be considered verified in production.
- The institute verification flow records a pending, domain-validated request but still needs a configured transactional email/link delivery provider and approval callback before it can mark a student verified.
- The verification review route and RPC are implemented but require live Supabase migration plus seeded moderator roles before authenticated review can be exercised.
- Account deletion currently creates a reviewable request; final auth-user deletion and retention cleanup require a privileged server job and approved retention policy.
- Realtime delivery is implemented for message inserts but still needs authenticated multi-user browser testing against the live Supabase Realtime service.
- Follow requests for private profiles and follower-management screens remain future social-graph work; public verified profile follow/unfollow is implemented.
- The tightened audience policies still require live cross-user RLS integration tests with public, same-campus, different-campus, follower, and private fixtures.
- Rate-limit behavior is implemented in the database migration but requires live multi-user load testing after Supabase migration.
- Live schema application is currently blocked by the supplied direct database hostname resolving only to an unreachable IPv6 address from this environment; use the Supabase session pooler connection string or an IPv4-enabled direct connection for `CAMPUS_DATABASE_URL`.
- The home page still includes a labelled development-only sample card; the module routes intentionally avoid presenting sample people/events as real.

