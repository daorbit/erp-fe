import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { ProtectedRoute, GuestRoute, RoleGuard } from './guards';

const Login = lazy(() => import('../pages/auth/Login'));
const CompanyManagement = lazy(() => import('../pages/admin/CompanyManagement'));
const DashboardRouter = lazy(() => import('../pages/admin/DashboardRouter'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const KYCOnboarding = lazy(() => import('../pages/onboarding/KYCOnboarding'));
const OnboardingList = lazy(() => import('../pages/onboarding/OnboardingList'));
const EmployeeList = lazy(() => import('../pages/employees/EmployeeList'));
const EmployeeProfile = lazy(() => import('../pages/employees/EmployeeProfile'));
const DepartmentList = lazy(() => import('../pages/departments/DepartmentList'));
const DesignationList = lazy(() => import('../pages/designations/DesignationList'));
const AttendanceList = lazy(() => import('../pages/attendance/AttendanceList'));
const MyAttendance = lazy(() => import('../pages/attendance/MyAttendance'));
const LeaveList = lazy(() => import('../pages/leaves/LeaveList'));
const LeaveApply = lazy(() => import('../pages/leaves/LeaveApply'));
const PayrollList = lazy(() => import('../pages/payroll/PayrollList'));
const PayslipView = lazy(() => import('../pages/payroll/PayslipView'));
const JobPostings = lazy(() => import('../pages/recruitment/JobPostings'));
const Applications = lazy(() => import('../pages/recruitment/Applications'));
const PerformanceList = lazy(() => import('../pages/performance/PerformanceList'));
const ReviewForm = lazy(() => import('../pages/performance/ReviewForm'));
const TrainingList = lazy(() => import('../pages/training/TrainingList'));
const TrainingDetail = lazy(() => import('../pages/training/TrainingDetail'));
const DocumentList = lazy(() => import('../pages/documents/DocumentList'));
const HolidayCalendar = lazy(() => import('../pages/holidays/HolidayCalendar'));
const AnnouncementList = lazy(() => import('../pages/announcements/AnnouncementList'));
const ExpenseList = lazy(() => import('../pages/expenses/ExpenseList'));
const AssetList = lazy(() => import('../pages/assets/AssetList'));
const TicketList = lazy(() => import('../pages/helpdesk/TicketList'));
const Reports = lazy(() => import('../pages/reports/Reports'));
const NotFound = lazy(() => import('../pages/NotFound'));

function Loader({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center" style={{ minHeight: 'calc(100vh - 64px)' }}>
        <Spin size="large" tip="Loading..." />
      </div>
    }>
      {children}
    </Suspense>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Loader>{children}</Loader>
      </AppLayout>
    </ProtectedRoute>
  );
}

// Role groups matching navigation.ts
const ALL_COMPANY = ['admin', 'hr_manager', 'manager', 'employee'];
const ADMINS = ['admin', 'hr_manager'];
const MANAGEMENT = ['admin', 'hr_manager', 'manager'];

function R({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  return <Protected><RoleGuard roles={roles}>{children}</RoleGuard></Protected>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Loader><Login /></Loader></GuestRoute>} />
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* All authenticated */}
      <Route path="/admin" element={<Protected><DashboardRouter /></Protected>} />

      {/* Platform admin only */}
      <Route path="/admin/companies" element={<R roles={['super_admin']}><CompanyManagement /></R>} />

      {/* Admin & HR */}
      <Route path="/admin/users" element={<R roles={['super_admin', ...ADMINS]}><UserManagement /></R>} />
      <Route path="/admin/settings" element={<R roles={ADMINS}><Settings /></R>} />
      <Route path="/onboarding/new" element={<R roles={ADMINS}><KYCOnboarding /></R>} />
      <Route path="/onboarding/list" element={<R roles={ADMINS}><OnboardingList /></R>} />
      <Route path="/employees" element={<R roles={ADMINS}><EmployeeList /></R>} />
      <Route path="/employees/:id" element={<R roles={ADMINS}><EmployeeProfile /></R>} />
      <Route path="/departments" element={<R roles={ADMINS}><DepartmentList /></R>} />
      <Route path="/designations" element={<R roles={ADMINS}><DesignationList /></R>} />
      <Route path="/payroll" element={<R roles={ADMINS}><PayrollList /></R>} />
      <Route path="/payroll/payslip/:id" element={<R roles={ADMINS}><PayslipView /></R>} />
      <Route path="/recruitment" element={<R roles={ADMINS}><JobPostings /></R>} />
      <Route path="/recruitment/applications" element={<R roles={ADMINS}><Applications /></R>} />
      <Route path="/reports" element={<R roles={ADMINS}><Reports /></R>} />

      {/* Management (admin + HR + manager) */}
      <Route path="/attendance" element={<R roles={MANAGEMENT}><AttendanceList /></R>} />
      <Route path="/leaves" element={<R roles={MANAGEMENT}><LeaveList /></R>} />

      {/* All company roles */}
      <Route path="/attendance/my" element={<R roles={ALL_COMPANY}><MyAttendance /></R>} />
      <Route path="/leaves/apply" element={<R roles={ALL_COMPANY}><LeaveApply /></R>} />
      <Route path="/performance" element={<R roles={ALL_COMPANY}><PerformanceList /></R>} />
      <Route path="/performance/review" element={<R roles={ALL_COMPANY}><ReviewForm /></R>} />
      <Route path="/training" element={<R roles={ALL_COMPANY}><TrainingList /></R>} />
      <Route path="/training/:id" element={<R roles={ALL_COMPANY}><TrainingDetail /></R>} />
      <Route path="/documents" element={<R roles={ALL_COMPANY}><DocumentList /></R>} />
      <Route path="/holidays" element={<R roles={ALL_COMPANY}><HolidayCalendar /></R>} />
      <Route path="/announcements" element={<R roles={ALL_COMPANY}><AnnouncementList /></R>} />
      <Route path="/expenses" element={<R roles={ALL_COMPANY}><ExpenseList /></R>} />
      <Route path="/assets" element={<R roles={ALL_COMPANY}><AssetList /></R>} />
      <Route path="/helpdesk" element={<R roles={ALL_COMPANY}><TicketList /></R>} />
      <Route path="*" element={<Loader><NotFound /></Loader>} />
    </Routes>
  );
}
