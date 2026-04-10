import { Spin } from 'antd';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { ProtectedRoute, GuestRoute } from './guards';

const Login = lazy(() => import('../pages/auth/Login'));
const Dashboard = lazy(() => import('../pages/admin/Dashboard'));
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

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<GuestRoute><Loader><Login /></Loader></GuestRoute>} />
      <Route path="/" element={<Navigate to="/admin" replace />} />
      <Route path="/admin" element={<Protected><Dashboard /></Protected>} />
      <Route path="/admin/users" element={<Protected><UserManagement /></Protected>} />
      <Route path="/admin/settings" element={<Protected><Settings /></Protected>} />
      <Route path="/onboarding/new" element={<Protected><KYCOnboarding /></Protected>} />
      <Route path="/onboarding/list" element={<Protected><OnboardingList /></Protected>} />
      <Route path="/employees" element={<Protected><EmployeeList /></Protected>} />
      <Route path="/employees/:id" element={<Protected><EmployeeProfile /></Protected>} />
      <Route path="/departments" element={<Protected><DepartmentList /></Protected>} />
      <Route path="/designations" element={<Protected><DesignationList /></Protected>} />
      <Route path="/attendance" element={<Protected><AttendanceList /></Protected>} />
      <Route path="/attendance/my" element={<Protected><MyAttendance /></Protected>} />
      <Route path="/leaves" element={<Protected><LeaveList /></Protected>} />
      <Route path="/leaves/apply" element={<Protected><LeaveApply /></Protected>} />
      <Route path="/payroll" element={<Protected><PayrollList /></Protected>} />
      <Route path="/payroll/payslip/:id" element={<Protected><PayslipView /></Protected>} />
      <Route path="/recruitment" element={<Protected><JobPostings /></Protected>} />
      <Route path="/recruitment/applications" element={<Protected><Applications /></Protected>} />
      <Route path="/performance" element={<Protected><PerformanceList /></Protected>} />
      <Route path="/performance/review" element={<Protected><ReviewForm /></Protected>} />
      <Route path="/training" element={<Protected><TrainingList /></Protected>} />
      <Route path="/training/:id" element={<Protected><TrainingDetail /></Protected>} />
      <Route path="/documents" element={<Protected><DocumentList /></Protected>} />
      <Route path="/holidays" element={<Protected><HolidayCalendar /></Protected>} />
      <Route path="/announcements" element={<Protected><AnnouncementList /></Protected>} />
      <Route path="/expenses" element={<Protected><ExpenseList /></Protected>} />
      <Route path="/assets" element={<Protected><AssetList /></Protected>} />
      <Route path="/helpdesk" element={<Protected><TicketList /></Protected>} />
      <Route path="/reports" element={<Protected><Reports /></Protected>} />
      <Route path="*" element={<Loader><NotFound /></Loader>} />
    </Routes>
  );
}
