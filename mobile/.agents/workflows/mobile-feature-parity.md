---
description: implement full feature parity between web and mobile app
---

# Mobile Feature Parity Workflow

This workflow replicates all features from the web (Next.js) dashboard into the React Native (Expo) mobile app.

## Step 1: Install charting dependencies

// turbo
```bash
cd /Users/fuadsarkerjeem/.gemini/antigravity/scratch/finance-dashboard/mobile && npx expo install victory-native react-native-svg
```

## Step 2: Add `lib/currency.ts` to mobile

Port the `formatCurrency(cents, currency)` and `getCurrencySymbol(currency)` utility functions from `src/lib/currency.ts` into `mobile/lib/currency.ts`.

## Step 3: Expand `hooks/useApi.ts`

Add the following hooks:
- `useDashboardSummary(month, months)` → GET `/api/transactions/summary?month=&months=`
- `useCategorySpending(month)` → GET `/api/categories/spending?month=`
- `useCategoryDetail(categoryId, month)` → GET `/api/transactions?categoryId=&startDate=&endDate=`
- `useAllTransactions(filterType, search, offset, limit)` → GET `/api/transactions?...`
- `useUserCurrency()` → GET `/api/user/currency`
- `useCategoriesByType(type)` → GET `/api/categories?type=`

## Step 4: Update `app/_layout.tsx`

Register `category/[id]` as a non-tab stack screen (not modal, just pushed onto the stack) so tapping a category tile can navigate to it with a header back button.

## Step 5: Rebuild Dashboard `app/(tabs)/index.tsx`

Replace the entire dashboard with real data:
- Month selector (← label →) at the top.
- Call `useDashboardSummary` for 4-stat summary cards (Total Spent, Total Income, Net Income, Avg Daily Spend).
- Call `useCategorySpending` for category tiles — horizontal ScrollView of tiles, each navigating to `category/[id]?month=`.
- Replace chart placeholder with `VictoryBar` chart (Income vs Costs for last 4 months from summary API).
- FAB (+) button at bottom right to open `AddTransactionModal`.
- Profile avatar navigates to `(tabs)/settings`.

## Step 6: Create `components/AddTransactionModal.tsx`

A bottom-sheet-style modal with:
- Type selector (COST / INCOME chip).
- Category picker (fetched from `/api/categories?type=...`).
- Amount input (in major currency units, multiplied by 100 for API).
- Date picker (native DatePicker or text input YYYY-MM-DD).
- Note input.
- Save button → POST `/api/transactions` (or PUT if editing).
- Calls `onSaved()` callback on success.

## Step 7: Create `app/category/[id].tsx`

Category detail screen:
- Back button.
- Header: category name + total amount.
- Month selector.
- Daily spending `VictoryLine` chart (one data point per day).
- Transaction list in a `FlatList`.
  - Each row: tap to select (checkbox-style highlight).
  - Multi-select actions bar (shown when ≥1 selected): "Move to category" picker + Move button, Exclude button, Include button.
  - Call `PATCH /api/transactions/:id` for recategorize or exclude toggle.

## Step 8: Update `app/(tabs)/transactions.tsx`

Wire up real data:
- Use `useAllTransactions` hook.
- SegmentedControl or chips for filtering (All / Costs / Income).
- SearchBar already exists — debounce and pass to hook.
- FlatList with rows: date, type badge, category, amount, note.
- Swipe-left or long-press to reveal Edit / Delete actions.
- FAB button to add new transaction.
- "Load More" / pull-to-refresh.

## Step 9: Update `app/(tabs)/settings.tsx`

- Currency section at top: shows current currency, tapping opens an ActionSheet/Picker with all currencies. On select, PUT `/api/user/currency`.
- Category management section:
  - SegmentedControl: Cost Categories / Income Categories.
  - List of categories with long-press → Alert for Rename / Delete.
  - Inline "Add" input at bottom of list.

## Step 10: Kill running processes, rebuild and restart

// turbo
```bash
cd /Users/fuadsarkerjeem/.gemini/antigravity/scratch/finance-dashboard/mobile && npm run ios
```
