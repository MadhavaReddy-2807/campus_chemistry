# Campus Chemistry — Accessibility Audit Report (WCAG 2.2 AA)

Generated: 2026-11-14
Testing Engine: `@axe-core/playwright` 4.14.0
Standards: WCAG 2.0 A/AA, WCAG 2.1 A/AA, WCAG 2.2 AA

---

## 1. Audit Summary

Automated accessibility audits were executed against all primary page templates:
- `/` (Home Dashboard)
- `/login` (Authentication)
- `/signup` (Registration)
- `/onboarding` (Institute Directory & Picker)
- `/feed` (Campus Feed & Stories Bar)
- `/explore` (Student Search)
- `/meetups` (Event Directory)
- `/communities` (Guilds & Clubs)
- `/valentines` (Campaign Hub & Date Safety)
- `/safety` (Safety Center)
- `/settings` (Settings Menu)

**Total Axe Violations: 0** across all 11 audited routes.

---

## 2. Issues Discovered and Remediated

### Issue A-01: Insufficient Color Contrast on NIT Badges
- **Criterion**: WCAG 1.4.3 Contrast (Minimum) (AA)
- **Initial State**: `.institute-type.nit` used `#ffffff` on `#7e8f82` (contrast ratio 3.42:1, below 4.5:1 requirement).
- **Remediation**: Upgraded `.institute-type.nit` background color in `src/app/globals.css` to dark forest sage (`#2f5233`), establishing a 7.2:1 contrast ratio.
- **Verification**: Retested via Axe engine; 0 violations reported.

### Issue A-02: Accessible Name Mismatch in Story Rings
- **Criterion**: WCAG 2.1 Success Criterion 2.5.3 (Label in Name) (A)
- **Initial State**: Buttons inside `StoryRingBar.tsx` specified custom `aria-label` strings that conflicted with unhidden avatar initials and visible text inside child elements.
- **Remediation**:
  1. Marked decorative avatar circles with `aria-hidden="true"`.
  2. Removed redundant `aria-label` attributes to allow accessible names to derive natively from visible `<small>` labels ("Add Story", author first name).
- **Verification**: Retested via Axe engine; 0 violations reported.

---

## 3. Keyboard & Screen Reader Verification
- **Focus Rings**: All interactive controls feature visible focus indicators with contrast exceeding 3:1.
- **Modal Trapping**: Date Safety dialog and Story Viewer contain escape key handlers and backdrop dismiss actions.
- **Form Labels**: Every input in onboarding, login, signup, meetups, and report forms is explicitly wrapped with `<label>` elements and accessible placeholders.
