# Campus Chemistry — API & Server Actions Inventory

Generated: 2026-11-14

---

## 1. Next.js Route Handlers (REST Endpoints)

| Method | Endpoint | File | Auth Required | Description |
|---|---|---|---|---|
| `GET` | `/account/export` | `src/app/account/export/route.ts` | Bearer/Cookie Session | Exports user profile, posts, comments, follows, events, notifications, reports, discovery actions as a structured JSON file attachment. |

---

## 2. Next.js Server Actions

| Action Name | Source File | Attached Forms/Controls | Validation / Constraints | Authorization |
|---|---|---|---|---|
| `signIn` | `src/app/(auth)/auth-actions.ts` | `/login` form | `email`, `password` | Public / Returning |
| `signUp` | `src/app/(auth)/auth-actions.ts` | `/signup` form | `email`, `password` (min 8 chars) | Public / New Students |
| `saveInstitute` | `src/app/onboarding/actions.ts` | `/onboarding` selection | `instituteId` in 54 institutes | Authenticated |
| `submitVerificationEmail` | `src/app/onboarding/actions.ts` | `/onboarding/verify` form | Institute domain check, regex | Authenticated |
| `createPost` | `src/app/create/actions.ts` | `/create` post form | `body` (max 2200), `audience` | Authenticated & Verified |
| `togglePostLike` | `src/app/feed/actions.ts` | `/feed` post like button | `postId` (UUID) | Authenticated & Verified |
| `createComment` | `src/app/feed/actions.ts` | `/feed` comment form | `postId`, `body` (max 1000) | Authenticated & Verified |
| `sendStory` | `src/app/stories/actions.ts` | `StoryRingBar` reply | `storyId`, `caption` | Authenticated & Verified |
| `sendDiscoveryAction` | `src/app/discover/actions.ts` | `/discover` like/pass buttons | `targetId`, `action` ('like'/'pass') | Authenticated, Verified, 18+, Dating Enabled |
| `toggleFollow` | `src/app/profile/follow-actions.ts`| `/profile` follow button | `targetId` (UUID) | Authenticated & Verified |
| `updateProfile` | `src/app/profile/actions.ts` | `/edit-profile` form | `displayName`, `username`, `bio`, `degree`, `dept`, `year` | Authenticated (Self only) |
| `sendMessage` | `src/app/messages/[id]/actions.ts`| `/messages/[id]` form | `conversationId`, `body` (max 4000) | Conversation Member |
| `createEvent` | `src/app/meetups/create/actions.ts`| `/meetups/create` form | `title`, `description`, `category`, `capacity`, dates, `venue` | Authenticated & Verified |
| `rsvpEvent` | `src/app/meetups/create/actions.ts`| `/meetups/[id]` RSVP button | `eventId` (UUID) | Authenticated & Verified |
| `withdrawRsvp` | `src/app/meetups/create/actions.ts`| `/meetups/[id]` withdraw button | `eventId` (UUID) | Authenticated & Verified |
| `sendEventChatMessage` | `src/app/meetups/[id]/event-chat-actions.ts` | `EventChat` input | `eventId`, `body` (max 1000) | Confirmed Attendee |
| `createCommunity` | `src/app/communities/actions.ts`| `/communities/create` form | `name` (3-100), `category`, `description` (10-1000) | Authenticated & Verified |
| `toggleCommunityMembership`| `src/app/communities/actions.ts`| `/communities/[id]` join/leave | `communityId` (UUID) | Authenticated & Verified |
| `createCommunityPost`| `src/app/communities/actions.ts`| `/communities/[id]` new post | `communityId`, `title`, `body` | Authenticated Member |
| `recordSecretCrush` | `src/app/valentines/actions.ts` | `SecretCrushCard` form | `targetHash` (SHA-256) | Authenticated & Verified |
| `markNotificationsRead` | `src/app/notifications/actions.ts` | `/notifications` button | User session | Authenticated |
| `reportUser` | `src/app/safety/actions.ts` | `/safety/report` form | `reportedUserId`, `reason`, `details` | Authenticated |
| `blockUser` | `src/app/safety/actions.ts` | `/discover` block button | `targetUserId` (UUID) | Authenticated |
| `updatePrivacy` | `src/app/settings/privacy/actions.ts` | `/settings/privacy` form | `socialVisibility`, `messagePermission`, checkboxes | Authenticated |
| `updateNotifications`| `src/app/settings/notifications/actions.ts` | `/settings/notifications` form | Push, in-app, email checkboxes | Authenticated |
| `requestAccountDeletion` | `src/app/settings/account/actions.ts` | `/settings/account` button | User session | Authenticated |
| `resolveReport` | `src/app/admin/actions.ts` | `/admin` actions | `reportId`, `resolution` | Moderator / Admin RPC |
| `reviewVerification` | `src/app/admin/actions.ts` | `/admin/verifications` actions | `requestId`, `decision` | Moderator / Admin RPC |

---

## 3. Database Functions & Stored Procedures (RPCs)
- `is_moderator()`: Returns boolean indicating whether current user has moderator/admin role.
- `calculate_compatibility(user_1, user_2)`: Server-side matching algorithm based on shared interests and campus preferences.
- `anonymize_student_record(user_id)`: Secure sanitization procedure for completed account deletions.
- `record_discovery_action(actor, target, action)`: Transactional discovery action with atomic mutual match resolution.
