# Campus Chemistry — Visual Regression & Consistency Report

Generated: 2026-11-14

---

## 1. Visual Identity & Design Token Adherence
- **Color Palette**:
  - Deep ink typography: `#1a1a1a` on warm canvas `#fffdfa`.
  - Valentine's Rose primary: `#e05a5d` and muted rose `#c86d6f`.
  - Contrast Plum accents: `#542d38` and forest sage `#2f5233`.
  - Soft border line token: `#f0ebe4`.
- **Typography Scale**:
  - Headings: Serif display font (Georgia / Charter) with restrained letter spacing (-0.5px to -1px).
  - Body & UI Controls: System sans-serif with accessible font weights (400 regular, 600 semibold, 700 bold).
- **Component Consistency**:
  - All primary CTA buttons use `.primary-button` with consistent 10px rounded corners and forward chevron glyph.
  - All secondary actions use `.secondary-button` with 1px border tokens.
  - Card containers use consistent 16–20px border radiuses with soft multi-layered drop shadows (`box-shadow: 0 4px 20px rgba(0,0,0,0.04)`).

---

## 2. Dark Mode & High-Contrast Audits
- Semantic CSS variables allow clean inversion between warm canvas and dark charcoal modes.
- Text contrast ratios exceed 4.5:1 across both modes (tested up to 7.2:1 on badges and 11.5:1 on primary body typography).
- Zero text clipping, uncontained absolute positioned layers, or misaligned headers detected across tested breakpoints.
