import { ConfigProvider } from 'antd';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/admin/Settings';
import KYCOnboarding from './pages/onboarding/KYCOnboarding';
import OnboardingList from './pages/onboarding/OnboardingList';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeProfile from './pages/employees/EmployeeProfile';
import DepartmentList from './pages/departments/DepartmentList';
import DesignationList from './pages/designations/DesignationList';
import AttendanceList from './pages/attendance/AttendanceList';
import MyAttendance from './pages/attendance/MyAttendance';
import LeaveList from './pages/leaves/LeaveList';
import LeaveApply from './pages/leaves/LeaveApply';
import PayrollList from './pages/payroll/PayrollList';
import PayslipView from './pages/payroll/PayslipView';
import JobPostings from './pages/recruitment/JobPostings';
import Applications from './pages/recruitment/Applications';
import PerformanceList from './pages/performance/PerformanceList';
import ReviewForm from './pages/performance/ReviewForm';
import TrainingList from './pages/training/TrainingList';
import TrainingDetail from './pages/training/TrainingDetail';
import DocumentList from './pages/documents/DocumentList';
import HolidayCalendar from './pages/holidays/HolidayCalendar';
import AnnouncementList from './pages/announcements/AnnouncementList';
import ExpenseList from './pages/expenses/ExpenseList';
import AssetList from './pages/assets/AssetList';
import TicketList from './pages/helpdesk/TicketList';
import Reports from './pages/reports/Reports';

const ThemedApp = () => {
  const { getAntdTheme } = useTheme();
  return (
    <ConfigProvider theme={getAntdTheme()}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/onboarding/new" element={<KYCOnboarding />} />
            <Route path="/onboarding/list" element={<OnboardingList />} />
            <Route path="/employees" element={<EmployeeList />} />
            <Route path="/employees/:id" element={<EmployeeProfile />} />
            <Route path="/departments" element={<DepartmentList />} />
            <Route path="/designations" element={<DesignationList />} />
            <Route path="/attendance" element={<AttendanceList />} />
            <Route path="/attendance/my" element={<MyAttendance />} />
            <Route path="/leaves" element={<LeaveList />} />
            <Route path="/leaves/apply" element={<LeaveApply />} />
            <Route path="/payroll" element={<PayrollList />} />
            <Route path="/payroll/payslip/:id" element={<PayslipView />} />
            <Route path="/recruitment" element={<JobPostings />} />
            <Route path="/recruitment/applications" element={<Applications />} />
            <Route path="/performance" element={<PerformanceList />} />
            <Route path="/performance/review" element={<ReviewForm />} />
            <Route path="/training" element={<TrainingList />} />
            <Route path="/training/:id" element={<TrainingDetail />} />
            <Route path="/documents" element={<DocumentList />} />
            <Route path="/holidays" element={<HolidayCalendar />} />
            <Route path="/announcements" element={<AnnouncementList />} />
            <Route path="/expenses" element={<ExpenseList />} />
            <Route path="/assets" element={<AssetList />} />
            <Route path="/helpdesk" element={<TicketList />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <ThemedApp />
  </ThemeProvider>
);

export default App;
