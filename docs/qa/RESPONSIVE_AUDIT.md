# Campus Chemistry — Responsive Layout Audit

Generated: 2026-11-14
Test Engine: Playwright Test (`tests/responsive.spec.ts`)

---

## 1. Viewport Matrix Results

All 9 target device profiles were evaluated against three distinct page templates: Landing/Home (`/`), Onboarding (`/onboarding`), and Communities (`/communities`).

| Device Category | Width | Height | Tested Device Profile | Horizontal Overflow (px) | Navigation Mode | Audit Result |
|---|---|---|---|---|---|---|
| **Small mobile** | 320px | 568px | iPhone SE (1st gen) | 0px | Mobile bottom nav bar | PASS |
| **Standard mobile** | 375px | 667px | iPhone SE (2nd gen) | 0px | Mobile bottom nav bar | PASS |
| **Modern mobile** | 390px | 844px | iPhone 14 / iPhone 15 | 0px | Mobile bottom nav bar | PASS |
| **Large mobile** | 430px | 932px | iPhone 15 Pro Max | 0px | Mobile bottom nav bar | PASS |
| **Tablet** | 768px | 1024px | iPad Mini / Air | 0px | Desktop adaptive sidebar | PASS |
| **Small laptop** | 1024px | 768px | iPad Pro / MacBook Air 11" | 0px | Desktop persistent sidebar | PASS |
| **Desktop** | 1280px | 800px | Standard Laptop | 0px | Desktop persistent sidebar | PASS |
| **Large desktop** | 1440px | 900px | MacBook Pro 16" | 0px | Desktop multi-column grid | PASS |
| **Wide desktop** | 1920px | 1080px | Full HD Display | 0px | Desktop multi-column grid | PASS |

---

## 2. Layout Breakdown

### Mobile Experience (320px – 767px)
- **Primary Navigation**: Fixed bottom navigation bar (`.mobile-nav`) with touch-friendly 44px+ hit targets.
- **Top Bar**: Minimalist header with compact brand mark (`cc`) and quick action buttons.
- **Content Stacking**: Sidebar hidden; discovery cards, social moments, and event listings adapt to single-column flex/grid layouts.
- **Safe-Area Insets**: Bottom padding includes `env(safe-area-inset-bottom)` to prevent interference with mobile home gestures.

### Desktop Experience (1024px – 1920px)
- **Navigation**: Persistent 260px left sidebar with brand identity, user profile status chip, primary navigation, and secondary utility links.
- **Content Grid**: Multi-column layout featuring main feed / discovery cards (580px width) and right-side contextual panels for events, suggestions, and quick actions.
- **Hover & Focus**: Distinct hover micro-interactions on interactive cards and buttons with focus rings for keyboard navigation.

### Tablet Experience (768px – 1023px)
- Intermediate breakpoint gracefully collapses right auxiliary column while preserving content readability without horizontal scrolling.
