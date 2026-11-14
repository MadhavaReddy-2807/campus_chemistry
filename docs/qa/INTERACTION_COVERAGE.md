# Campus Chemistry — Interaction Coverage Report

Generated: 2026-11-14

---

## 1. Interactive Controls Matrix

Every interactive button, form, input, selector, and modal trigger across the platform was cataloged and verified under `tests/interactions.spec.ts`.

| Component / Surface | Control Selector | Type | Intended Behavior | Persisted State / Effect | Test Result |
|---|---|---|---|---|---|
| Featured Match Card (`/`) | `button[aria-label='Like Naina']` | Icon Button | Toggles private like state | Adds `.is-liked`, displays toast notification | PASS |
| Featured Match Card (`/`) | `button[aria-label='Pass on Naina']` | Icon Button | Dismisses card for current session | Displays dismissal toast notification | PASS |
| Desktop Sidebar (`/`) | `nav a.nav-item` | Navigation Links | Client-side page navigation | URL changes cleanly without full reload | PASS |
| Mobile Bottom Bar (`/`) | `.mobile-nav a` | Touch Bar Links | Mobile tab switching | Updates active icon state and route | PASS |
| Institute Picker (`/onboarding`) | `input[placeholder='Search IIT or NIT']` | Search Input | Real-time filter over 54 campuses | Hides non-matching cards, preserves matching | PASS |
| Institute Picker (`/onboarding`) | `.institute-option input[type='radio']` | Radio Button | Selects institute for server draft | Sets active selection border | PASS |
| Verification Form (`/onboarding/verify`) | `input[name='email']` | Email Input | Validates official institute email domain | Enforces domain regex against institute record | PASS |
| Stories Ring Bar (`/feed`) | `.story-ring-item` | Button | Opens full-screen story viewer | Triggers modal, starts 5s progress timer | PASS |
| Story Viewer (`StoryRingBar`) | `.story-close-btn` | Icon Button | Closes story modal | Resets progress bar, returns to feed | PASS |
| Valentine's Matchmaker (`/valentines`) | `input[name='targetIdentifier']` | Text Input | Accepts crush email / username | Computes client-side SHA-256 hash | PASS |
| Valentine's Matchmaker (`/valentines`) | `button:has-text('Seal Crush')` | Primary Button | Submits encrypted secret crush | Displays cryptographic confirmation or auth notice | PASS |
| Date Safety Modal (`/valentines`) | `button:has-text('Create Date Safety Plan')` | Button | Opens safety checklist modal | Displays checklist & WhatsApp link builder | PASS |
| Date Safety Modal (`/valentines`) | `.safety-plan-modal input[type='checkbox']`| Checkbox | Toggles checklist items | Checks state interactively | PASS |
| Date Safety Modal (`/valentines`) | `button:has-text('✕')` | Button | Dismisses date safety modal | Closes backdrop | PASS |
| Communities Directory (`/communities`) | `.community-card h2 a` | Link | Navigates to club discussion thread | Opens `/communities/[id]` | PASS |
| Communities Detail (`/communities/[id]`) | `button:has-text('Join this Community')` | Primary Button | Toggles club membership | Submits `toggleCommunityMembership` server action | PASS |
| Safety Reporting (`/safety/report`) | `form.post-form select[name='reason']` | Dropdown | Selects harassment or abuse reason | Updates form submission payload | PASS |
| Safety Reporting (`/safety/report`) | `button:has-text('Submit private report')`| Primary Button | Submits confidential report | Logs encrypted report to moderation queue | PASS |
| Privacy Controls (`/settings/privacy`) | `select[name='socialVisibility']` | Dropdown | Changes social profile visibility | Saves public/private setting server-side | PASS |
| Privacy Controls (`/settings/privacy`) | `input[name='datingVisibility']` | Toggle Checkbox | Enables/disables romantic discovery | Updates dating flag atomically in PostgreSQL | PASS |
| Account Deletion (`/settings/account`) | `button:has-text('Request deletion')` | Action Button | Logs account deletion request | Records pending deletion request | PASS |
| Data Export (`/settings/account`) | `a[href='/account/export']` | Action Link | Downloads JSON profile archive | Returns HTTP 200 with JSON attachment (when auth) | PASS |
| Admin Dashboard (`/admin`) | `button:has-text('Dismiss')` | Action Button | Resolves reported safety incident | Dismisses report in database | PASS |
| Admin Verification (`/admin/verifications`)| `button:has-text('Approve')` | Action Button | Grants verified student status | Updates profile `verification_status` to `verified` | PASS |

Total Controls Inventoried: **24**
Tested and Working: **24**
Dead / Broken Controls: **0**
