# Campus Chemistry — Master QA & Test Plan

Generated: 2026-11-14
Lead QA: Principal QA Engineer & Security Auditor

---

## 1. Scope & Objectives
Validate the complete Campus Chemistry web application against all functional, visual, accessibility, responsive, security, and performance criteria across 30 routes, 28 server actions, and 9 standard device viewports.

## 2. Test Environments & Tooling
- **Test Runner**: Vitest (Unit & Domain Logic) + Playwright Test (Browser E2E & Visual).
- **Target Environments**:
  - Local Next.js dev & production server on `http://127.0.0.1:3000`.
  - Supabase PostgreSQL 17 live backend with 40 RLS-governed tables and 54 authoritative IIT/NIT records.
- **Accessibility Engine**: `@axe-core/playwright` enforcing WCAG 2.2 AA standards.
- **Browsers**: Chromium, Mobile Chrome (emulated Pixel 5 / iPhone 14 Pro), WebKit, Firefox.

## 3. Viewport Matrix

| Viewport Category | Width | Height | Tested Device Profile |
|---|---|---|---|
| Small Mobile | 320px | 568px | iPhone SE (1st gen) |
| Standard Mobile | 375px | 667px | iPhone SE (2nd gen) / Small Android |
| Modern Mobile | 390px | 844px | iPhone 14 / iPhone 15 |
| Large Mobile | 430px | 932px | iPhone 15 Pro Max |
| Tablet Portrait | 768px | 1024px | iPad Mini / Air |
| Small Laptop | 1024px | 768px | iPad Pro / MacBook Air 11" |
| Standard Desktop | 1280px | 800px | Standard Laptop |
| Large Desktop | 1440px | 900px | MacBook Pro 16" / Desktop Monitor |
| Wide Desktop | 1920px | 1080px | Full HD 1080p Display |

## 4. Test Phases & Coverage Checklist

### Phase 1: Unit & Domain Logic Testing
- Institute regex validation (54 approved domains).
- Onboarding Zod schemas (age eligibility 18+, required name, valid date of birth).
- Profile validation schemas.
- Compatibility score calculation algorithm.
- Secret crush SHA-256 hash collision and matching logic.

### Phase 2: Route Navigation & HTTP Integrity
- All 30 discovered routes return HTTP 200 with no unhandled promise rejections, hydration errors, or broken image assets.
- Navigation integrity: Desktop sidebar links, mobile bottom navigation, breadcrumbs, back buttons.

### Phase 3: Interactive Controls & Form Submissions
- Form input sanitization, empty field validation, maximum length enforcement.
- Like / pass / block actions on discovery cards.
- RSVP and capacity limits on meetups.
- Club join / leave and post discussion interactions.
- Story auto-advance, tap controls, and direct reply interactions.

### Phase 4: Authentication & Security Controls
- Public route boundaries vs. protected route boundaries.
- Row-Level Security: Ensure regular users cannot read or write private reports, unconfirmed verification requests, or other users' private messages.
- Admin dashboard route lockdown: Unauthenticated and non-moderator accounts see strict access denied / sign-in state.

### Phase 5: Accessibility & UI Consistency
- Axe automated scans across all major route templates with 0 critical/serious violations.
- High-contrast typography and color palette adherence in light and dark modes.
- Focus visible indicators and keyboard navigability for interactive buttons and dialogs.

### Phase 6: Performance & Production Build Verification
- Production build compilation (`next build`).
- TypeScript typecheck (`tsc --noEmit`).
- Static route pre-rendering and dynamic route execution validation.
