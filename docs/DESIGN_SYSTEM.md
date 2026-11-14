# Design system

## Direction

Warm off-white canvas, deep charcoal text, muted rose/coral actions, blush surfaces, and restrained burgundy emphasis. The product is romantic and social without becoming candy-colored. Dark mode uses charcoal surfaces and softened rose accents.

## Tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| canvas | `#F8F6F2` | `#171615` | page background |
| surface | `#FFFFFF` | `#242220` | cards, sheets |
| ink | `#211F1D` | `#F7F1EA` | primary text |
| muted | `#746E67` | `#B7AEA5` | secondary text |
| rose | `#B85C69` | `#DE8994` | primary action |
| coral | `#E78269` | `#F09B7F` | accent / success warmth |
| burgundy | `#6E2D3A` | `#E59BA7` | emphasis |
| line | `#E8E1D9` | `#3A3531` | borders |

Use a 4px base spacing scale, 12px control radius, 18px card radius, and 28px feature surface radius. Typography uses a humanist sans for UI and a restrained serif display face only for campaign moments. Avoid gradients except for image overlays.

## Responsive composition

- Mobile 320–767: bottom nav, full-screen discovery cards, bottom sheets, edge-to-edge media, safe-area padding.
- Tablet 768–1023: compact rail plus single content column; preserve touch targets and avoid desktop density.
- Desktop 1024+: left rail, main content, optional contextual right rail, split-pane inbox.

## Component rules

Every interactive component has visible focus, keyboard behavior, disabled/loading states, and an accessible name. Required primitives include buttons, inputs, selects, chips, profile/post/event cards, stories, messages, tabs, dialogs, sheets, toasts, skeletons, empty/error states, nav, photo galleries, verification marks, and safety controls.

Motion is purposeful and respects `prefers-reduced-motion`: card transitions, sheet entry, and toast movement only. Never use animation to obscure state changes or pressure a romantic response.

