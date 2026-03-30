# Project Context — Portfolio Template

> This document contains everything an agent needs to continue working on this project.
> All content is placeholder/template text — ready to be filled in.

## Pages

| Page | File | URL |
|------|------|-----|
| Landing | index.html | /index.html |
| Case Study (template) | case-study.html | /case-study.html |
| Design System | design-system.html | /design-system.html |

## File Structure

```
css/
  variables.css    — all design tokens
  base.css         — reset, layout, spacers, animations
  nav.css          — shared navbar (both pages)
  hero.css         — hero section (landing)
  work.css         — work carousel (landing)
  about.css        — about section (landing)
  capabilities.css — capabilities + .section-title (landing)
  approach.css     — approach grid (landing)
  clients.css      — clients marquee (landing)
  testimonials.css — testimonials carousel (landing)
  contact.css      — contact + FAQ (landing)
  footer.css       — shared footer (both pages)
  case-study.css   — case study page styles
  animations.css   — page transitions + scroll reveal

js/
  theme.js         — dark/light toggle
  nav-scroll.js    — adds .scrolled class on scroll (nav glass effect)
  reveal.js        — IntersectionObserver for .reveal elements
  scroll-reveal.js — scroll reveal for case study elements
  faq.js           — FAQ accordion
  testimonials-fade.js  — left fade on testimonials scroll
  testimonials-dots.js  — dot indicators for testimonials
  debug.js         — inspector tool
  editor.js        — live editor tool
```

## Breakpoints

Only TWO breakpoints:
- **Tablet**: `@media (min-width: 700px)`
- **Desktop**: `@media (min-width: 1280px)`

## Typography Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--text-display` | 40px | hero titles |
| `--text-heading` | 32px | section titles, case study headings |
| `--text-title` | 20px | card titles, body text (tablet+), nav logo |
| `--text-body` | 16px | main text (mobile), nav pills |
| `--text-caption` | 12px | meta labels (mobile), footer |

### Responsive Font Sizes

| Element | Mobile | Tablet | Desktop |
|---------|--------|--------|---------|
| Hero title | 32px | clamp(32-40px) | 72px |
| About heading | 32px | 32px | 48px |
| Section titles | 20px | 32px | 32px |
| Body text | 16px | 20px | 20px |
| About body | 16px | 20px | 22px |
| Testimonial quote | 16px | 20px | 22px |
| Case study h1 | 32px | 40px | 72px |
| Case study body | 16px | 20px | 20px |
| Case study caption | 14px | 18px | 18px |
| Nav logo | 18px | 20px | 22px |

## Spacing Scale

| Token | Value |
|-------|-------|
| `--space-xs` | 8px |
| `--space-sm` | 12px |
| `--space-md` | 16px |
| `--space-lg` | 24px |
| `--space-xl` | 32px |
| `--space-2xl` | 40px |
| `--space-3xl` | 48px |
| `--space-4xl` | 80px |
| `--space-section` | 120px |
| `--space-section-lg` | 200px |

## Container Padding

| | Mobile | Tablet | Desktop |
|--|--------|--------|---------|
| `--container-px` | 24px | 48px | 240px |
| `--container-wide-px` | 24px | 48px | 48px |

## Section Spacers (Landing)

| Class | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| `.spacer-sm` | 48px | 52px | 120px |
| `.spacer` | 80px | 120px | 200px |

## Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius` | 12px | small elements |
| `--radius-card` | 16px | cards, media frames |
| `--radius-pill` | 999px | pills, tags |

## Color System

### Light
- `--bg`: #faf9f6
- `--bg-alt`: #f0eee9
- `--surface`: #eceae4
- `--border`: #e0ddd6
- `--text`: #1a1816
- `--text-muted`: #6b6660

### Dark
- `--bg`: #111110
- `--bg-alt`: #1a1918
- `--surface`: #222120
- `--border`: #2a2928
- `--text`: #f0ece4
- `--text-muted`: #7a7670

### Glass (theme-aware)
- Light: solid `--surface` fills, no blur
- Dark: semi-opaque `rgba(30,29,28,0.75)` + blur(40px) saturate(150%)
- `--glass-surface-hover`: dark `rgba(40,39,38,0.85)`
- `--glass-border`: dark `rgba(255,255,255,0.12)`
- Always use `var(--glass-*)` tokens

## Navigation

### Mobile
- Logo: top-left, 18px, opacity 0.5
- Nav: fixed bottom center, glass pill bar
- Case study: close button 32px circle, fixed top-right

### Tablet/Desktop
- Logo: top-left, 20-22px
- Nav: fixed top-right, transparent → glass on scroll
- Case study: close 40px circle, fixed top-right, always glass
- Nav padding: 34px top

## Key Patterns

1. **No hardcoded colors** — always use var(--token)
2. **Glass adapts per theme** — light=solid, dark=semi-opaque+blur
3. **Social buttons** — solid surface+border, not glass
4. **FAQ card** — glass surface with thin border
5. **Tags** — outline pills with --tag-border
6. **Animations** — page fade-in (opacity only, no transform on body) + scroll reveal
7. **Footer** — same on all pages, logo left + social right on mobile
8. **Spacers** — visible div elements with IDs for DevTools inspection
9. **Theme toggle** — SVG icons (moon/sun), circle button with transparent bg + thin border
10. **All text is template** — placeholder text ready to be replaced
11. **All work cards link to case-study.html** — single template page
12. **About photo** — placeholder div, no img tags yet

## Hardcoded Values (Known)

These are intentional and not tokens:
- Nav padding-top: 34px (pixel-perfect alignment)
- Close button top: 39px mobile, 40px tablet
- Hero desktop: 72px
- About desktop heading: 48px
- About desktop body: 22px
- Case study desktop h1: 72px
- FAQ padding: 8px 28px
