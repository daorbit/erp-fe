import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { ProtectedRoute, GuestRoute, RoleGuard } from './guards';
import ComingSoon from '../components/ComingSoon';

// Add module names here to show "Coming Soon" for them
const COMING_SOON_MODULES: string[] = [
  'Payroll',
  'Recruitment',
  'Reports',
  'Shifts',
  'Performance',
  'Training',
  'Documents',
  'Announcements',
  'Expenses',
  'Assets',
];

const Login = lazy(() => import('../pages/auth/Login'));
const AcceptInvitation = lazy(() => import('../pages/auth/AcceptInvitation'));
const CompanyManagement = lazy(() => import('../pages/admin/CompanyManagement'));
const DashboardRouter = lazy(() => import('../pages/admin/DashboardRouter'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const KYCOnboarding = lazy(() => import('../pages/onboarding/KYCOnboarding'));
const OnboardingList = lazy(() => import('../pages/onboarding/OnboardingList'));
const AdminFillOnboarding = lazy(() => import('../pages/onboarding/AdminFillOnboarding'));
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
const ShiftList = lazy(() => import('../pages/shifts/ShiftList'));
const NotFound = lazy(() => import('../pages/NotFound'));

function PageSkeleton() {
  return (
    <div className="p-6 space-y-6">
      <Skeleton.Input active style={{ width: 200, height: 28 }} />
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton.Node key={i} active style={{ width: '100%', height: 100, borderRadius: 12 }} />
        ))}
      </div>
      <Skeleton active paragraph={{ rows: 8 }} />
    </div>
  );
}

function Protected({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AppLayout>
        <Suspense fallback={<PageSkeleton />}>{children}</Suspense>
      </AppLayout>
    </ProtectedRoute>
  );
}

// Role groups matching navigation.ts
const ALL_COMPANY = ['admin', 'hr_manager', 'manager', 'employee', 'viewer'];
const ADMINS = ['admin', 'hr_manager'];
const MANAGEMENT = ['admin', 'hr_manager', 'manager'];

function R({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  return <Protected><RoleGuard roles={roles}>{children}</RoleGuard></Protected>;
}

function CS({ children, moduleName }: { children: React.ReactNode; moduleName?: string }) {
  const enabled = !!moduleName && COMING_SOON_MODULES.includes(moduleName);
  return <ComingSoon enabled={enabled} moduleName={moduleName}>{children}</ComingSoon>;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Suspense><Login /></Suspense></GuestRoute>} />
      <Route path="/invite/:token" element={<Suspense><AcceptInvitation /></Suspense>} />
      <Route path="/" element={<Navigate to="/admin" replace />} />

      {/* All authenticated */}
      <Route path="/admin" element={<Protected><DashboardRouter /></Protected>} />
      <Route path="/admin/audit-logs" element={<R roles={['super_admin', 'admin']}><AuditLogs /></R>} />
      <Route path="/admin/settings" element={<Protected><Settings /></Protected>} />

      {/* Platform admin only */}
      <Route path="/admin/companies" element={<R roles={['super_admin']}><CompanyManagement /></R>} />

      {/* Admin & HR */}
      <Route path="/admin/users" element={<R roles={['super_admin', ...ADMINS]}><UserManagement /></R>} />
      <Route path="/onboarding/new" element={<Protected><KYCOnboarding /></Protected>} />
      <Route path="/onboarding/list" element={<R roles={ADMINS}><OnboardingList /></R>} />
      <Route path="/onboarding/:userId/fill" element={<R roles={ADMINS}><AdminFillOnboarding /></R>} />
      <Route path="/employees" element={<R roles={ADMINS}><EmployeeList /></R>} />
      <Route path="/employees/:id" element={<R roles={ADMINS}><EmployeeProfile /></R>} />
      <Route path="/departments" element={<R roles={ADMINS}><DepartmentList /></R>} />
      <Route path="/designations" element={<R roles={ADMINS}><DesignationList /></R>} />
      <Route path="/payroll" element={<R roles={ADMINS}><CS moduleName="Payroll"><PayrollList /></CS></R>} />
      <Route path="/payroll/payslip/:id" element={<R roles={ADMINS}><CS moduleName="Payroll"><PayslipView /></CS></R>} />
      <Route path="/recruitment" element={<R roles={ADMINS}><CS moduleName="Recruitment"><JobPostings /></CS></R>} />
      <Route path="/recruitment/applications" element={<R roles={ADMINS}><CS moduleName="Recruitment"><Applications /></CS></R>} />
      <Route path="/reports" element={<R roles={ADMINS}><CS moduleName="Reports"><Reports /></CS></R>} />
      <Route path="/shifts" element={<R roles={ADMINS}><CS moduleName="Shifts"><ShiftList /></CS></R>} />

      {/* Management (admin + HR + manager) */}
      <Route path="/attendance" element={<R roles={MANAGEMENT}><CS moduleName="Attendance"><AttendanceList /></CS></R>} />
      <Route path="/leaves" element={<R roles={MANAGEMENT}><CS moduleName="Leave Management"><LeaveList /></CS></R>} />

      {/* All company roles */}
      <Route path="/attendance/my" element={<R roles={ALL_COMPANY}><CS moduleName="Attendance"><MyAttendance /></CS></R>} />
      <Route path="/leaves/apply" element={<R roles={ALL_COMPANY}><CS moduleName="Leave Management"><LeaveApply /></CS></R>} />
      <Route path="/performance" element={<R roles={ALL_COMPANY}><CS moduleName="Performance"><PerformanceList /></CS></R>} />
      <Route path="/performance/review/:id" element={<R roles={ALL_COMPANY}><CS moduleName="Performance"><ReviewForm /></CS></R>} />
      <Route path="/training" element={<R roles={ALL_COMPANY}><CS moduleName="Training"><TrainingList /></CS></R>} />
      <Route path="/training/:id" element={<R roles={ALL_COMPANY}><CS moduleName="Training"><TrainingDetail /></CS></R>} />
      <Route path="/documents" element={<R roles={ALL_COMPANY}><CS moduleName="Documents"><DocumentList /></CS></R>} />
      <Route path="/holidays" element={<R roles={ALL_COMPANY}><CS moduleName="Holidays"><HolidayCalendar /></CS></R>} />
      <Route path="/announcements" element={<R roles={ALL_COMPANY}><CS moduleName="Announcements"><AnnouncementList /></CS></R>} />
      <Route path="/expenses" element={<R roles={ALL_COMPANY}><CS moduleName="Expenses"><ExpenseList /></CS></R>} />
      <Route path="/assets" element={<R roles={ALL_COMPANY}><CS moduleName="Assets"><AssetList /></CS></R>} />
      <Route path="/helpdesk" element={<R roles={ALL_COMPANY}><CS moduleName="Helpdesk"><TicketList /></CS></R>} />
      <Route path="*" element={<Suspense><NotFound /></Suspense>} />
    </Routes>
  );
}
