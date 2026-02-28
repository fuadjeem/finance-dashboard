# Agent 2 — Design System & UI Kit

## Role
Senior product designer + frontend engineer. Your job is to build a premium, consistent design system for FinanceFlow mobile — the single source of truth for all visual decisions.

## Source of Truth
- Repo: https://github.com/fuadjeem/finance-dashboard
- Live app: https://finance.jprojects.cc (reference for color palette, layout patterns, component behavior)

## Master Constraints
- Figma-level UI: clean, consistent, premium feel
- React Native + Expo + TypeScript
- One component library approach — pick **Tamagui** OR **fully custom** — proceed without switching
- No webview wrappers, no placeholder styles

---

## Skills Assigned

### Skill 1 — Design Tokens
Define all tokens in a single `/ui-kit/tokens.ts` file:

**Colors:**
- Background tiers: `bg.base`, `bg.surface`, `bg.elevated`
- Text tiers: `text.primary`, `text.secondary`, `text.disabled`
- Brand: `brand.primary`, `brand.secondary`
- Semantic: `success`, `warning`, `error`, `info`
- Chart palette: 5 distinct accessible colors

**Typography scale** (use a clean system font stack):
- `h1` — 28px / bold / -0.5 letter spacing
- `h2` — 22px / semibold
- `h3` — 18px / semibold
- `body` — 15px / regular
- `caption` — 12px / regular / secondary color
- `label` — 13px / medium

**Spacing scale:** `xs=4`, `sm=8`, `md=12`, `lg=16`, `xl=24`, `xxl=32`

**Radii:** `sm=6`, `md=12`, `lg=16`, `full=999`

**Shadows** (iOS + Android compatible, subtle not heavy):
- `shadow.sm`, `shadow.md`, `shadow.lg`

### Skill 2 — Core Components
Build each component in `/ui-kit/components/`. Each must accept standard props + a `style` override prop.

| Component | Key Props | Notes |
|-----------|-----------|-------|
| `Button` | `variant: primary/secondary/ghost`, `size: sm/md/lg`, `loading`, `disabled` | Haptic on press |
| `Input` | `label`, `error`, `leftIcon`, `rightIcon`, `secureTextEntry` | Focus ring animation |
| `Card` | `elevated` flag, `padding` override | Uses shadow tokens |
| `ListRow` | `title`, `subtitle`, `leftIcon`, `rightElement`, `onPress` | Ripple/highlight on press |
| `SearchBar` | `value`, `onChangeText`, `onClear` | Debounce handled by consumer |
| `ChipFilter` | `options[]`, `selected`, `onSelect`, `multiSelect` | Scrollable row |
| `SegmentedControl` | `options[]`, `value`, `onChange` | Animated underline |
| `BottomSheet` | `visible`, `onClose`, `snapPoints` | Keyboard-aware |
| `Toast` | `message`, `type: success/error/info`, `duration` | Auto-dismiss |
| `Skeleton` | `width`, `height`, `borderRadius` | Shimmer animation |
| `EmptyState` | `icon`, `title`, `subtitle`, `actionLabel`, `onAction` | |

### Skill 3 — Motion Rules
Define animation constants in `/ui-kit/motion.ts`:
- Screen transition: shared element or slide (pick one, be consistent)
- List item insert: fade + translateY(8px), 200ms ease-out
- List item delete: fade out + height collapse, 150ms
- Button press: scale(0.97), 80ms
- Toast enter: slide up from bottom, 250ms spring
- Skeleton shimmer: 1.2s loop

Use `react-native-reanimated` for all animations.

### Skill 4 — Dashboard Screen Mock
Implement a **static** (no API calls) Dashboard screen at `/screens/DashboardMock.tsx` that showcases the full design system:
- Header with greeting + avatar placeholder
- 3 summary cards (Income, Costs, Net) using `Card` component
- Chart container placeholder (correct sizing + label)
- Recent transactions list (3 static rows) using `ListRow`
- Skeleton state toggle (add a dev button to switch between loaded/loading)

---

## Output Requirements
- `/ui-kit/tokens.ts` — all design tokens
- `/ui-kit/motion.ts` — animation constants
- `/ui-kit/components/` — all components listed above
- `/screens/DashboardMock.tsx` — full static screen demo
- Brief component usage guide (inline comments are fine)

**No API calls in this agent. Design system only.**
