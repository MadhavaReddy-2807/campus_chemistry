# Campus Chemistry — Component Inventory

Generated: 2026-11-14

---

## 1. Layout & Global Shell Components
- `src/app/layout.tsx`: Root HTML wrapper, metadata, stylesheet import, PWA registration.
- `src/app/PwaRegister.tsx`: Progressive Web App service worker registrar.
- `src/app/_components/DataState.tsx`:
  - `DataState`: Consistent empty/error/waiting state card with custom titles, explanatory body copy, and action buttons.
  - `ModuleHeader`: Unified module header layout with eyebrow kicker, page title, and supporting subtitle.

## 2. Navigation Components
- **Desktop Sidebar Navigation** (`src/app/page.tsx:35`):
  - Brand lockup with "cc" mark and title.
  - Profile quick widget (`Avatar`, user institute tag, actions).
  - Primary navigation links: Home (`/`), Discover (`/discover`), Messages (`/messages`), Meetups (`/meetups`).
  - Secondary navigation: Clubs & Societies (`/communities`), Explore (`/explore`), Valentine's Hub (`/valentines`), Settings (`/settings`).
  - Sidebar bottom quick rails: Valentine's Week highlight and Safety Centre link.
- **Mobile Bottom Navigation Bar** (`src/app/page.tsx:58`):
  - Touch targets for Home, Discover, Messages, Meetups, and sticky Create post (`/create`) action.
  - Badge counts for unread messages and active notifications.

## 3. Social & Story Components
- `StoryRingBar` (`src/app/stories/StoryRingBar.tsx`):
  - Horizontal scrollable story rings with unread gradients and author avatars.
  - Full-screen modal story viewer with 5-second auto-advancing progress bar.
  - Tap / click left/right navigation, keyboard space/arrow support.
  - In-story reply input with direct message delivery.
- `PostCard` (`src/app/feed/page.tsx:98`):
  - Post header with author avatar, username, institute badge, and timestamp.
  - Post text body with line break handling.
  - Interactive Like button with optimistic toggling and count update.
  - Comment input form with character limits and submit action.

## 4. Dating & Matchmaking Components
- `DiscoverCard` (`src/app/page.tsx:52`, `src/app/discover/page.tsx`):
  - Profile avatar / photo placeholder with institute verification stamp.
  - Compatibility reason chip (e.g. "You both like discovering new cafés").
  - Interest chips (Design, Indie music, Coffee, etc.).
  - Pass (`×`) and Like (`♡`) primary buttons.
  - Profile reporting / blocking action menu.
- `SecretCrushCard` (`src/app/valentines/SecretCrushCard.tsx`):
  - Client-side SHA-256 hash computation of campus emails.
  - Private submission form with zero-leak confirmation.
  - Mutual reveal notification banner.
- `ValentinesCountdown` (`src/app/valentines/ValentinesCountdown.tsx`):
  - High-precision countdown clock to Valentine's Week launch.
  - Days, hours, minutes, seconds tiles with graceful fallback.
- `DateSafetyModal` (`src/app/valentines/DateSafetyModal.tsx`):
  - Campus date safety checklist dialog.
  - Location sharing prompt with trusted hostel peers.

## 5. Communities & Events Components
- `InstitutePicker` (`src/app/onboarding/InstitutePicker.tsx`):
  - Instant client search filter for 54 IIT/NIT institutions.
  - Badges distinguishing IIT vs NIT campuses.
  - Selection cards with city and state information.
- `VerificationForm` (`src/app/onboarding/VerificationForm.tsx`):
  - Institute email domain validator.
  - Input with domain autofill / check.
- `EventChat` (`src/app/meetups/[id]/EventChat.tsx`):
  - Confirmed attendee live group chat for campus meetups.
  - Message bubble list with sender timestamps.
  - Chat input box with instant send handler.
- `MessageThread` (`src/app/messages/[id]/MessageThread.tsx`):
  - End-to-end authorized 1-on-1 direct messaging conversation view.
  - Real-time message reception and display.

## 6. Admin & Operations Components
- `AdminKPI` (`src/app/admin/page.tsx:48`):
  - Metric tiles for Verified Students, Pending Verifications, Active Meetups, and Open Reports.
- `ModerationCard` (`src/app/admin/page.tsx:82`):
  - Safety incident summary with reporter context, reported reason, and actionable Dismiss/Suspend triggers.
- `VerificationCard` (`src/app/admin/verifications/page.tsx:24`):
  - Pending student verification request card with domain proof and Approve/Reject buttons.
