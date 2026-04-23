# ERP Frontend - HR Management System

## Overview
Modern HR Management System frontend built with React 18, TypeScript, Ant Design, and Tailwind CSS. Multi-tenant, multi-module ERP covering Master data, Employee management, Attendance, Payroll, Recruitment, and more.

## Tech Stack
- **Framework**: React 18.3 + TypeScript 5.8 + Vite 5
- **UI**: Ant Design 6 + Tailwind CSS 3.4 (used together — never one or the other)
- **State**: Redux Toolkit (`authSlice` + `uiSlice`) + React Redux
- **Data Fetching**: TanStack React Query 5
- **Routing**: React Router 6 with lazy loading + code splitting
- **Animations**: Framer Motion (`AnimateIn` wrapper component)
- **Charts**: Recharts
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure
```
src/
  app/              # App entry (providers.tsx), ThemeSync
  config/           # theme.ts (antd theme tokens + palettes), i18n.ts (EN/ES/HI), queryClient.ts
  store/            # authSlice (JWT + user), uiSlice (theme/lang/font/sidebar)
  types/            # TypeScript interfaces + enums.ts (ALL enums, lowercase snake_case)
  services/         # 34+ API service files (fetch-based, auto-auth headers via api.ts)
  hooks/
    queries/        # 20 TanStack Query hook files (one or more per module)
    useTranslation.ts
  layouts/          # AppLayout, Sidebar, Header, navigation.ts (full nav tree with i18n keys)
  components/       # AnimateIn, ComingSoon, EmployeeSearchDialog, master/, employee/
  pages/            # Pages organized by module (see structure below)
  routes/           # index.tsx (all lazy routes + role guards), guards.tsx
  lib/              # utils.ts (cn), formatters.ts (INR, date, time, initials)
```

## Pages Structure
```
pages/
  Index.tsx / NotFound.tsx / InProgress.tsx
  auth/             # Login, AcceptInvitation
  admin/            # Dashboard, DashboardRouter, UserManagement, UserForm, CompanyManagement,
                    # CompanyForm, InviteUserForm, AuditLogs, Settings
  admin-module/     # Dashboard + company/ (List, Edit) + site/ (Add, List, Document)
                    # Remaining routes → InProgress
  onboarding/       # KYCOnboarding, OnboardingList, AdminFillOnboarding
  branches/         # BranchList, BranchForm
  attendance/       # AttendanceList, AttendanceForm, MyAttendance
  payroll/          # PayrollList, PayslipView  [COMING SOON]
  recruitment/      # JobPostings, JobForm, Applications  [COMING SOON]
  reports/          # Reports  [COMING SOON]
  shifts/           # ShiftList, ShiftForm  [COMING SOON]
  master/
    parent-department/  # Add (edit reuses Add), List
    department/         # Add, List, Merge
    designation/        # Add, List, Merge, EmployeeCount
    employee-group/     # Index (combined)
    salary-head/        # Add, List
    salary-structure/   # Index (combined Add+List), AssignHead
    employee/           # Add, List, View, Resignation, BranchShift,
                        # MultipleShiftTransfer, MultipleBranchTransfer,
                        # MultipleUpdate, MultipleReportingUpdate,
                        # MultipleSalaryStructure, MultipleSalaryAppraisal,
                        # FullAndFinal, TemporaryEmployee, DocumentUpdate
    user/               # UserAdd, UserList, UserRights, ResetPassword, DayAuthorization
    tds/                # OtherIncome, Exemption
    other/              # Qualification, Bank, Tag, City, DocumentMaster, ImportantForm,
                        # Level, Grade, Sim, SimList, AttUploadSite, AttAutoNotification,
                        # SmsEmailAlert, ImageGallery, ManageMessages, Shift
```

