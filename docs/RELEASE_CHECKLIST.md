# Release checklist

## Product

- [ ] Auth, verification, age gate, onboarding, profiles, dating opt-in
- [ ] Discovery, atomic matches, authorized messaging
- [ ] Posts/feed, events/RSVP, block/report, admin moderation
- [x] Application shell and initial route boundaries
- [x] Server-side validation boundaries for auth, posts, events, messages, RSVP, and dating actions
- [ ] Mobile/tablet/desktop flows validated at target widths

## Security and privacy

- [ ] All RLS policies tested for cross-user access
- [ ] Live Supabase migration and RPC smoke test
- [ ] No service-role key in browser bundle
- [ ] Upload validation, signed/private verification storage, retention jobs
- [ ] Rate limits, abuse monitoring, secure headers, audit logs
- [ ] Account deletion, export, consent, appeals, India privacy review

## Quality and operations

- [ ] Typecheck, lint, unit, integration, Playwright, axe pass
- [x] Local Playwright/axe browser suite passes (31 passed, 1 intentionally skipped)
- [x] CI workflow includes Playwright/axe browser execution
- [ ] Core Web Vitals tested on throttled Android profile
- [ ] Error monitoring and structured logs configured without sensitive data
- [x] CI workflow runs tests, lint, build, and production dependency audit
- [x] Baseline security response headers configured
- [ ] Backups, restore drill, environment variables, rollback plan
- [ ] Final implementation report and known limitations reviewed

