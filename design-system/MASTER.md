# Secret Garden Design System

This project uses a soft iOS-inspired interface for a lightweight mobile configuration tool. The visual direction is not a marketing landing page. It should feel calm, compact, friendly, and easy to operate repeatedly on a phone.

## Design Direction

- Style: iOS 26 Liquid Glass, soft pink warmth, light configuration panels.
- Product feel: gentle assistant, not toy-like; polished utility, not enterprise-heavy.
- Primary surface: mobile-first web app with a centered desktop max width.
- Component library: Vue 3 + Vant. Prefer Vant primitives and project-local Apple-style utility classes.

## iOS 26 Liquid Glass Direction

Liquid Glass is the target material language for new visual work. In this Vue/Vant app, approximate it with CSS rather than trying to copy native APIs exactly.

Use Liquid Glass for:

- Login/register cards.
- Persistent navigation and floating controls.
- Sheets, popups, and modal surfaces.
- Important control clusters such as segmented controls and search/filter bars.

Avoid using Liquid Glass for:

- Dense text rows where transparency harms readability.
- Every nested element inside an already glassy panel.
- Decorative blobs, floating orbs, or heavy background effects.

CSS approximation:

```css
background:
  linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.46)),
  rgba(255, 255, 255, 0.38);
backdrop-filter: blur(28px) saturate(1.45) contrast(1.04);
-webkit-backdrop-filter: blur(28px) saturate(1.45) contrast(1.04);
border: 1px solid rgba(255, 255, 255, 0.56);
box-shadow:
  0 18px 45px rgba(180, 120, 140, 0.14),
  inset 0 1px 0 rgba(255, 255, 255, 0.9),
  inset 0 -1px 0 rgba(255, 255, 255, 0.26);
```

For Liquid Glass highlights, prefer pseudo-elements on the glass surface:

```css
.liquid-glass::before {
  content: '';
  position: absolute;
  inset: 1px;
  border-radius: inherit;
  pointer-events: none;
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.72), transparent 42%);
  opacity: 0.75;
}
```

Keep content contrast high. Text and form fields can sit on a slightly more opaque inner surface when needed.

## Core Principles

1. Preserve the existing soft pink iOS glass identity.
2. Use semantic tokens instead of one-off color values in views.
3. Keep layout dense enough for configuration work, but never cramped.
4. Make touch targets at least 44px high for tappable rows, cards, and controls.
5. Use icons from the existing Vant icon set unless a component already has another icon system.
6. Avoid decorative-only motion. Motion should communicate loading, attention, press feedback, or state change.
7. Keep page sections unframed where possible. Use cards for repeated items, configuration panels, prompts, sheets, and modals.

## Color Tokens

Use these as the shared palette for HomeView and future views.

```css
:root {
  --sg-brand: #ec4899;
  --sg-brand-soft: #f472b6;
  --sg-coral: #ff6767;
  --sg-warning: #faad14;
  --sg-warning-strong: #d48806;

  --sg-text: #1d1d1f;
  --sg-text-secondary: #6b6b70;
  --sg-text-muted: #8c8c8c;
  --sg-text-placeholder: #aeaeb2;

  --sg-page-bg-start: #fef6f9;
  --sg-page-bg-mid: #fdf1f5;
  --sg-page-bg-end: #f8f4f7;
  --sg-surface: rgba(255, 255, 255, 0.72);
  --sg-surface-solid: #ffffff;
  --sg-surface-muted: rgba(242, 242, 247, 0.56);
  --sg-border-glass: rgba(255, 255, 255, 0.42);
  --sg-separator: rgba(60, 60, 67, 0.08);
}
```

### Color Usage

- `--sg-brand`: primary actions, focus rings, selected states, important brand accents.
- `--sg-brand-soft`: gentle guide accents, decorative guide strokes, softer highlights.
- `--sg-coral`: account-required, bind-required, and warm attention states.
- `--sg-warning`: VIP, membership time, activity reward, and entitlement states.
- `--sg-text`: primary text on light surfaces.
- `--sg-text-secondary`: labels, descriptions, secondary metadata.
- `--sg-text-muted`: low-emphasis helper text. Avoid using it for primary instructions.

Do not introduce new pink, red, yellow, or blue values in views unless they are added to the token set with a clear role.

## Typography

Use system fonts. Avoid playful display fonts for the app shell and configuration UI.

```css
--sg-font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei',
  'Segoe UI', Roboto, sans-serif;
```

Recommended scale:

- Page or major card title: 18px, 600.
- Section title: 15px, 600.
- Row title: 15px, 400-500.
- Body/help text: 13px, 400, line-height 1.45-1.6.
- Caption: 12px, 400, line-height 1.4-1.5.
- Tiny labels: 11px, 600, only for metadata or compact section labels.

