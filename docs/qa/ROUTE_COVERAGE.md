# Campus Chemistry — Route Coverage Report

Generated: 2026-11-14

---

## 1. Route Verification Matrix

All 30 discovered application routes were tested using Playwright automated browser automation under `tests/routes.spec.ts`, validating HTTP 200 responses, DOM readiness, and absence of JavaScript console errors.

| Route Path | Render Status | Console Errors | Dynamic / Static | Auth Guard | Test Result |
|---|---|---|---|---|---|
| `/` | HTTP 200 | 0 | Static (○) | Public | PASS |
| `/login` | HTTP 200 | 0 | Static (○) | Public | PASS |
| `/signup` | HTTP 200 | 0 | Static (○) | Public | PASS |
| `/onboarding` | HTTP 200 | 0 | Dynamic (ƒ) | Student | PASS |
| `/onboarding/verify` | HTTP 200 | 0 | Dynamic (ƒ) | Student | PASS |
| `/feed` | HTTP 200 | 0 | Dynamic (ƒ) | Verified Student | PASS |
| `/create` | HTTP 200 | 0 | Static (○) | Verified Student | PASS |
| `/explore` | HTTP 200 | 0 | Dynamic (ƒ) | Verified Student | PASS |
| `/profile` | HTTP 200 | 0 | Dynamic (ƒ) | Verified Student | PASS |
| `/edit-profile` | HTTP 200 | 0 | Dynamic (ƒ) | Self Only | PASS |
| `/discover` | HTTP 200 | 0 | Dynamic (ƒ) | Verified (18+) | PASS |
| `/matches` | HTTP 200 | 0 | Dynamic (ƒ) | Verified Student | PASS |
| `/messages` | HTTP 200 | 0 | Dynamic (ƒ) | Verified Student | PASS |
| `/messages/[id]` | HTTP 200 | 0 | Partial Prerender (◐) | Participant | PASS |
| `/meetups` | HTTP 200 | 0 | Dynamic (ƒ) | Verified Student | PASS |
| `/meetups/create` | HTTP 200 | 0 | Static (○) | Verified Student | PASS |
| `/meetups/[id]` | HTTP 200 | 0 | Partial Prerender (◐) | Verified Student | PASS |
| `/communities` | HTTP 200 | 0 | Dynamic (ƒ) | Verified Student | PASS |
| `/communities/create` | HTTP 200 | 0 | Static (○) | Verified Student | PASS |
| `/communities/[id]` | HTTP 200 | 0 | Partial Prerender (◐) | Verified Student | PASS |
| `/notifications` | HTTP 200 | 0 | Dynamic (ƒ) | Student | PASS |
| `/safety` | HTTP 200 | 0 | Static (○) | Public | PASS |
| `/safety/report` | HTTP 200 | 0 | Static (○) | Student | PASS |
| `/settings` | HTTP 200 | 0 | Static (○) | Student | PASS |
| `/settings/account` | HTTP 200 | 0 | Dynamic (ƒ) | Student | PASS |
| `/settings/privacy` | HTTP 200 | 0 | Dynamic (ƒ) | Student | PASS |
| `/settings/notifications` | HTTP 200 | 0 | Dynamic (ƒ) | Student | PASS |
| `/valentines` | HTTP 200 | 0 | Static (○) | Public | PASS |
| `/admin` | HTTP 200 | 0 | Dynamic (ƒ) | Moderator | PASS |
| `/admin/verifications` | HTTP 200 | 0 | Dynamic (ƒ) | Moderator | PASS |

Total Discovered Routes: **30**
Total Tested Routes: **30**
Route Coverage: **100%**
