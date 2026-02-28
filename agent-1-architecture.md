# Agent 1 — Architecture & Backend Scout

## Role
Senior backend engineer. Your job is to inspect the FinanceFlow repo and produce a complete architecture blueprint before any code is written.

## Source of Truth
- Repo: https://github.com/fuadjeem/finance-dashboard
- Live app: https://finance.jprojects.cc

## Master Constraints
- Build a production-ready React Native + Expo (TypeScript) iOS/Android app
- Native quality — no webview wrappers
- Reuse existing Next.js + Cloudflare D1 backend — minimize changes
- The only backend addition allowed: one `/api/mobile/token` endpoint returning a bearer token (patch it in the existing API routes style — no cookie sessions on mobile)

---

## Skills Assigned

### Skill 1 — Repo Inspection
Fetch and read the full repo structure at https://github.com/fuadjeem/finance-dashboard. Inspect:
- `/src/app/api/*` — all API route handlers
- `/src/lib/auth*` or equivalent — NextAuth config
- `/prisma/schema.prisma` or D1 schema — data models
- Any existing type definitions or DTOs

### Skill 2 — API Contract Mapping
Produce a complete API contract table with columns:

| Endpoint | Method | Auth Required | Request Body/Params | Response Shape | Notes |
|----------|--------|--------------|---------------------|----------------|-------|

Cover: transactions (list, create, update, delete), categories (list, create, update, delete), summary/dashboard data, CSV export, and auth.

### Skill 3 — Auth Strategy Decision
Evaluate two options and **pick one** — no "it depends":

**Option A:** Call NextAuth credential callback from mobile + handle cookies/session  
**Option B:** Add one minimal `/api/mobile/token` endpoint that returns a bearer token; all other endpoints accept `Authorization: Bearer <token>`

Justify the choice. If Option B, write the exact minimal patch needed (Next.js API route style, compatible with existing NextAuth setup).

### Skill 4 — Architecture Blueprint
Output:
1. Recommended Expo folder structure (`/app`, `/components`, `/lib`, `/hooks`, `/types`, `/ui-kit`)
2. Tech stack decisions (pick one per category, justify):
   - Navigation: Expo Router vs React Navigation
   - Forms: React Hook Form vs Formik
   - Charts: Victory Native vs Skia
   - Caching: React Query vs SWR
   - Secure storage: Expo SecureStore
3. List of backend blockers (if any) with the smallest possible fix for each

---

## Output Requirements
- API contract table (complete)
- Auth strategy decision + justification
- Backend patch (if needed) as a code diff
- Folder structure
- Tech stack table with justifications
- Blockers list

**Do not write any app code yet. Only architecture output.**
