# HomeView Style Rules

HomeView is the reference implementation for the project's soft mobile configuration style. Future views should reuse the shared direction in `design-system/MASTER.md`, while this file records HomeView-specific constraints and improvement targets.

## Current Visual Identity

- Page type: primary mobile configuration dashboard.
- Style: iOS 26 Liquid Glass with warm pink background.
- Mood: friendly, calm, lightweight, assistant-like.
- Density: medium. The page should support repeated configuration work without feeling busy.
- Main components: sticky user status card, onboarding/guide cards, swipe-based configuration modules, non-VIP prompt, bottom navigation, skeleton loading state.

## Preserve

- The soft pink page background.
- The sticky top status area with Liquid Glass treatment.
- The Vant icon language.
- The Apple settings-inspired configuration card language from `apple-card.css`.
- The guide-card pattern for unresolved setup steps.
- Skeleton loading instead of blank loading states.

## Unify

### 1. Pink Semantics

HomeView currently uses several pink/coral values. Treat them as semantic roles:

- `--sg-brand` `#ec4899`: primary brand, selected/focus/important action.
- `--sg-brand-soft` `#f472b6`: first-login or gentle welcome guidance.
- `--sg-coral` `#ff6767`: account binding and required setup attention.
- `--sg-warning` `#faad14`: VIP, membership, time allocation, trial reward.

Do not use `--sg-coral` as the general brand color in HomeView. It should read as warmer attention, not the whole brand.

### 2. Card Materials

Use three card materials only:

- Sticky Liquid Glass: top user status wrapper and persistent page chrome.
- Standard Liquid Glass: normal configuration panels and Apple-style surfaces.
- Solid prompt card: onboarding, non-VIP, skeleton, and temporary guidance.

Solid prompt cards must still use the shared radius and shadow scale so they belong to the same interface.

### 3. Guide Cards

All guide cards should share:

- Width: full available width with a comfortable max width.
- Radius: `--sg-radius-card`.
- Padding: 16px.
- Icon tile: 52px circle or rounded tile, consistent per state.
- Title: 15px, 600.
- Description: 12-13px, line-height 1.5.
- Shadow: one shared base formula plus a state-color tint.
- Border: same thickness and style for all guide variants.

Guide card variants:

- Login guide: soft brand pink.
- Account binding guide: coral attention.
- VIP/trial guide: warning gold.

### 4. Sticky Top Card

The sticky top card should be treated as page chrome:

- Use the shared Liquid Glass surface.
- Keep blur around 24-30px.
- Use `z-index` from a small scale, preferably `10` for sticky top and higher only for sheets/modals.
- Radius should be `0 0 var(--sg-radius-card) var(--sg-radius-card)`.
- Shadow should be soft with a subtle inset highlight, not a heavy floating card shadow.

### 5. Skeleton Loading

Skeleton should visually match the loaded interface:

- Top skeleton card should mimic the sticky/user card radius and shadow.
- Skeleton block color should use a muted pink-gray surface rather than unrelated gray.
- Pulse is allowed because it communicates loading.
- Keep skeleton spacing aligned with loaded content spacing to reduce perceived layout shift.

### 6. Non-VIP Prompt

The non-VIP card belongs to the warning/VIP semantic family, but should feel helpful rather than alarming.

- Use `--sg-warning` for icon and accent.
- Use pale warm background only as a state surface.
- Keep border low-contrast.
- Use one clear action. Secondary explanatory text should be muted.

### 7. Motion

Allowed HomeView motion:

- Skeleton pulse while loading.
- Guide entrance fade/translate once.
- Short guide arrow bounce only while the required action is unresolved.
- Highlight pulse after programmatic scroll.
- Press feedback on tappable cards.

Avoid adding new continuous decorative motion to the normal configured state.

### 8. Typography

HomeView should use the shared system font stack. Do not inherit novelty fonts from global styles.

Recommended HomeView text roles:

- Guide title: 15px, 600.
- Guide description: 12px or 13px, 1.5 line-height.
- Prompt title: 15px, 600.
- Prompt description: 12px, 1.5 line-height.
- Configuration content: follow `apple-card.css` row and title styles.

## Suggested Token Layer For HomeView

When refactoring HomeView styles, define local aliases that point to shared tokens. This keeps the file readable and prevents raw color sprawl.

```css
.page-container {
  --home-guide-login: var(--sg-brand-soft);
  --home-guide-account: var(--sg-coral);
  --home-guide-vip: var(--sg-warning);
  --home-guide-text: var(--sg-text-muted);
}
```

## Review Checklist Before Editing HomeView

- Are all new colors mapped to `MASTER.md` tokens?
- Are card radius values using `--sg-radius-*`?
- Are shadows using `--sg-shadow-*`?
- Does each guide state use the correct semantic color?
- Do touch targets remain at least 44px?
- Does the page still reserve space for bottom navigation?
- Are any infinite animations limited to loading or unresolved guidance?
- Does the page still look coherent at 375px width?

## Reuse Guidance For Other Views

Other views should reuse HomeView's visual language but adjust density by task:

- LoginView: use softer brand surfaces and fewer cards; primary action should use `--sg-brand`.
- ManageView: use denser settings rows, standard glass cards, and reduced decorative motion.
- FeedbackView: use form clarity first; keep labels visible and errors near fields.
- LogView: prioritize scanability and data readability; use muted surfaces and avoid heavy pink accents.
- ProfileView: reuse the sticky/glass account surface and clear grouped sections.

HomeView is the warmest and most guided page. Operational views should be slightly quieter while keeping the same tokens, radius, typography, and glass material.
