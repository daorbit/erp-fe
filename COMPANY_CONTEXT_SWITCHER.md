# Company Context Switcher — How It Works in the Frontend

## What Problem Does This Solve?

A business group (e.g. "HNH Infotech Group") can have multiple companies:

```
HNH Infotech Pvt. Ltd.   ← Parent company
├── HNH Digital Solutions  ← Sibling company
└── HNH Logistics Ltd.     ← Sibling company
```

A single admin user may need to manage employees, attendance, departments,
and payroll for **all three companies**. Previously this required separate
logins. The Company Context Switcher lets them stay logged in and simply
select which company the app should operate under at any time.

---

## Where to Find the Code

| File | What it does |
|---|---|
| `src/store/activeCompanySlice.ts` | Redux state — stores active company ID + group list |
| `src/components/CompanySwitcher.tsx` | The dropdown UI in the header |
| `src/services/api.ts` | Injects `X-Active-Company` header on every HTTP request |
| `src/services/companyService.ts` | `getGroup()` — fetches parent + siblings from the backend |
| `src/hooks/queries/useCompanies.ts` | `useGroupCompanies()` — used by forms and filter panels |
| `src/layouts/Header.tsx` | Renders `<CompanySwitcher />` in the top-right of the header |

---

## Step-by-Step Flow — What Happens When a User Switches Company

### 1. On Login / App Load
`CompanySwitcher` mounts and calls `GET /api/v1/companies/group`.
The backend returns the full group:
```json
[
  { "_id": "abc", "name": "HNH Infotech", "code": "HNHI", "isCurrent": true },
  { "_id": "def", "name": "HNH Digital",  "code": "HNHD", "isCurrent": false },
  { "_id": "ghi", "name": "HNH Logistics","code": "HNHL", "isCurrent": false }
]
```
These are stored in Redux (`activeCompany.groupCompanies`).

The active company defaults to the user's own company from the JWT.
If the user previously switched company, the last selection is restored
from `localStorage` (`activeCompanyId` key).

**If the user only has ONE company, the switcher is invisible. Nothing changes.**

---

### 2. User Clicks the Dropdown and Selects a Company

```
[HNH Infotech ▼]  ← user clicks this in the header
  ✓ HNH Infotech     ← currently active (checkmark)
    HNH Digital
    HNH Logistics
```

When a selection is made:
1. `dispatch(setActiveCompany("def"))` updates Redux state.
2. `"def"` is saved to `localStorage` (survives page refresh).
3. `queryClient.invalidateQueries()` — **no arguments** — clears ALL
   cached data from TanStack Query across the entire app.
4. Every page that is currently visible re-fetches its data.

---

### 3. Every API Request Carries the Context

`src/services/api.ts` reads `store.getState().activeCompany.activeCompanyId`
on every single fetch and adds:
```
X-Active-Company: def
```
as an HTTP header.

This means **every API call** — employees, departments, attendance,
payroll, salary structures, branches, etc. — automatically goes to the
backend with the active company ID. No page or component needs to know
about this. It is completely transparent.

---

### 4. Backend Validates and Scopes All Data

The backend `authenticate` middleware reads `X-Active-Company`, verifies
the user belongs to the same company group, and sets `req.user.activeCompany`.

Every module controller uses `req.user.activeCompany` for all database
queries (read, create, update, delete). So:

- Departments page → shows only HNH Digital's departments
- Employee list → shows only HNH Digital's employees
- Payroll → runs for HNH Digital only
- Attendance → shows HNH Digital's attendance records

---

### 5. Forms and Filter Panels Auto-Update

The `useGroupCompanies()` hook (used in `EmployeeFilterPanel` and other
forms) reads the group list directly from Redux — the same data the
switcher already loaded. It returns `firstCompanyId` which is always set
to `activeCompanyId`. So any form with a Company dropdown automatically
shows the correct active company selected, and the Company filter in
employee search pages updates instantly.

---

## What Changes vs What Does NOT Change

| What | Changes on switch | Stays the same |
|---|---|---|
| All list pages (employees, depts, etc.) | ✅ Re-fetches for new company | |
| Add/Edit form defaults | ✅ Company pre-filled to active | |
| Company filter dropdowns | ✅ Auto-selects active company | |
| JWT token | | ✅ Never changes |
| User's login credentials | | ✅ Never changes |
| User's home company (`user.company`) | | ✅ Always the original |
| Other browser tabs | | ✅ Not affected until next API call |

---

## For Developers — Rules When Writing New Code

### Always use the active company context in forms and filters

```tsx
// ✅ Correct — auto-syncs with the switcher
import { useGroupCompanies } from '@/hooks/queries/useCompanies';

const { firstCompanyId, companyOptions } = useGroupCompanies();
// firstCompanyId === the currently active company ID
```

### Never hardcode a company select from a raw API call in a form

```tsx
// ❌ Wrong — shows all companies, ignores active context
const { data } = useQuery({ queryFn: () => companyService.getAll() });
```

### When to show the Company select in a form

- For **super_admin**: always editable — they can assign any company.
- For **admin / hr_manager**: read-only, pre-filled from `firstCompanyId`.
  The user should not need to manually pick — the switcher already handles it.

### Adding a new page that shows company-scoped data

Nothing special is needed. Because `api.ts` injects `X-Active-Company`
automatically on every request, your new page's data fetching will
automatically scope to the active company. Just write the query hook
and service call as normal.

---

## Visual Reference — Header with Switcher Active

```
┌────────────────────────────────────────────────────────────────┐
│  ☰  ERP Logo  │  Tuesday, 13 May 2026  │ [HNH Digital ▼] 🔔 👤│
└────────────────────────────────────────────────────────────────┘
                                              │
                                              ▼  (on click)
                                    ┌─────────────────────┐
                                    │   HNH Infotech      │ ← Parent badge
                                    │ ✓ HNH Digital       │ ← active (✓)
                                    │   HNH Logistics     │
                                    └─────────────────────┘
```

The "Parent" tag appears on the parent company so users can visually
distinguish it from sibling companies.

---

## localStorage Keys Used

| Key | Value | Cleared on |
|---|---|---|
| `activeCompanyId` | MongoDB ObjectId string | Logout |
| `token` | JWT access token | Logout |
| `user` | JSON user object | Logout |
| `ui` | Theme / language preferences | Never (user setting) |
