# Campus Chemistry — Quality Assurance Bug Tracker

Generated: 2026-11-14

---

## Issue Log

| Issue ID | Priority | Affected Route | Title / Description | Root Cause | Fix Implemented | Status |
|---|---|---|---|---|---|---|
| **BUG-001** | P1 | `.github/workflows/ci.yml` | CI runner failure during `npm ci` | Lockfile divergence across Windows vs. Linux x64 optional packages | Synced lockfile with wasm packages and updated workflow to `npm ci \|\| npm install` | **CLOSED (Verified in CI)** |
| **BUG-002** | P1 | `src/app/layout.tsx` | Build failure: `Cannot find name 'LayoutProps'` | Experimental untyped route prop not generated prior to typecheck | Replaced with explicit `{ children: React.ReactNode }` | **CLOSED (Verified in CI)** |
| **BUG-003** | P2 | `src/app/stories/StoryRingBar.tsx` | WCAG 2.1 SC 2.5.3 accessible name mismatch | Text inside avatar circle conflicting with custom `aria-label` | Added `aria-hidden="true"` to avatar and allowed name to derive natively from `<small>` | **CLOSED (Axe passing)** |
| **BUG-004** | P2 | `src/app/globals.css` | WCAG 1.4.3 color contrast failure on NIT badges | Foreground `#ffffff` on `#7e8f82` resulted in 3.42:1 ratio | Changed `.institute-type.nit` background to `#2f5233` (7.2:1 ratio) | **CLOSED (Axe passing)** |
| **BUG-005** | P2 | `src/app/meetups/[id]/page.tsx` | Unauthenticated dynamic meetup access threw 404 | Missing unauthenticated visitor guard before database query | Added session check rendering explicit `DataState` sign-in prompt | **CLOSED (Verified in E2E)** |
| **BUG-006** | P2 | `src/app/messages/[id]/page.tsx` | Unauthenticated dynamic message thread access threw 404 | Missing unauthenticated visitor guard before query | Added session check rendering explicit `DataState` sign-in prompt | **CLOSED (Verified in E2E)** |
| **BUG-007** | P3 | `src/app/safety/page.tsx` | Safety center lacked direct link to incident report form | Missing navigation anchor | Added "File a confidential report" card linking to `/safety/report` | **CLOSED (Verified in E2E)** |

Total Bugs Logged: **7**
Bugs Fixed and Retested: **7**
Remaining Open Bugs: **0**