Avoid negative letter spacing in compact mobile UI. Existing iOS-inspired utility classes may keep subtle tracking, but new view styles should default to `letter-spacing: 0`.

## Radius

```css
--sg-radius-sm: 10px;
--sg-radius-md: 12px;
--sg-radius-card: 18px;
--sg-radius-sheet: 20px;
--sg-radius-pill: 999px;
```

- Cards and major panels: `18px`.
- Inputs, small controls, icon tiles: `10px` or `12px`.
- Bottom sheets and popups: `20px 20px 0 0`.
- Circular avatars/icons: use `50%` only for true circles.

## Surfaces And Glass

Default app page background:

```css
background: linear-gradient(
  170deg,
  var(--sg-page-bg-start) 0%,
  var(--sg-page-bg-mid) 42%,
  var(--sg-page-bg-end) 100%
);
```

Default Liquid Glass card:

```css
background:
  linear-gradient(135deg, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0.46)),
  var(--sg-surface);
backdrop-filter: blur(28px) saturate(1.45) contrast(1.04);
-webkit-backdrop-filter: blur(28px) saturate(1.45) contrast(1.04);
border: 1px solid var(--sg-border-glass);
box-shadow: var(--sg-shadow-soft);
border-radius: var(--sg-radius-card);
```

Use solid white cards only when blur would reduce readability or when the card is a temporary prompt/empty state. If a view mixes solid and glass cards, the solid cards should still use the same radius, border softness, and shadow scale.

## Shadows

```css
--sg-shadow-soft: 0 4px 20px rgba(180, 120, 140, 0.08);
--sg-shadow-raised: 0 8px 28px rgba(180, 120, 140, 0.12);
--sg-shadow-brand: 0 6px 24px rgba(236, 72, 153, 0.14);
--sg-shadow-coral: 0 6px 24px rgba(255, 103, 103, 0.14);
--sg-shadow-warning: 0 6px 24px rgba(250, 173, 20, 0.16);
```

- Use `soft` for normal cards and sticky surfaces.
- Use `raised` only for active sheets, floating controls, or cards being emphasized.
- Use colored shadows sparingly for guide or status cards. Keep opacity below 0.18 by default.

## Spacing

Use a 4px/8px rhythm.

- Page horizontal padding: 16px.
- Compact row gap: 6-8px.
- Card inner padding: 16px.
- Dense settings row vertical padding: 10-12px.
- Section gap: 16px.
- Major view gap: 24px.
- Bottom safe spacing: reserve space for bottom navigation and safe area.

## Interaction

- Tappable rows and cards must have `cursor: pointer`, touch-friendly spacing, and visible active feedback.
- Pressed state should use opacity, background, or slight elevation. Avoid layout-shifting transforms for frequently tapped controls.
- Hover styles are optional enhancement on desktop; mobile active styles are required.
- Disabled states must look disabled and use semantic disabled attributes when available.

## Motion

```css
--sg-motion-fast: 160ms;
--sg-motion-base: 240ms;
--sg-motion-slow: 360ms;
--sg-ease-ios: cubic-bezier(0.16, 1, 0.3, 1);
```

- Loading skeleton pulse may loop.
- Guide arrows may loop only for onboarding or unresolved required actions.
- Normal card entrances should last 240-360ms.
- Micro-interactions should stay between 160-240ms.
- Add `prefers-reduced-motion` support when adding new animations.

## Accessibility

- Normal text contrast should meet 4.5:1 on its surface.
- Secondary text should stay readable, especially on pink and glass backgrounds.
- Do not rely on color alone for state. Pair color with icon, label, or clear copy.
- Icon-only controls need accessible labels.
- Preserve keyboard focus rings for web controls.
- Fixed and sticky UI must not obscure content or bottom navigation.

## Vue And Vant Usage

- Keep new components in Vue 3 `<script setup>`.
- Prefer Vant primitives for buttons, icons, sheets, toasts, and mobile controls.
- Override Vant through semantic CSS variables where possible.
- Avoid hardcoded raw colors in component templates, especially `van-icon color`.
- Keep component APIs stable when doing visual-only work.

## Anti-Patterns

- Adding unrelated purple/blue gradients to configuration views.
- Using `Comic Sans MS` or novelty fonts for app UI.
- Mixing many pinks without semantic meaning.
- Increasing card radius beyond `20px` for standard controls.
- Using strong colored shadows on every card.
- Infinite decorative animations that remain after the user understands the page.
- Building nested cards inside cards for ordinary layout sections.
