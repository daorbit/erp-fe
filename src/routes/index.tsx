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
const DepartmentForm = lazy(() => import('../pages/departments/DepartmentForm'));
const ParentDepartmentList = lazy(() => import('../pages/parent-departments/ParentDepartmentList'));
const ParentDepartmentForm = lazy(() => import('../pages/parent-departments/ParentDepartmentForm'));
const DesignationList = lazy(() => import('../pages/designations/DesignationList'));
const DesignationForm = lazy(() => import('../pages/designations/DesignationForm'));
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
const ShiftForm = lazy(() => import('../pages/shifts/ShiftForm'));
const BranchList = lazy(() => import('../pages/branches/BranchList'));
const BranchForm = lazy(() => import('../pages/branches/BranchForm'));
const NotFound = lazy(() => import('../pages/NotFound'));
const EmployeeForm = lazy(() => import('../pages/employees/EmployeeForm'));
const InviteUserForm = lazy(() => import('../pages/employees/InviteUserForm'));
const AnnouncementForm = lazy(() => import('../pages/announcements/AnnouncementForm'));
const AssetForm = lazy(() => import('../pages/assets/AssetForm'));
const AttendanceForm = lazy(() => import('../pages/attendance/AttendanceForm'));
const DocumentForm = lazy(() => import('../pages/documents/DocumentForm'));
const ExpenseForm = lazy(() => import('../pages/expenses/ExpenseForm'));
const TicketForm = lazy(() => import('../pages/helpdesk/TicketForm'));
const HolidayForm = lazy(() => import('../pages/holidays/HolidayForm'));
const LeaveTypeForm = lazy(() => import('../pages/leaves/LeaveTypeForm'));
const TrainingForm = lazy(() => import('../pages/training/TrainingForm'));
const TrainingEnrollForm = lazy(() => import('../pages/training/TrainingEnrollForm'));
const JobForm = lazy(() => import('../pages/recruitment/JobForm'));
const CompanyForm = lazy(() => import('../pages/admin/CompanyForm'));
const UserForm = lazy(() => import('../pages/admin/UserForm'));
const AdminInviteUserForm = lazy(() => import('../pages/admin/InviteUserForm'));

// Master (NwayERP-style)
const MasterParentDepartmentAdd = lazy(() => import('../pages/master/parent-department/Add'));
const MasterParentDepartmentList = lazy(() => import('../pages/master/parent-department/List'));
const MasterDepartmentAdd = lazy(() => import('../pages/master/department/Add'));
const MasterDepartmentList = lazy(() => import('../pages/master/department/List'));
const MasterDepartmentMerge = lazy(() => import('../pages/master/department/Merge'));
const MasterDesignationAdd = lazy(() => import('../pages/master/designation/Add'));
const MasterDesignationList = lazy(() => import('../pages/master/designation/List'));
const MasterDesignationMerge = lazy(() => import('../pages/master/designation/Merge'));
const MasterDesignationEmployeeCount = lazy(() => import('../pages/master/designation/EmployeeCount'));
const MasterEmployeeGroup = lazy(() => import('../pages/master/employee-group/Index'));
const MasterSalaryHeadAdd = lazy(() => import('../pages/master/salary-head/Add'));
const MasterSalaryHeadList = lazy(() => import('../pages/master/salary-head/List'));
const MasterSalaryStructure = lazy(() => import('../pages/master/salary-structure/Index'));
const MasterSalaryStructureAssignHead = lazy(() => import('../pages/master/salary-structure/AssignHead'));

// Master → Other (13 simple masters)
const MasterQualification = lazy(() => import('../pages/master/other/Qualification'));
const MasterDocumentMaster = lazy(() => import('../pages/master/other/DocumentMaster'));
const MasterTag = lazy(() => import('../pages/master/other/Tag'));
const MasterLevel = lazy(() => import('../pages/master/other/Level'));
const MasterGrade = lazy(() => import('../pages/master/other/Grade'));
const MasterBank = lazy(() => import('../pages/master/other/Bank'));
const MasterCity = lazy(() => import('../pages/master/other/City'));
const MasterImportantForm = lazy(() => import('../pages/master/other/ImportantForm'));
const MasterSimAdd = lazy(() => import('../pages/master/other/Sim'));
const MasterSimList = lazy(() => import('../pages/master/other/SimList'));
const MasterAttUploadSite = lazy(() => import('../pages/master/other/AttUploadSite'));
const MasterAttAutoNotification = lazy(() => import('../pages/master/other/AttAutoNotification'));
const MasterLeaveFinyear = lazy(() => import('../pages/master/leave/Finyear'));
const MasterOtherIncome = lazy(() => import('../pages/master/tds/OtherIncome'));

