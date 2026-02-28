# Agent 3 — Full App Build

## Role
Senior full-stack mobile engineer. Your job is to build the complete, working FinanceFlow mobile app by consuming the outputs from Agent 1 (architecture) and Agent 2 (design system).

## Source of Truth
- Repo: https://github.com/fuadjeem/finance-dashboard
- Live backend: https://finance.jprojects.cc
- Agent 1 output: API contract table, auth strategy, folder structure, tech stack
- Agent 2 output: `/ui-kit/` tokens, components, motion rules

## Master Constraints
- React Native + Expo + TypeScript
- Native quality — no webview wrappers
- Figma-level UI using Agent 2's design system (no inline styles that bypass tokens)
- Reuse existing Next.js + Cloudflare D1 backend; only call the new `/api/mobile/token` endpoint for auth
- Session must persist after app restart (Expo SecureStore)

---

## Skills Assigned

### Skill 1 — App Shell + Auth
Scaffold the full Expo app using the folder structure from Agent 1.

**Navigation:**
- Auth stack: `LoginScreen`, `SignupScreen`
- Main tab navigator: `Dashboard`, `Transactions`, `Settings`
- Nested stacks: `AddTransaction`, `EditTransaction`, `CategoryEdit`
- Redirect logic: unauthenticated → Auth stack, authenticated → Main tabs

**API Client (`/lib/api.ts`):**
- Base URL from env (`EXPO_PUBLIC_API_URL`)
- Attach `Authorization: Bearer <token>` to every request
- 401 interceptor → clear token → redirect to Login
- Typed response wrappers for all endpoints from Agent 1's contract table

**Auth Flow:**
- Login: POST to `/api/mobile/token`, store token in SecureStore
- Signup: POST to existing signup endpoint, then auto-login
- Logout: clear SecureStore, reset navigation to Auth stack
- On app launch: check SecureStore → restore session or show Login

**Definition of done:** sign up, sign in, persist session on restart, log out.

---

### Skill 2 — Dashboard Screen
Connect the static `DashboardMock.tsx` from Agent 2 to real data.

**Features:**
- Summary cards: income, costs, net (from summary endpoint)
- Income vs. costs bar chart — use **Victory Native** (configured to match token colors)
- Recent transactions list (last 5, tappable → Transaction detail)
- Pull-to-refresh
- States: skeleton loading (Agent 2 Skeleton component), empty state, error + retry button
- React Query for data fetching + caching

---

### Skill 3 — Transactions Screen (CRUD + Filters)
**List view:**
- Virtualized `FlatList` with pagination or infinite scroll
- Debounced search (300ms) — filter by description/notes
- Filter chips: date range, category, type (income/cost)
- Sort control: newest / oldest / amount (SegmentedControl from Agent 2)
- Optimistic delete with undo Toast (3s)

**Add / Edit Transaction form:**
- Fields: amount (formatted, numeric keyboard), type (income/cost toggle), category picker (BottomSheet), date picker, notes
- Validation: amount required + numeric, category required, date required
- Submit states: loading button, success toast, error inline message
- Edit mode: pre-populate all fields, show Delete button with confirmation BottomSheet

**Performance:**
- Memoized list items
- Debounced search
- React Query mutation with optimistic update where safe

---

### Skill 4 — Settings Screen (Categories)
**Category management:**
- Separate sections: Income categories / Cost categories (if backend supports type field)
- List of categories with active/inactive status badge
- Add category: inline input or BottomSheet with name field
- Edit: tap row → BottomSheet with rename + deactivate/reactivate toggle
- Delete: only if category has no transactions (match backend 400 behavior with user-friendly error message)

---

### Skill 5 — Export
- Export button in Settings or Transactions screen header
- Call backend CSV export endpoint
- Save/share via `expo-sharing` + `expo-file-system`
- Show progress indicator during download
- Fallback: if endpoint returns JSON, generate CSV on-device and share the generated file
- Error handling: network failure → Toast with retry

---

### Skill 6 — Polish + QA
**Polish:**
- App icon + splash screen config in `app.json`
- Haptics: `expo-haptics` on button press (primary actions), on delete confirmation, on successful form submit
- Accessibility: `accessibilityLabel` on all interactive elements, minimum touch target 44pt, dynamic font scaling support
- Offline: React Query `staleTime` + `cacheTime` config so last successful dashboard + transactions render offline

**QA Checklist (verify each before handoff):**

| Scenario | Expected |
|----------|----------|
| Login with wrong password | Inline error, no crash |
| Token expires mid-session | Auto-logout, redirect to Login |
| Add transaction with empty amount | Validation error shown |
| Delete category in use | User-friendly error from backend |
| No internet on Dashboard load | Cached data shown or empty state |
| Large transaction list (500+ rows) | No jank, virtualized |
| New user with zero data | Empty states on all screens |
| Slow 3G simulation | Skeletons shown, no blank screens |

**Release Notes:**
- Build steps for TestFlight (iOS) and Play Internal Testing (Android)
- Environment config: `EXPO_PUBLIC_API_URL` for dev/stage/prod
- EAS Build config (`eas.json`) with dev/preview/production profiles

---

## Output Requirements
- Complete working Expo app (all screens wired to real backend)
- `/lib/api.ts` — typed API client
- All screens: Login, Signup, Dashboard, Transactions, AddTransaction, EditTransaction, Settings, CategoryEdit
- `app.json` with icon/splash placeholders
- `eas.json` with build profiles
- `.env.example` with required vars
- Inline comments on non-obvious logic

**Definition of done:** clone repo, run `npx expo start`, log in with a real account on https://finance.jprojects.cc, see live data on Dashboard and Transactions.
