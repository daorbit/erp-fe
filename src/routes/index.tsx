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

const COMPANY_ROLES = ['admin', 'hr_manager', 'manager', 'employee'];

function CompanyRoute({ children }: { children: React.ReactNode }) {
  return (
    <Protected>
      <RoleGuard roles={COMPANY_ROLES}>{children}</RoleGuard>
    </Protected>
  );
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Loader><Login /></Loader></GuestRoute>} />
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* Shared routes (all roles) */}
      <Route path="/admin" element={<Protected><DashboardRouter /></Protected>} />
      <Route path="/admin/users" element={<Protected><UserManagement /></Protected>} />

      {/* Platform admin only */}
      <Route path="/admin/companies" element={<Protected><RoleGuard roles={['super_admin']}><CompanyManagement /></RoleGuard></Protected>} />

      {/* Company-scoped routes (company roles only) */}
      <Route path="/admin/settings" element={<CompanyRoute><Settings /></CompanyRoute>} />
      <Route path="/onboarding/new" element={<CompanyRoute><KYCOnboarding /></CompanyRoute>} />
      <Route path="/onboarding/list" element={<CompanyRoute><OnboardingList /></CompanyRoute>} />
      <Route path="/employees" element={<CompanyRoute><EmployeeList /></CompanyRoute>} />
      <Route path="/employees/:id" element={<CompanyRoute><EmployeeProfile /></CompanyRoute>} />
      <Route path="/departments" element={<CompanyRoute><DepartmentList /></CompanyRoute>} />
      <Route path="/designations" element={<CompanyRoute><DesignationList /></CompanyRoute>} />
      <Route path="/attendance" element={<CompanyRoute><AttendanceList /></CompanyRoute>} />
      <Route path="/attendance/my" element={<CompanyRoute><MyAttendance /></CompanyRoute>} />
      <Route path="/leaves" element={<CompanyRoute><LeaveList /></CompanyRoute>} />
      <Route path="/leaves/apply" element={<CompanyRoute><LeaveApply /></CompanyRoute>} />
      <Route path="/payroll" element={<CompanyRoute><PayrollList /></CompanyRoute>} />
      <Route path="/payroll/payslip/:id" element={<CompanyRoute><PayslipView /></CompanyRoute>} />
      <Route path="/recruitment" element={<CompanyRoute><JobPostings /></CompanyRoute>} />
      <Route path="/recruitment/applications" element={<CompanyRoute><Applications /></CompanyRoute>} />
      <Route path="/performance" element={<CompanyRoute><PerformanceList /></CompanyRoute>} />
      <Route path="/performance/review" element={<CompanyRoute><ReviewForm /></CompanyRoute>} />
      <Route path="/training" element={<CompanyRoute><TrainingList /></CompanyRoute>} />
      <Route path="/training/:id" element={<CompanyRoute><TrainingDetail /></CompanyRoute>} />
      <Route path="/documents" element={<CompanyRoute><DocumentList /></CompanyRoute>} />
      <Route path="/holidays" element={<CompanyRoute><HolidayCalendar /></CompanyRoute>} />
      <Route path="/announcements" element={<CompanyRoute><AnnouncementList /></CompanyRoute>} />
      <Route path="/expenses" element={<CompanyRoute><ExpenseList /></CompanyRoute>} />
      <Route path="/assets" element={<CompanyRoute><AssetList /></CompanyRoute>} />
      <Route path="/helpdesk" element={<CompanyRoute><TicketList /></CompanyRoute>} />
      <Route path="/reports" element={<CompanyRoute><Reports /></CompanyRoute>} />
      <Route path="*" element={<Loader><NotFound /></Loader>} />
    </Routes>
  );
}
