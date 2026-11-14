# Campus Chemistry — Route Inventory

Generated: 2026-11-14
Framework: Next.js 16.4.6 App Router
Application: Campus Chemistry (IIT/NIT Exclusive Dating & Social Platform)

---

## Complete Route Directory

| # | Route Path | Component / Page File | Auth Requirement | User Roles | Description | Interactive Elements |
|---|---|---|---|---|---|---|
| 1 | `/` | `src/app/page.tsx` | Public / Preview | Any | Campus chemistry landing & primary dashboard | Desktop sidebar nav, mobile bottom nav, featured match card (like/pass), composer quick trigger, event link |
| 2 | `/login` | `src/app/(auth)/login/page.tsx` | Unauthenticated | Anonymous / Returning | User login form | Email input, password input, sign in button, switch to signup link |
| 3 | `/signup` | `src/app/(auth)/signup/page.tsx` | Unauthenticated | Anonymous / Prospective | User registration form | Institute email input, password input, sign up button, switch to login link |
| 4 | `/onboarding` | `src/app/onboarding/page.tsx` | Authenticated | Students | 54 IIT/NIT selection step | Institute search filter, institute type badges, institute selection card buttons |
| 5 | `/onboarding/verify` | `src/app/onboarding/verify/page.tsx` | Authenticated | Students | Institute email domain verification & ID upload | Institute email input, submit verification button, status indicators |
| 6 | `/feed` | `src/app/feed/page.tsx` | Authenticated / Public Fallback | Verified Students | Campus social feed & ephemeral stories | Story ring items, create post trigger, like post buttons, comment submission forms |
| 7 | `/create` | `src/app/create/page.tsx` | Authenticated | Verified Students | Create campus moment / post | Textarea body, audience selector (campus/followers/public), submit button |
| 8 | `/explore` | `src/app/explore/page.tsx` | Authenticated / Public Fallback | Verified Students | Campus student & keyword search | Search query input, submit search button, profile navigation links |
| 9 | `/profile` | `src/app/profile/page.tsx` | Authenticated / Public Fallback | Verified Students | User or peer student profile | Edit profile link (if owner), follow/unfollow button (if visitor), privacy links |
| 10 | `/edit-profile` | `src/app/edit-profile/page.tsx` | Authenticated | Verified Students | Profile details editing form | Display name, username, bio, degree, study year, department inputs, save button |
| 11 | `/discover` | `src/app/discover/page.tsx` | Authenticated / Public Fallback | Verified (18+ & Dating Enabled) | Romantic discovery & profile cards | Like button, pass button, block button, view profile links |
| 12 | `/matches` | `src/app/matches/page.tsx` | Authenticated / Public Fallback | Verified Students | Mutual match cards & conversation launchers | Open conversation link, profile link |
| 13 | `/messages` | `src/app/messages/page.tsx` | Authenticated / Public Fallback | Verified Students | Direct message inbox | Conversation row links, explore discovery link |
| 14 | `/messages/[id]` | `src/app/messages/[id]/page.tsx` | Authenticated (Participant) | Conversation Member | Live direct message thread | Message thread, text input, send message button |
| 15 | `/meetups` | `src/app/meetups/page.tsx` | Authenticated / Public Fallback | Verified Students | Campus meetups & real-world events | Category filter tabs, event cards, RSVP triggers, create meetup link |
| 16 | `/meetups/create` | `src/app/meetups/create/page.tsx` | Authenticated | Verified Students | Host new campus meetup | Title, description, category, capacity, start/end datetime, venue inputs, submit |
| 17 | `/meetups/[id]` | `src/app/meetups/[id]/page.tsx` | Authenticated / Public Fallback | Verified Students | Meetup detail, attendee list & event chat | RSVP form, withdraw RSVP form, attendee EventChat input and messages |
| 18 | `/communities` | `src/app/communities/page.tsx` | Authenticated / Public Fallback | Verified Students | Campus clubs & societies directory | Category filter chips, join/leave forms, club detail links, create club link |
| 19 | `/communities/create` | `src/app/communities/create/page.tsx` | Authenticated | Verified Students | Create new campus club/guild | Club name, category selector, description textarea, publish button |
| 20 | `/communities/[id]` | `src/app/communities/[id]/page.tsx` | Authenticated / Public Fallback | Verified Students | Club details, members & forum discussions | Join/leave button, discussion post form, discussion cards |
| 21 | `/notifications` | `src/app/notifications/page.tsx` | Authenticated / Public Fallback | Verified Students | Notifications stream | Mark all as read button, deep links |
| 22 | `/safety` | `src/app/safety/page.tsx` | Public | All | Campus safety hub & guidelines | Safety guide cards, emergency tips, report incident link |
| 23 | `/safety/report` | `src/app/safety/report/page.tsx` | Authenticated | Verified Students | Incident and abuse reporting form | Reported user ID input, reason dropdown, details textarea, submit report button |
| 24 | `/settings` | `src/app/settings/page.tsx` | Authenticated / Public Fallback | Verified Students | Account settings menu | Links to privacy, notifications, account/data, profile, safety |
| 25 | `/settings/privacy` | `src/app/settings/privacy/page.tsx` | Authenticated | Verified Students | Privacy, consent & discovery controls | Social visibility selector, message permission selector, dating checkbox, cross-campus checkbox, activity checkbox, save button |
| 26 | `/settings/notifications` | `src/app/settings/notifications/page.tsx` | Authenticated | Verified Students | Notification preferences | In-app, email, push, read receipts, active status checkboxes, save button |
| 27 | `/settings/account` | `src/app/settings/account/page.tsx` | Authenticated | Verified Students | Account & data lifecycle | Download export button, request account deletion form button |
| 28 | `/valentines` | `src/app/valentines/page.tsx` | Public / Verified | All Students | Valentine's Week Hub | Live countdown timer, Secret Crush SHA-256 matchmaker, Date Safety modal trigger, icebreakers |
| 29 | `/admin` | `src/app/admin/page.tsx` | Authenticated (Moderator/Admin) | Moderator / Admin | Operations & safety moderation dashboard | KPI metric cards, safety report list, review verifications link, dismiss/suspend actions |
| 30 | `/admin/verifications` | `src/app/admin/verifications/page.tsx` | Authenticated (Moderator/Admin) | Moderator / Admin | Verification queue for student emails | Pending request list, approve button, reject button |
| 31 | `/account/export` | `src/app/account/export/route.ts` | Authenticated | Verified Students | JSON data export route handler | HTTP GET returns JSON attachment |