## Services (`src/services/`)
`api.ts` is the base fetch wrapper (auto-attaches Bearer token, handles 401 logout).
One service file per backend module:
`authService`, `companyService`, `invitationService`, `onboardingService`,
`employeeService`, `departmentService`, `parentDepartmentService`, `designationService`,
`employeeGroupService`, `shiftService`, `branchService`,
`salaryHeadService`, `salaryStructureService`, `qualificationService`, `documentMasterService`,
`tagService`, `levelService`, `gradeService`, `bankService`, `cityService`,
`importantFormService`, `simService`, `otherIncomeService`,
`attUploadSiteService`, `attAutoNotificationService`,
`recruitmentService`, `attendanceService`, `payrollService`, `reportService`,
`dashboardService`, `auditService`, `uploadService`,
`phase2Services` (covers resignations, user-rights, day-authorizations, TDS, SMS/email, image-gallery, manage-messages)

## Query Hooks (`src/hooks/queries/`)
`useAuth`, `useCompanies`, `useInvitations`, `useDashboard`,
`useEmployees`, `useDepartments`, `useParentDepartments`, `useDesignations`,
`useEmployeeGroups`, `useShifts`, `useBranches`,
`useSalaryHeads`, `useSalaryStructures`, `useMasterOther` (qualifications, tags, levels, grades, banks, cities, etc.),
`useAttendance`, `usePayroll`, `useRecruitment`, `useReports`, `useUpload`, `usePhase2`

## Key Patterns

### API Integration
- Services in `src/services/*.ts` call `http://localhost:5000/api/v1/*`
- Query hooks use TanStack Query: `const { data, isLoading } = useXxxList(params)`
- Data access: `data?.data ?? []` (empty array fallback, never mock data)
- Mutations: `const mutation = useCreateXxx(); mutation.mutate(payload, { onSuccess, onError })`

### Auth Flow
- Login → `{ data: { user, tokens: { accessToken, refreshToken } } }`
- Token stored in Redux `authSlice` + `localStorage`
- `api.ts` attaches `Authorization: Bearer <token>` automatically
- 401 → auto logout + redirect to `/login`
- Routes wrapped in `<ProtectedRoute>` and `<RoleGuard roles={[...]}>`

### Role Guards
```ts
const ALL_COMPANY = ['admin', 'hr_manager', 'manager', 'employee', 'viewer'];
const ADMINS = ['admin', 'hr_manager'];
const MANAGEMENT = ['admin', 'hr_manager', 'manager'];
// super_admin passed explicitly where needed
```

### Coming Soon Modules
Modules in `COMING_SOON_MODULES` array (in `routes/index.tsx`) render a `<ComingSoon>` overlay instead of the real page. Currently: `Payroll`, `Reports`, `Shifts`.

### i18n / Language
- 3 languages: English (`en`), Spanish (`es`), Hindi (`hi`)
- Translations in `src/config/i18n.ts`; `useTranslation()` hook reads language from Redux `uiSlice`
- Sidebar navigation uses `titleKey` (i18n keys), not hardcoded strings

### Theming
- Dark/light via Tailwind `dark` class on `<html>`
- Color themes: blue, green, purple, orange, red, teal — applied via antd `ConfigProvider` + CSS vars
- Font: 10 options via CSS `--font-family` var + antd `token.fontFamily`
- `ThemeSync` syncs Redux `uiSlice` → DOM on every render

### Forms
- All create/edit forms use Ant Design `<Drawer>` (slide-in from right), **not Modal**
- `Form.useForm()` + `layout="vertical"`
- Submit button in Drawer `extra` prop (header area)
- Date values converted to ISO strings before sending to API

### Tables
- All status/category columns use antd `filters` + `onFilter`
- Monetary values in INR: `Intl.NumberFormat('en-IN')` via `formatters.ts`

## Commands
```bash
npm run dev      # Start dev server (port 8080)
npm run build    # Production build
npm run lint     # ESLint
npm run test     # Vitest
```

## Backend
Backend at `http://localhost:5000/api/v1/` — 41 modules.
Default admin credentials: `admin@sheeraj.com` / `Admin@123`