// Phase 2: Employee + Resignation + User + Leave + TDS + Other
const MasterEmployeeAdd = lazy(() => import('../pages/master/employee/Add'));
const MasterEmployeeList = lazy(() => import('../pages/master/employee/List'));
const MasterEmployeeResignation = lazy(() => import('../pages/master/employee/Resignation'));
const MasterUserAdd = lazy(() => import('../pages/master/user/UserAdd'));
const MasterUserList = lazy(() => import('../pages/master/user/UserList'));
const MasterUserRights = lazy(() => import('../pages/master/user/UserRights'));
const MasterUserResetPassword = lazy(() => import('../pages/master/user/ResetPassword'));
const MasterUserDayAuth = lazy(() => import('../pages/master/user/DayAuthorization'));
const MasterLeaveType = lazy(() => import('../pages/master/leave/LeaveType'));
const MasterEmpLeaveOpening = lazy(() => import('../pages/master/leave/EmpLeaveOpening'));
const MasterClosingLeaveTransfer = lazy(() => import('../pages/master/leave/ClosingLeaveTransfer'));
const MasterHoliday = lazy(() => import('../pages/master/leave/Holiday'));
const MasterOptionalHoliday = lazy(() => import('../pages/master/leave/OptionalHoliday'));
const MasterTdsExemption = lazy(() => import('../pages/master/tds/Exemption'));
const MasterSmsEmailAlert = lazy(() => import('../pages/master/other/SmsEmailAlert'));
const MasterImageGallery = lazy(() => import('../pages/master/other/ImageGallery'));
const MasterManageMessages = lazy(() => import('../pages/master/other/ManageMessages'));

