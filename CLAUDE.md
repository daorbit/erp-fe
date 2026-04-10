# ERP Frontend - HR Management System

## Overview
Modern HR Management System frontend built with React 18, TypeScript, Ant Design, and Tailwind CSS. Supports 18 HR modules with full CRUD, real-time API integration, multi-language support, and theming.

## Tech Stack
- **Framework**: React 18.3 + TypeScript 5.8 + Vite 5
- **UI**: Ant Design 6 + Tailwind CSS 3.4 (used together)
- **State**: Redux Toolkit (@reduxjs/toolkit) + React Redux
- **Data Fetching**: TanStack React Query 5
- **Routing**: React Router 6 with lazy loading
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure
```
src/
  app/              # App entry, providers, ThemeSync
  config/           # theme.ts (antd theme + palettes), i18n.ts (EN/ES/HI), queryClient.ts
  store/            # Redux: authSlice (JWT auth), uiSlice (theme/lang/font/sidebar)
  types/            # TypeScript interfaces + enums.ts (ALL enums, lowercase snake_case)
  services/         # 18 API service files (fetch-based, auto-auth headers)
  hooks/
    queries/        # 18 TanStack Query hook files (one per module)
    useTranslation.ts
  layouts/          # AppLayout, Sidebar, Header, navigation.ts
  components/       # AnimateIn (framer-motion wrapper)
  pages/            # 30 page components organized by module
  routes/           # index.tsx (lazy routes), guards.tsx (auth guards)
  lib/              # utils.ts (cn), formatters.ts (INR, date, time, initials)
```

## Key Patterns

### API Integration
- Services in `src/services/*.ts` wrap fetch calls to `http://localhost:5000/api/v1/*`
- Query hooks in `src/hooks/queries/use*.ts` use TanStack Query
- Pages use: `const { data, isLoading } = useXxxList(params);` then `data?.data ?? []`
- Mutations: `const mutation = useCreateXxx(); mutation.mutate(data, { onSuccess, onError })`

### Auth Flow
- Login → backend returns `{ data: { user, tokens: { accessToken, refreshToken } } }`
- Token stored in Redux `authSlice` + localStorage
- `api.ts` auto-attaches `Authorization: Bearer <token>` to all requests
- 401 responses → auto logout + redirect to `/login`
- Routes wrapped in `<ProtectedRoute>` (redirects to /login if not authenticated)

### i18n / Language
- 3 languages: English (en), Spanish (es), Hindi (hi)
- Translations in `src/config/i18n.ts` with `t(key, lang)` function
- `useTranslation()` hook reads language from Redux store
- Sidebar navigation uses `titleKey` (i18n keys) not hardcoded titles
- Language set in Settings → stored in Redux uiSlice → persisted to localStorage

### Theming
- Dark/light mode via Tailwind `dark` class on `<html>`
- Color themes: blue, green, purple, orange, red, teal (antd ConfigProvider + CSS vars)
- Font family: 10 options, applied via CSS `--font-family` var + antd `token.fontFamily`
- `ThemeSync` component syncs Redux state → DOM (class, CSS vars, body font)

### Enums
- ALL enum values are **lowercase snake_case**: `'active'`, `'in_progress'`, `'full_time'`
- Defined in `src/types/enums.ts` (frontend) and backend models
- Must match between frontend and backend exactly

### Forms
- All create/edit forms use Ant Design `<Drawer>` (slide-in from right), not Modal
- Forms use `Form.useForm()` + `layout="vertical"`
- Submit via Drawer `extra` prop (Save button in header)
- Date values converted to ISO strings before sending to API

## Commands
```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest
```

## Backend API
Backend at `http://localhost:5000/api/v1/` with 151 endpoints across 18 modules.
Default admin: `admin@sheeraj.com` / `Admin@123`

## Important Notes
- Ant Design and Tailwind are used TOGETHER (not one or the other)
- All monetary values in INR, formatted with `Intl.NumberFormat('en-IN')`
- All table columns with status/category use antd `filters` + `onFilter`
- Mock data only as fallback (`data?.data ?? []`) - pages show empty state when DB is empty
- CSS overrides for antd dark mode in `src/index.css`
