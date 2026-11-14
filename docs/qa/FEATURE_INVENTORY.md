# Campus Chemistry — Feature Inventory

Generated: 2026-11-14
Target Release: Valentine's Week 2027

---

## 1. Authentication & Campus Verification
- **Email & Password Authentication**: Supabase Auth with server-side cookie sessions (`@supabase/ssr`).
- **IIT/NIT Verification Engine**:
  - Official directory of 54 premier institutes (23 IITs, 31 NITs).
  - Exact regex and domain matching against authorized domains (e.g. `iitb.ac.in`, `nitt.edu`).
  - Time-limited verification tokens (`expires_at`), anti-tampering RLS policies.
  - Public directory access for onboarding with strict data minimization.
  - Manual verification escalation queue for administration.

## 2. Onboarding Workflow
- **Multi-Step Flow**:
  1. Institute Selection (`/onboarding`) with live search across 54 campuses.
  2. Institute Email Verification (`/onboarding/verify`) with domain validation.
  3. Profile Creation: Name, date of birth, degree, department, study year, bio.
  4. Preferences: Social vs Dating, Age eligibility check (18+ strictly enforced).

## 3. Social Networking & Feed
- **Campus Post Creation** (`/create`): Text up to 2,200 chars with configurable audience (`campus`, `followers`, `public`).
- **Campus Feed** (`/feed`): Database-backed posts from verified peers, timestamp formatting, verified student badges.
- **Interactions**: Like / unlike posts with atomic counter and unique constraints; threaded comments up to 1,000 chars.
- **24-Hour Ephemeral Stories** (`StoryRingBar`):
  - 5-second auto-advancing progress bar.
  - Interactive tap/keyboard next/prev navigation.
  - Direct message replies from story viewer.
  - Automatic expiration filtering (`gt('expires_at', now)`).

## 4. Dating Discovery & Matchmaking
- **Consent Isolation**: Dating is opt-in, restricted to verified users 18+, separate from general social networking.
- **Discovery Cards** (`/discover`): Browse eligible profiles with common interests, year of study, campus distance.
- **Actions**:
  - **Like** (`sendDiscoveryAction('like')`): Recorded privately.
  - **Pass** (`sendDiscoveryAction('pass')`): Silent dismissal.
  - **Block** (`blockUser`): Immediate mutual isolation across discovery, messaging, and search.
- **Mutual Match Lifecycle** (`/matches`):
  - When mutual like occurs, an active match is created in `matches`.
  - Automatically initializes a shared conversation record.

## 5. Direct & Real-Time Messaging
- **Inbox** (`/messages`): List of active conversations, match links, and unread counts.
- **Message Thread** (`/messages/[id]`):
  - End-to-end authorized messaging: only conversation members can read/send.
  - Database persistence with timestamps and sender attribution.
  - Real-time client subscription (`supabase.channel`).

## 6. Real-World Campus Meetups & Events
- **Meetup Directory** (`/meetups`): Category filtering (outdoors, tech, social, culture).
- **Meetup Host Flow** (`/meetups/create`): Title, description, approximate venue, start/end time, capacity limit.
- **RSVP & Capacity Management**:
  - Direct RSVP and withdraw options.
  - Capacity bounds enforced.
- **Attendee Event Chat** (`/meetups/[id]/EventChat`): Dedicated realtime group discussion restricted to confirmed attendees.

## 7. Campus Communities & Guilds
- **Club Directory** (`/communities`): 8 categories (Tech, Arts, Jamming, Sports, Literature, Gaming, Startups, Research).
- **Club Creation** (`/communities/create`): Custom club name, category, and mission statement.
- **Club Detail & Discussion** (`/communities/[id]`): Discussion threads, member counts, one-click join/leave.

## 8. Valentine's Week Experience
- **Campaign Hub** (`/valentines`): Daily themed prompts from Feb 7 (Rose Day) through Feb 14 (Valentine's Day).
- **Live Countdown Timer** (`ValentinesCountdown`): Controllable client timer displaying days, hours, minutes, seconds to campaign launch.
- **Secret Crush Matchmaker** (`SecretCrushCard`):
  - Client-side SHA-256 cryptographic hashing of institute email address.
  - Zero-knowledge match reveal: identity remains completely private until both parties enter matching hashes.
- **Campus Date Safety Kit** (`DateSafetyModal`): Emergency contacts, public venue checklists, shareable date plans with trusted hostel friends.

## 9. Search & Safety Operations
- **Explore & Search** (`/explore`): Case-insensitive query over verified public profiles, safe substring matching.
- **Safety Center & Incident Reporting** (`/safety`, `/safety/report`): Confidential reporting directly to moderators.
- **Admin Dashboard** (`/admin`, `/admin/verifications`):
  - Operational KPI cards (verified students, pending verifications, meetups, reports).
  - Safety report queue with dismissal/suspension options.
  - Institute verification queue with approve/reject workflows.

## 10. Privacy & Data Lifecycle
- **Privacy Controls** (`/settings/privacy`): Granular toggles for social visibility, message permissions, dating visibility, cross-campus discovery.
- **Data Export** (`/account/export`): Complete personal data export in structured JSON format.
- **Account Deletion** (`/settings/account`): Formal deletion request logging with safety audit retention.