// Phase 3: Employee auxiliary ops + Shift master
const MasterEmployeeBranchShift = lazy(() => import('../pages/master/employee/BranchShift'));
const MasterEmployeeMultipleShiftTransfer = lazy(() => import('../pages/master/employee/MultipleShiftTransfer'));
const MasterEmployeeMultipleBranchTransfer = lazy(() => import('../pages/master/employee/MultipleBranchTransfer'));
const MasterEmployeeMultipleUpdate = lazy(() => import('../pages/master/employee/MultipleUpdate'));
const MasterEmployeeMultipleReportingUpdate = lazy(() => import('../pages/master/employee/MultipleReportingUpdate'));
const MasterEmployeeMultipleSalaryStructure = lazy(() => import('../pages/master/employee/MultipleSalaryStructure'));
const MasterEmployeeMultipleSalaryAppraisal = lazy(() => import('../pages/master/employee/MultipleSalaryAppraisal'));
const MasterEmployeeFullAndFinal = lazy(() => import('../pages/master/employee/FullAndFinal'));
const MasterEmployeeTemporary = lazy(() => import('../pages/master/employee/TemporaryEmployee'));
const MasterEmployeeDocumentUpdate = lazy(() => import('../pages/master/employee/DocumentUpdate'));
const MasterShift = lazy(() => import('../pages/master/other/Shift'));

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
      <Route path="/admin/companies/create" element={<R roles={['super_admin']}><CompanyForm /></R>} />
      <Route path="/admin/companies/:id/edit" element={<R roles={['super_admin']}><CompanyForm /></R>} />

      {/* Admin & HR */}
      <Route path="/admin/users" element={<R roles={['super_admin', ...ADMINS]}><UserManagement /></R>} />
      <Route path="/admin/users/create" element={<R roles={['super_admin', ...ADMINS]}><UserForm /></R>} />
      <Route path="/admin/users/invite" element={<R roles={['super_admin', ...ADMINS]}><AdminInviteUserForm /></R>} />
      <Route path="/onboarding/new" element={<Protected><KYCOnboarding /></Protected>} />
      <Route path="/onboarding/list" element={<R roles={ADMINS}><OnboardingList /></R>} />
      <Route path="/onboarding/:userId/fill" element={<R roles={ADMINS}><AdminFillOnboarding /></R>} />
      <Route path="/employees" element={<R roles={ADMINS}><EmployeeList /></R>} />
      <Route path="/employees/create" element={<R roles={ADMINS}><EmployeeForm /></R>} />
      <Route path="/employees/invite" element={<R roles={ADMINS}><InviteUserForm /></R>} />
      <Route path="/employees/:id" element={<R roles={ADMINS}><EmployeeProfile /></R>} />
      <Route path="/departments" element={<R roles={ADMINS}><DepartmentList /></R>} />
      <Route path="/departments/create" element={<R roles={ADMINS}><DepartmentForm /></R>} />
      <Route path="/departments/:id/edit" element={<R roles={ADMINS}><DepartmentForm /></R>} />
      <Route path="/branches" element={<R roles={ADMINS}><BranchList /></R>} />
      <Route path="/branches/create" element={<R roles={ADMINS}><BranchForm /></R>} />
      <Route path="/branches/:id/edit" element={<R roles={ADMINS}><BranchForm /></R>} />
      <Route path="/parent-departments" element={<R roles={ADMINS}><ParentDepartmentList /></R>} />
      <Route path="/parent-departments/create" element={<R roles={ADMINS}><ParentDepartmentForm /></R>} />
      <Route path="/parent-departments/:id/edit" element={<R roles={ADMINS}><ParentDepartmentForm /></R>} />
      <Route path="/designations" element={<R roles={ADMINS}><DesignationList /></R>} />
      <Route path="/designations/create" element={<R roles={ADMINS}><DesignationForm /></R>} />
      <Route path="/designations/:id/edit" element={<R roles={ADMINS}><DesignationForm /></R>} />
      <Route path="/payroll" element={<R roles={ADMINS}><CS moduleName="Payroll"><PayrollList /></CS></R>} />
      <Route path="/payroll/payslip/:id" element={<R roles={ADMINS}><CS moduleName="Payroll"><PayslipView /></CS></R>} />
      <Route path="/recruitment" element={<R roles={ADMINS}><CS moduleName="Recruitment"><JobPostings /></CS></R>} />
      <Route path="/recruitment/create" element={<R roles={ADMINS}><CS moduleName="Recruitment"><JobForm /></CS></R>} />
      <Route path="/recruitment/:id/edit" element={<R roles={ADMINS}><CS moduleName="Recruitment"><JobForm /></CS></R>} />
      <Route path="/recruitment/applications" element={<R roles={ADMINS}><CS moduleName="Recruitment"><Applications /></CS></R>} />
      <Route path="/reports" element={<R roles={ADMINS}><CS moduleName="Reports"><Reports /></CS></R>} />
      <Route path="/shifts" element={<R roles={ADMINS}><CS moduleName="Shifts"><ShiftList /></CS></R>} />
      <Route path="/shifts/create" element={<R roles={ADMINS}><CS moduleName="Shifts"><ShiftForm /></CS></R>} />
      <Route path="/shifts/:id/edit" element={<R roles={ADMINS}><CS moduleName="Shifts"><ShiftForm /></CS></R>} />

      {/* Management (admin + HR + manager) */}
      <Route path="/attendance" element={<R roles={MANAGEMENT}><CS moduleName="Attendance"><AttendanceList /></CS></R>} />
      <Route path="/attendance/mark" element={<R roles={MANAGEMENT}><CS moduleName="Attendance"><AttendanceForm /></CS></R>} />
      <Route path="/leaves" element={<R roles={MANAGEMENT}><CS moduleName="Leave Management"><LeaveList /></CS></R>} />
      <Route path="/leaves/types/create" element={<R roles={MANAGEMENT}><CS moduleName="Leave Management"><LeaveTypeForm /></CS></R>} />

      {/* All company roles */}
      <Route path="/attendance/my" element={<R roles={ALL_COMPANY}><CS moduleName="Attendance"><MyAttendance /></CS></R>} />
      <Route path="/leaves/apply" element={<R roles={ALL_COMPANY}><CS moduleName="Leave Management"><LeaveApply /></CS></R>} />
      <Route path="/performance" element={<R roles={ALL_COMPANY}><CS moduleName="Performance"><PerformanceList /></CS></R>} />
      <Route path="/performance/review/:id" element={<R roles={ALL_COMPANY}><CS moduleName="Performance"><ReviewForm /></CS></R>} />
      <Route path="/training" element={<R roles={ALL_COMPANY}><CS moduleName="Training"><TrainingList /></CS></R>} />
      <Route path="/training/create" element={<R roles={ALL_COMPANY}><CS moduleName="Training"><TrainingForm /></CS></R>} />
      <Route path="/training/:id" element={<R roles={ALL_COMPANY}><CS moduleName="Training"><TrainingDetail /></CS></R>} />
      <Route path="/training/:id/enroll" element={<R roles={ALL_COMPANY}><CS moduleName="Training"><TrainingEnrollForm /></CS></R>} />
      <Route path="/documents" element={<R roles={ALL_COMPANY}><CS moduleName="Documents"><DocumentList /></CS></R>} />
      <Route path="/documents/upload" element={<R roles={ALL_COMPANY}><CS moduleName="Documents"><DocumentForm /></CS></R>} />
      <Route path="/holidays" element={<R roles={ALL_COMPANY}><CS moduleName="Holidays"><HolidayCalendar /></CS></R>} />
      <Route path="/holidays/create" element={<R roles={ALL_COMPANY}><CS moduleName="Holidays"><HolidayForm /></CS></R>} />
      <Route path="/announcements" element={<R roles={ALL_COMPANY}><CS moduleName="Announcements"><AnnouncementList /></CS></R>} />
      <Route path="/announcements/create" element={<R roles={ALL_COMPANY}><CS moduleName="Announcements"><AnnouncementForm /></CS></R>} />
      <Route path="/expenses" element={<R roles={['admin', 'hr_manager', 'manager', 'viewer']}><CS moduleName="Expenses"><ExpenseList /></CS></R>} />
      <Route path="/expenses/create" element={<R roles={['admin', 'hr_manager', 'manager', 'viewer']}><CS moduleName="Expenses"><ExpenseForm /></CS></R>} />
      <Route path="/assets" element={<R roles={ALL_COMPANY}><CS moduleName="Assets"><AssetList /></CS></R>} />
      <Route path="/assets/create" element={<R roles={ALL_COMPANY}><CS moduleName="Assets"><AssetForm /></CS></R>} />
      <Route path="/helpdesk" element={<R roles={ALL_COMPANY}><CS moduleName="Helpdesk"><TicketList /></CS></R>} />
      <Route path="/helpdesk/create" element={<R roles={ALL_COMPANY}><CS moduleName="Helpdesk"><TicketForm /></CS></R>} />

      {/* ══════════════════════════════════════════════════════════════════════
          Master — Parent Department (live)
         ══════════════════════════════════════════════════════════════════════ */}
      <Route path="/master/parent-department/add" element={<R roles={ADMINS}><MasterParentDepartmentAdd /></R>} />
      <Route path="/master/parent-department/edit/:id" element={<R roles={ADMINS}><MasterParentDepartmentAdd /></R>} />
      <Route path="/master/parent-department/list" element={<R roles={ADMINS}><MasterParentDepartmentList /></R>} />

      {/* Master — Department (live) */}
      <Route path="/master/department/add" element={<R roles={ADMINS}><MasterDepartmentAdd /></R>} />
      <Route path="/master/department/edit/:id" element={<R roles={ADMINS}><MasterDepartmentAdd /></R>} />
      <Route path="/master/department/list" element={<R roles={ADMINS}><MasterDepartmentList /></R>} />
      <Route path="/master/department/merge" element={<R roles={ADMINS}><MasterDepartmentMerge /></R>} />

      {/* Master — Designation (live) */}
      <Route path="/master/designation/add" element={<R roles={ADMINS}><MasterDesignationAdd /></R>} />
      <Route path="/master/designation/edit/:id" element={<R roles={ADMINS}><MasterDesignationAdd /></R>} />
      <Route path="/master/designation/list" element={<R roles={ADMINS}><MasterDesignationList /></R>} />
      <Route path="/master/designation/merge" element={<R roles={ADMINS}><MasterDesignationMerge /></R>} />
      <Route path="/master/designation/employee-count" element={<R roles={ADMINS}><MasterDesignationEmployeeCount /></R>} />

      {/* Master — Employee Group (combined page) */}
      <Route path="/master/employee-group" element={<R roles={ADMINS}><MasterEmployeeGroup /></R>} />

      {/* Master — Salary Head */}
      <Route path="/master/salary-head/add" element={<R roles={ADMINS}><MasterSalaryHeadAdd /></R>} />
      <Route path="/master/salary-head/edit/:id" element={<R roles={ADMINS}><MasterSalaryHeadAdd /></R>} />
      <Route path="/master/salary-head/list" element={<R roles={ADMINS}><MasterSalaryHeadList /></R>} />

      {/* Master — Salary Structure (combined Add+List + Assign Head) */}
      <Route path="/master/salary-structure/list" element={<R roles={ADMINS}><MasterSalaryStructure /></R>} />
      <Route path="/master/salary-structure/add" element={<R roles={ADMINS}><MasterSalaryStructure /></R>} />
      <Route path="/master/salary-structure/assign" element={<R roles={ADMINS}><MasterSalaryStructureAssignHead /></R>} />

      {/* Master → Other */}
      <Route path="/master/other/qualification" element={<R roles={ADMINS}><MasterQualification /></R>} />
      <Route path="/master/other/bank" element={<R roles={ADMINS}><MasterBank /></R>} />
      <Route path="/master/other/tag" element={<R roles={ADMINS}><MasterTag /></R>} />
      <Route path="/master/other/city" element={<R roles={ADMINS}><MasterCity /></R>} />
      <Route path="/master/other/document" element={<R roles={ADMINS}><MasterDocumentMaster /></R>} />
      <Route path="/master/other/important-form" element={<R roles={ADMINS}><MasterImportantForm /></R>} />
      <Route path="/master/other/level" element={<R roles={ADMINS}><MasterLevel /></R>} />
      <Route path="/master/other/grade-form" element={<R roles={ADMINS}><MasterGrade /></R>} />
      <Route path="/master/other/attendance-upload-site" element={<R roles={ADMINS}><MasterAttUploadSite /></R>} />
      <Route path="/master/other/attendance-auto-mail-sms" element={<R roles={ADMINS}><MasterAttAutoNotification /></R>} />
      <Route path="/master/other/sim/add" element={<R roles={ADMINS}><MasterSimAdd /></R>} />
      <Route path="/master/other/sim/list" element={<R roles={ADMINS}><MasterSimList /></R>} />

      {/* Master → Leave */}
      <Route path="/master/leave/finyear" element={<R roles={ADMINS}><MasterLeaveFinyear /></R>} />

      {/* Master → TDS */}
      <Route path="/master/tds/other-income" element={<R roles={ADMINS}><MasterOtherIncome /></R>} />
      <Route path="/master/tds/exemption" element={<R roles={ADMINS}><MasterTdsExemption /></R>} />

      {/* Master → Employee (Phase 2) */}
      <Route path="/master/employee/add" element={<R roles={ADMINS}><MasterEmployeeAdd /></R>} />
      <Route path="/master/employee/edit/:id" element={<R roles={ADMINS}><MasterEmployeeAdd /></R>} />
      <Route path="/master/employee/list" element={<R roles={ADMINS}><MasterEmployeeList /></R>} />
      <Route path="/master/employee/resignation" element={<R roles={ADMINS}><MasterEmployeeResignation /></R>} />

      {/* Master → User */}
      <Route path="/master/user/add" element={<R roles={ADMINS}><MasterUserAdd /></R>} />
      <Route path="/master/user/edit/:id" element={<R roles={ADMINS}><MasterUserAdd /></R>} />
      <Route path="/master/user/list" element={<R roles={ADMINS}><MasterUserList /></R>} />
      <Route path="/master/user/rights" element={<R roles={ADMINS}><MasterUserRights /></R>} />
      <Route path="/master/user/reset-password" element={<R roles={ADMINS}><MasterUserResetPassword /></R>} />
      <Route path="/master/user/day-authorization" element={<R roles={ADMINS}><MasterUserDayAuth /></R>} />

      {/* Master → Leave */}
      <Route path="/master/leave/leave" element={<R roles={ADMINS}><MasterLeaveType /></R>} />
      <Route path="/master/leave/opening" element={<R roles={ADMINS}><MasterEmpLeaveOpening /></R>} />
      <Route path="/master/leave/closing-transfer" element={<R roles={ADMINS}><MasterClosingLeaveTransfer /></R>} />
      <Route path="/master/leave/branch-holiday" element={<R roles={ADMINS}><MasterHoliday /></R>} />
      <Route path="/master/leave/branch-holiday/optional" element={<R roles={ADMINS}><MasterOptionalHoliday /></R>} />

      {/* Master → Other (Phase 2 remaining) */}
      <Route path="/master/other/sms-email-alert" element={<R roles={ADMINS}><MasterSmsEmailAlert /></R>} />
      <Route path="/master/other/image-gallery" element={<R roles={ADMINS}><MasterImageGallery /></R>} />
      <Route path="/master/other/manage-messages" element={<R roles={ADMINS}><MasterManageMessages /></R>} />

      {/* Master → Employee (Phase 3 auxiliary ops) */}
      <Route path="/master/employee/branch-shift" element={<R roles={ADMINS}><MasterEmployeeBranchShift /></R>} />
      <Route path="/master/employee/multiple-shift-transfer" element={<R roles={ADMINS}><MasterEmployeeMultipleShiftTransfer /></R>} />
      <Route path="/master/employee/multiple-branch-transfer" element={<R roles={ADMINS}><MasterEmployeeMultipleBranchTransfer /></R>} />
      <Route path="/master/employee/multiple-update" element={<R roles={ADMINS}><MasterEmployeeMultipleUpdate /></R>} />
      <Route path="/master/employee/multiple-reporting-update" element={<R roles={ADMINS}><MasterEmployeeMultipleReportingUpdate /></R>} />
      <Route path="/master/employee/multiple-salary-structure" element={<R roles={ADMINS}><MasterEmployeeMultipleSalaryStructure /></R>} />
      <Route path="/master/employee/multiple-salary-appraisal" element={<R roles={ADMINS}><MasterEmployeeMultipleSalaryAppraisal /></R>} />
      <Route path="/master/employee/full-and-final" element={<R roles={ADMINS}><MasterEmployeeFullAndFinal /></R>} />
      <Route path="/master/employee/temporary" element={<R roles={ADMINS}><MasterEmployeeTemporary /></R>} />
      <Route path="/master/employee/document-update" element={<R roles={ADMINS}><MasterEmployeeDocumentUpdate /></R>} />

      {/* Master → Other — Shift */}
      <Route path="/master/other/shift" element={<R roles={ADMINS}><MasterShift /></R>} />

      {/* ══════════════════════════════════════════════════════════════════════
          NwayERP-style Master / Transaction / Reports / Setting placeholders.
          Each route renders ComingSoon with a descriptive module name.
          Filled in progressively as the user provides per-module screenshots.
         ══════════════════════════════════════════════════════════════════════ */}
      {NEW_PLACEHOLDER_ROUTES.map(([path, label]) => (
        <Route
          key={path}
          path={path}
          element={<R roles={ADMINS}><ComingSoon moduleName={label}>{null}</ComingSoon></R>}
        />
      ))}

      <Route path="*" element={<Suspense><NotFound /></Suspense>} />
    </Routes>
  );
}

// Data-driven: one row per leaf route. Add entries here and they become live routes.
const NEW_PLACEHOLDER_ROUTES: [path: string, label: string][] = [
  // Top-level stubs
  ['/transaction', 'Transaction'],
  ['/reports-hub', 'Reports'],
  ['/setting', 'Setting'],

  // Master → Parent Department — LIVE (see routes above)
  // Master → Department — LIVE (see routes above)

  // Master → Designation — LIVE (see routes above)
  // Master → Salary Head — LIVE (see routes above)
  // Master → Salary Structure — LIVE (see routes above)

  // All Master submodule routes are now LIVE — see the concrete Route
  // declarations above. Only the top-level Transaction / Reports / Setting
  // landing pages remain as placeholders until the user provides screenshots.
];
