import { Skeleton } from 'antd';
import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import { ProtectedRoute, GuestRoute, RoleGuard } from './guards';
import ComingSoon from '../components/ComingSoon';

// Add module names here to show "Coming Soon" for them
const COMING_SOON_MODULES: string[] = [
  'Payroll',
  'Reports',
  'Shifts',

];

const Login = lazy(() => import('../pages/auth/Login'));
const ForcePasswordChange = lazy(() => import('../pages/auth/ForcePasswordChange'));
const AcceptInvitation = lazy(() => import('../pages/auth/AcceptInvitation'));
const CompanyManagement = lazy(() => import('../pages/admin/CompanyManagement'));
const DashboardRouter = lazy(() => import('../pages/admin/DashboardRouter'));
const UserManagement = lazy(() => import('../pages/admin/UserManagement'));
const AuditLogs = lazy(() => import('../pages/admin/AuditLogs'));
const Settings = lazy(() => import('../pages/admin/Settings'));
const KYCOnboarding = lazy(() => import('../pages/onboarding/KYCOnboarding'));
const OnboardingList = lazy(() => import('../pages/onboarding/OnboardingList'));
const AdminFillOnboarding = lazy(() => import('../pages/onboarding/AdminFillOnboarding'));
const AttendanceList = lazy(() => import('../pages/attendance/AttendanceList'));
const PayrollList = lazy(() => import('../pages/payroll/PayrollList'));
const PayslipView = lazy(() => import('../pages/payroll/PayslipView'));
const JobPostings = lazy(() => import('../pages/recruitment/JobPostings'));
const Applications = lazy(() => import('../pages/recruitment/Applications'));


const Reports = lazy(() => import('../pages/reports/Reports'));
const ShiftList = lazy(() => import('../pages/shifts/ShiftList'));
const ShiftForm = lazy(() => import('../pages/shifts/ShiftForm'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Employee Shift Sessions (punch in/out with selfie + GPS)
const MyShift = lazy(() => import('../pages/shift-sessions/MyShift'));
const ShiftSessionsList = lazy(() => import('../pages/shift-sessions/ShiftSessionsList'));
const ShiftSessionView = lazy(() => import('../pages/shift-sessions/ShiftSessionView'));

const AttendanceForm = lazy(() => import('../pages/attendance/AttendanceForm'));

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
const MasterOtherIncome = lazy(() => import('../pages/master/tds/OtherIncome'));

// Phase 2: Employee + Resignation + User + TDS + Other
const MasterEmployeeAdd = lazy(() => import('../pages/master/employee/Add'));
const MasterEmployeeList = lazy(() => import('../pages/master/employee/List'));
const MasterEmployeeView = lazy(() => import('../pages/master/employee/View'));
const MasterEmployeeResignation = lazy(() => import('../pages/master/employee/Resignation'));
const MasterUserAdd = lazy(() => import('../pages/master/user/UserAdd'));
const MasterUserAddAdmin = lazy(() => import('../pages/master/user/UserAddAdmin'));
const MasterUserAddByMapping = lazy(() => import('../pages/master/user/UserAddByMapping'));
const MasterUserList = lazy(() => import('../pages/master/user/UserList'));
const MasterUserView = lazy(() => import('../pages/master/user/UserView'));
const MasterUserRights = lazy(() => import('../pages/master/user/UserRights'));
const MasterUserResetPassword = lazy(() => import('../pages/master/user/ResetPassword'));
const MasterUserDayAuth = lazy(() => import('../pages/master/user/DayAuthorization'));

const MasterTdsExemption = lazy(() => import('../pages/master/tds/Exemption'));
const MasterSmsEmailAlert = lazy(() => import('../pages/master/other/SmsEmailAlert'));
const MasterImageGallery = lazy(() => import('../pages/master/other/ImageGallery'));
const MasterManageMessages = lazy(() => import('../pages/master/other/ManageMessages'));

// InProgress page for Transaction & Reports modules
const InProgress = lazy(() => import('../pages/InProgress'));

// ── Admin-Accounts Module ────────────────────────────────────────────────────
const AccountGroupAdd = lazy(() => import('../pages/accounts/master/account-group/Add'));
const AccountGroupList = lazy(() => import('../pages/accounts/master/account-group/List'));

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

// Admin Module
const AdminModuleDashboard = lazy(() => import('../pages/admin-module/Dashboard'));
const AdminModuleCompanyList = lazy(() => import('../pages/admin-module/company/List'));
const AdminModuleCompanyEdit = lazy(() => import('../pages/admin-module/company/Edit'));
const AdminModuleSiteAdd = lazy(() => import('../pages/admin-module/site/Add'));
const AdminModuleSiteList = lazy(() => import('../pages/admin-module/site/List'));
const AdminModuleSiteDocument = lazy(() => import('../pages/admin-module/site/Document'));
const AdminModuleLocationAdd = lazy(() => import('../pages/admin-module/location/Add'));
const AdminModuleLocationList = lazy(() => import('../pages/admin-module/location/List'));
const AdminModuleLocationRoute = lazy(() => import('../pages/admin-module/location/LocationRoute'));
const AdminModuleViaRoute = lazy(() => import('../pages/admin-module/location/ViaRoute'));
const AdminModuleMessageAdd = lazy(() => import('../pages/admin-module/message/Add'));
const AdminModuleMessageList = lazy(() => import('../pages/admin-module/message/List'));
const AdminModuleGstMaster = lazy(() => import('../pages/admin-module/gst/Master'));
const AdminModuleSmsAlertAdd = lazy(() => import('../pages/admin-module/sms-alert/Add'));
const AdminModuleSmsAlertList = lazy(() => import('../pages/admin-module/sms-alert/List'));
const AdminModuleMisProjectSetting = lazy(() => import('../pages/admin-module/mis-project/Setting'));
const AdminModuleFrontGallery = lazy(() => import('../pages/admin-module/front-gallery/Gallery'));
const AdminModuleSiteDocMaster = lazy(() => import('../pages/admin-module/site-doc/Master'));
const AdminModuleMobileAppAdd = lazy(() => import('../pages/admin-module/mobile-app/Add'));
const AdminModuleMobileAppList = lazy(() => import('../pages/admin-module/mobile-app/List'));
const AdminReportLoginLog = lazy(() => import('../pages/admin-module/reports/LoginLog'));
const AdminReportCompany = lazy(() => import('../pages/admin-module/reports/CompanyReport'));
const AdminReportSite = lazy(() => import('../pages/admin-module/reports/SiteReport'));
const AdminReportLocation = lazy(() => import('../pages/admin-module/reports/LocationReport'));
const AdminReportShiftSiteDuration = lazy(() => import('../pages/admin-module/reports/ShiftSiteDurationReport'));
const AdminReportVoucher = lazy(() => import('../pages/admin-module/reports/VoucherStatus'));
const AdminReportUserWork = lazy(() => import('../pages/admin-module/reports/UserWorkReport'));
const AdminReportSiteWiseUsers = lazy(() => import('../pages/admin-module/reports/SiteWiseUsers'));
const AdminReportUserRightSummary = lazy(() => import('../pages/admin-module/reports/UserRightSummary'));
const AdminReportIdleUser = lazy(() => import('../pages/admin-module/reports/IdleUserReport'));
const AdminModuleCityAdd = lazy(() => import('../pages/admin-module/city/Add'));
const AdminModuleCityList = lazy(() => import('../pages/admin-module/city/List'));
const AdminModuleStateAdd = lazy(() => import('../pages/admin-module/state/Add'));
const AdminModuleStateList = lazy(() => import('../pages/admin-module/state/List'));

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
      <Route path="/force-password-change" element={<ProtectedRoute><Suspense><ForcePasswordChange /></Suspense></ProtectedRoute>} />
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
      <Route path="/payroll" element={<R roles={ADMINS}><CS moduleName="Payroll"><PayrollList /></CS></R>} />
      <Route path="/payroll/payslip/:id" element={<R roles={ADMINS}><CS moduleName="Payroll"><PayslipView /></CS></R>} />
      <Route path="/recruitment" element={<R roles={ADMINS}><CS moduleName="Recruitment"><JobPostings /></CS></R>} />
      <Route path="/recruitment/create" element={<R roles={ADMINS}><CS moduleName="Recruitment"><JobForm /></CS></R>} />
      <Route path="/recruitment/:id/edit" element={<R roles={ADMINS}><CS moduleName="Recruitment"><JobForm /></CS></R>} />
      <Route path="/recruitment/applications" element={<R roles={ADMINS}><CS moduleName="Recruitment"><Applications /></CS></R>} />
      <Route path="/reports" element={<R roles={['employee']}><CS moduleName="Reports"><Reports /></CS></R>} />
      <Route path="/shifts" element={<R roles={['employee']}><CS moduleName="Shifts"><ShiftList /></CS></R>} />
      <Route path="/shifts/create" element={<R roles={['employee']}><CS moduleName="Shifts"><ShiftForm /></CS></R>} />
      <Route path="/shifts/:id/edit" element={<R roles={['employee']}><CS moduleName="Shifts"><ShiftForm /></CS></R>} />

      {/* Management (admin + HR + manager) */}
      <Route path="/attendance" element={<R roles={MANAGEMENT}><CS moduleName="Attendance"><AttendanceList /></CS></R>} />
      <Route path="/attendance/mark" element={<R roles={MANAGEMENT}><CS moduleName="Attendance"><AttendanceForm /></CS></R>} />

      {/* ══════════════════════════════════════════════════════════════════════
          Employee Shift Sessions — punch in/out with selfie + GPS
         ══════════════════════════════════════════════════════════════════════ */}
      {/* Employee self-service: only employee users can run a shift */}
      <Route path="/shift-sessions/my" element={<R roles={['employee']}><MyShift /></R>} />
      {/* Admin / HR list & detail (detail also accessible to owner — backend enforces) */}
      <Route path="/shift-sessions" element={<R roles={ADMINS}><ShiftSessionsList /></R>} />
      <Route path="/admin-module/shift-sessions" element={<R roles={ADMINS}><ShiftSessionsList /></R>} />
      <Route path="/shift-sessions/:id" element={<R roles={ALL_COMPANY}><ShiftSessionView /></R>} />


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
      <Route path="/master/other/sim/edit/:id" element={<R roles={ADMINS}><MasterSimAdd /></R>} />
      <Route path="/master/other/sim/list" element={<R roles={ADMINS}><MasterSimList /></R>} />

      {/* Master → TDS */}
      <Route path="/master/tds/other-income" element={<R roles={ADMINS}><MasterOtherIncome /></R>} />
      <Route path="/master/tds/exemption" element={<R roles={ADMINS}><MasterTdsExemption /></R>} />

      {/* Master → Employee (Phase 2) */}
      <Route path="/master/employee/add" element={<R roles={ADMINS}><MasterEmployeeAdd /></R>} />
      <Route path="/master/employee/edit/:id" element={<R roles={ADMINS}><MasterEmployeeAdd /></R>} />
      <Route path="/master/employee/view/:id" element={<R roles={ADMINS}><MasterEmployeeView /></R>} />
      <Route path="/master/employee/list" element={<R roles={ADMINS}><MasterEmployeeList /></R>} />
      <Route path="/master/employee/resignation" element={<R roles={ADMINS}><MasterEmployeeResignation /></R>} />

      {/* Master → User */}
      <Route path="/master/user/add" element={<R roles={ADMINS}><MasterUserAdd /></R>} />
      <Route path="/master/user/edit/:id" element={<R roles={ADMINS}><MasterUserAdd /></R>} />
      <Route path="/master/user/list" element={<R roles={ADMINS}><MasterUserList /></R>} />
      <Route path="/master/user/view/:id" element={<R roles={ADMINS}><MasterUserView /></R>} />
      <Route path="/master/user/rights" element={<R roles={ADMINS}><MasterUserRights /></R>} />
      <Route path="/master/user/reset-password" element={<R roles={ADMINS}><MasterUserResetPassword /></R>} />
      <Route path="/master/user/day-authorization" element={<R roles={ADMINS}><MasterUserDayAuth /></R>} />

      {/* Master → Other (Phase 2 remaining) */}
      <Route path="/master/other/sms-email-alert" element={<R roles={ADMINS}><MasterSmsEmailAlert /></R>} />
      <Route path="/master/other/sms-email-alert/add" element={<R roles={ADMINS}><MasterSmsEmailAlert /></R>} />
      <Route path="/master/other/sms-email-alert/edit/:id" element={<R roles={ADMINS}><MasterSmsEmailAlert /></R>} />
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
          Setting — all sub-routes → InProgress
         ══════════════════════════════════════════════════════════════════════ */}
      {SETTING_ROUTES.map((path) => (
        <Route key={path} path={path} element={<R roles={ADMINS}><InProgress /></R>} />
      ))}

      {/* ══════════════════════════════════════════════════════════════════════
          Transaction — all sub-routes → InProgress
         ══════════════════════════════════════════════════════════════════════ */}
      {TRANSACTION_ROUTES.map((path) => (
        <Route key={path} path={path} element={<R roles={ADMINS}><InProgress /></R>} />
      ))}

      {/* ══════════════════════════════════════════════════════════════════════
          Reports — all sub-routes → InProgress
         ══════════════════════════════════════════════════════════════════════ */}
      {REPORT_ROUTES.map((path) => (
        <Route key={path} path={path} element={<R roles={ADMINS}><InProgress /></R>} />
      ))}

      {/* ══════════════════════════════════════════════════════════════════════
          Admin Module (ERP module = "admin") — dashboard + sub-routes
         ══════════════════════════════════════════════════════════════════════ */}
      <Route path="/admin-module" element={<R roles={ADMINS}><AdminModuleDashboard /></R>} />
      <Route path="/admin-module/master/company/list" element={<R roles={ADMINS}><AdminModuleCompanyList /></R>} />
      <Route path="/admin-module/master/company/edit/:id" element={<R roles={ADMINS}><AdminModuleCompanyEdit /></R>} />
      <Route path="/admin-module/master/site/add" element={<R roles={ADMINS}><AdminModuleSiteAdd /></R>} />
      <Route path="/admin-module/master/site/list" element={<R roles={ADMINS}><AdminModuleSiteList /></R>} />
      <Route path="/admin-module/master/site/edit/:id" element={<R roles={ADMINS}><AdminModuleSiteAdd /></R>} />
      <Route path="/admin-module/master/site/document" element={<R roles={ADMINS}><AdminModuleSiteDocument /></R>} />
      <Route path="/admin-module/master/site-location/add" element={<R roles={ADMINS}><AdminModuleLocationAdd /></R>} />
      <Route path="/admin-module/master/site-location/edit/:id" element={<R roles={ADMINS}><AdminModuleLocationAdd /></R>} />
      <Route path="/admin-module/master/site-location/list" element={<R roles={ADMINS}><AdminModuleLocationList /></R>} />
      <Route path="/admin-module/master/site-location/location-route" element={<R roles={ADMINS}><AdminModuleLocationRoute /></R>} />
      <Route path="/admin-module/master/site-location/via-route" element={<R roles={ADMINS}><AdminModuleViaRoute /></R>} />
      <Route path="/admin-module/master/message-from-mng" element={<R roles={ADMINS}><AdminModuleMessageList /></R>} />
      <Route path="/admin-module/master/message-from-mng/list" element={<R roles={ADMINS}><AdminModuleMessageList /></R>} />
      <Route path="/admin-module/master/message-from-mng/add" element={<R roles={ADMINS}><AdminModuleMessageAdd /></R>} />
      <Route path="/admin-module/master/message-from-mng/edit/:id" element={<R roles={ADMINS}><AdminModuleMessageAdd /></R>} />
      <Route path="/admin-module/master/gst/master" element={<R roles={ADMINS}><AdminModuleGstMaster /></R>} />
      <Route path="/admin-module/master/sms-alert-voucher" element={<R roles={ADMINS}><AdminModuleSmsAlertList /></R>} />
      <Route path="/admin-module/master/sms-alert-voucher/list" element={<R roles={ADMINS}><AdminModuleSmsAlertList /></R>} />
      <Route path="/admin-module/master/sms-alert-voucher/add" element={<R roles={ADMINS}><AdminModuleSmsAlertAdd /></R>} />
      <Route path="/admin-module/master/sms-alert-voucher/edit/:id" element={<R roles={ADMINS}><AdminModuleSmsAlertAdd /></R>} />
      <Route path="/admin-module/master/mis-project-setting" element={<R roles={ADMINS}><AdminModuleMisProjectSetting /></R>} />
      <Route path="/admin-module/master/front-image-gallery" element={<R roles={ADMINS}><AdminModuleFrontGallery /></R>} />
      <Route path="/admin-module/master/site-document-master" element={<R roles={ADMINS}><AdminModuleSiteDocMaster /></R>} />
      <Route path="/admin-module/master/mobile-app-count" element={<R roles={ADMINS}><AdminModuleMobileAppAdd /></R>} />
      <Route path="/admin-module/master/mobile-app-count/add" element={<R roles={ADMINS}><AdminModuleMobileAppAdd /></R>} />
      <Route path="/admin-module/master/mobile-app-count/list" element={<R roles={ADMINS}><AdminModuleMobileAppList /></R>} />
      <Route path="/admin-module/reports/login-log" element={<R roles={ADMINS}><AdminReportLoginLog /></R>} />
      <Route path="/admin-module/reports/company" element={<R roles={ADMINS}><AdminReportCompany /></R>} />
      <Route path="/admin-module/reports/site" element={<R roles={ADMINS}><AdminReportSite /></R>} />
      <Route path="/admin-module/reports/location" element={<R roles={ADMINS}><AdminReportLocation /></R>} />
      <Route path="/admin-module/reports/employee-site-duration" element={<R roles={ADMINS}><AdminReportShiftSiteDuration /></R>} />
      <Route path="/admin-module/reports/voucher-status" element={<R roles={ADMINS}><AdminReportVoucher /></R>} />
      <Route path="/admin-module/reports/user-work" element={<R roles={ADMINS}><AdminReportUserWork /></R>} />
      {/* Send SMS reports — work in progress; requirements not finalised. */}
      <Route path="/admin-module/reports/send-sms/stock-report" element={<R roles={ADMINS}><InProgress /></R>} />
      <Route path="/admin-module/reports/send-sms/machine-insurance-alert" element={<R roles={ADMINS}><InProgress /></R>} />
      <Route path="/admin-module/reports/site-wise-users" element={<R roles={ADMINS}><AdminReportSiteWiseUsers /></R>} />
      <Route path="/admin-module/reports/user-right-summary" element={<R roles={ADMINS}><AdminReportUserRightSummary /></R>} />
      <Route path="/admin-module/reports/idle-user" element={<R roles={ADMINS}><AdminReportIdleUser /></R>} />

      {/* ══════════════════════════════════════════════════════════════════════
           Admin-Accounts Module
         ══════════════════════════════════════════════════════════════════════ */}
      {/* Account Group — fully implemented */}
      <Route path="/accounts/master/account-group/add" element={<R roles={ADMINS}><AccountGroupAdd /></R>} />
      <Route path="/accounts/master/account-group/edit/:id" element={<R roles={ADMINS}><AccountGroupAdd /></R>} />
      <Route path="/accounts/master/account-group/list" element={<R roles={ADMINS}><AccountGroupList /></R>} />

      {/* Everything else → InProgress */}
      {ACCOUNTS_MODULE_ROUTES.map((path) => (
        <Route key={path} path={path} element={<R roles={ADMINS}><InProgress /></R>} />
      ))}
      <Route path="/admin-module/master/city/add" element={<R roles={ADMINS}><AdminModuleCityAdd /></R>} />
      <Route path="/admin-module/master/city/edit/:id" element={<R roles={ADMINS}><AdminModuleCityAdd /></R>} />
      <Route path="/admin-module/master/city/list" element={<R roles={ADMINS}><AdminModuleCityList /></R>} />
      <Route path="/admin-module/master/state/add" element={<R roles={ADMINS}><AdminModuleStateAdd /></R>} />
      <Route path="/admin-module/master/state/edit/:id" element={<R roles={ADMINS}><AdminModuleStateAdd /></R>} />
      <Route path="/admin-module/master/state/list" element={<R roles={ADMINS}><AdminModuleStateList /></R>} />
      <Route path="/admin-module/master/user/add" element={<R roles={ADMINS}><MasterUserAddAdmin /></R>} />
      <Route path="/admin-module/master/user/add-by-mapping" element={<R roles={ADMINS}><MasterUserAddByMapping /></R>} />
      <Route path="/admin-module/master/user/edit/:id" element={<R roles={ADMINS}><MasterUserAddAdmin /></R>} />
      <Route path="/admin-module/master/user/list" element={<R roles={ADMINS}><MasterUserList /></R>} />
      <Route path="/admin-module/master/user/rights-summary" element={<R roles={ADMINS}><MasterUserRights /></R>} />
      <Route path="/admin-module/master/user/reset-password" element={<R roles={ADMINS}><MasterUserResetPassword /></R>} />
      <Route path="/admin-module/master/user/day-auth-by-user" element={<R roles={ADMINS}><MasterUserDayAuth /></R>} />
      <Route path="/admin-module/master/user/day-auth-by-entity" element={<R roles={ADMINS}><MasterUserDayAuth /></R>} />
      {ADMIN_MODULE_ROUTES.map((path) => (
        <Route key={path} path={path} element={<R roles={ADMINS}><InProgress /></R>} />
      ))}

      <Route path="*" element={<Suspense><NotFound /></Suspense>} />
    </Routes>
  );
}

// ─── Admin-Accounts Module routes (all Coming Soon / InProgress) ──────────────
const ACCOUNTS_MODULE_ROUTES: string[] = [
  '/accounts',
  // Master → Account Group (explicit routes handle add/edit/list)
  '/accounts/master/account-group/tree',
  '/accounts/master/account-group/setting',
  // Master → Account
  '/accounts/master/account/add',
  '/accounts/master/account/list',
  '/accounts/master/account/kyc-list',
  '/accounts/master/account/bank-verify',
  '/accounts/master/account/update-info',
  '/accounts/master/account/opening-balance',
  '/accounts/master/account/unassigned',
  '/accounts/master/account/transfer-next-year',
  '/accounts/master/account/merge',
  '/accounts/master/account/used-detail',
  '/accounts/master/account/balance-update',
  '/accounts/master/account/multi-group-update',
  '/accounts/master/account/site-wise',
  '/accounts/master/account/delete-log',
  '/accounts/master/account/unused',
  '/accounts/master/account/delete-multiple',
  '/accounts/master/account/assign-tds',
  // Master → TDS Configuration
  '/accounts/master/tds-config/add',
  '/accounts/master/tds-config/list',
  // Master → Budget
  '/accounts/master/budget/add',
  '/accounts/master/budget/list',
  // Master → Branch / Division
  '/accounts/master/branch-division/add',
  '/accounts/master/branch-division/list',
  // Master → Tax IN
  '/accounts/master/tax-in/add',
  '/accounts/master/tax-in/list',
  // Master → Work Contract
  '/accounts/master/work-contract/add',
  '/accounts/master/work-contract/list',
  // Master → Account Group Schedule
  '/accounts/master/account-group-schedule/add',
  '/accounts/master/account-group-schedule/list',
  // Master → Account Schedule
  '/accounts/master/account-schedule/add',
  '/accounts/master/account-schedule/list',
  // Master → Account Create
  '/accounts/master/account-create/add',
  '/accounts/master/account-create/list',
  // Master → Cheque Configuration
  '/accounts/master/cheque-config/add',
  '/accounts/master/cheque-config/list',
  // Master → Item Stock Manual
  '/accounts/master/item-stock-manual/add',
  '/accounts/master/item-stock-manual/list',
  // Master → standalone pages
  '/accounts/master/gstin-account-opening',
  '/accounts/master/financial-year',
  '/accounts/master/lock-month-financial',
  '/accounts/master/opening-balance-lock',
  // Master → Item Group
  '/accounts/master/item-group/add',
  '/accounts/master/item-group/list',
  // Master → Narration
  '/accounts/master/narration/add',
  '/accounts/master/narration/list',
  // Master → Setting
  '/accounts/master/setting',
];

// ─── Admin Module routes still under construction ─────────────────────────────
// Anything in this list resolves to <InProgress />. Routes that have a real
// component above (location-route, message-from-mng, gst/master, sms-alert-voucher,
// mis-project-setting, front-image-gallery, site-document-master, mobile-app-count,
// reports/*) are NOT listed here — duplicating them would race the explicit Route.
const ADMIN_MODULE_ROUTES: string[] = [
  // User → still missing: copy-rights flows.
  '/admin-module/master/user/copy-site-right',
  '/admin-module/master/user/copy-user-site-right',
  // Master → Item Ledger Update — placeholder.
  '/admin-module/master/item-ledger-update',
];

// ─── Transaction routes (InProgress) ──────────────────────────────────────────
const TRANSACTION_ROUTES: string[] = [
  // On Duty
  '/transaction/on-duty/add',
  '/transaction/on-duty/list',
  '/transaction/on-duty/remove-pending',
  '/transaction/on-duty/multiple',
  '/transaction/on-duty/multiple-list',
  // Over Time
  '/transaction/overtime/add',
  '/transaction/overtime/list',
  '/transaction/overtime/calculation',
  '/transaction/overtime/remove-pending',
  '/transaction/overtime/multiple',
  '/transaction/overtime/multiple-list',
  // Attendance
  '/transaction/attendance/month-wise',
  '/transaction/attendance/day-wise',
  '/transaction/attendance/employee-wise',
  '/transaction/attendance/summary',
  '/transaction/attendance/machine-punch/employee-wise',
  '/transaction/attendance/machine-punch/day-wise',
  '/transaction/attendance/multiple-punch',
  '/transaction/attendance/import',
  '/transaction/attendance/week-off',
  '/transaction/attendance/copy',
  // Loan / Advance
  '/transaction/loan-advance/add',
  '/transaction/loan-advance/list',
  // Other Add./Ded.
  '/transaction/other-add-ded/addition',
  '/transaction/other-add-ded/deduction',
  '/transaction/other-add-ded/installment',
  '/transaction/other-add-ded/day-deduction',
  '/transaction/other-add-ded/import',
  '/transaction/other-add-ded/deduction-xml-import',
  // PT/TDS Deduction
  '/transaction/pt-tds/pt-deduction',
  '/transaction/pt-tds/tds-deduction',
  '/transaction/pt-tds/tds-exemption',
  // Salary Pre-Process
  '/transaction/salary-pre-process/sandwich-policy',
  '/transaction/salary-pre-process/incentive-calculation',
  // Salary
  '/transaction/salary/calculation',
  '/transaction/salary/list',
  // Sim Allotment
  '/transaction/sim-allotment/add',
  '/transaction/sim-allotment/list',
  '/transaction/sim-allotment/mobile-bill-deduction',
  '/transaction/sim-allotment/multiple-mob-bill-ded',
  '/transaction/sim-allotment/mob-bill-ded-list',
  // More Transaction → Notice Board
  '/transaction/notice-board/add',
  '/transaction/notice-board/list',
];

// ─── Reports routes (InProgress) ─────────────────────────────────────────────
const REPORT_ROUTES: string[] = [
  // Attendance
  '/reports/attendance/month-wise',
  '/reports/attendance/day-wise',
  '/reports/attendance/employee-wise',
  '/reports/attendance/machine-punch',
  '/reports/attendance/sitewise',
  '/reports/attendance/daily-att-camera',
  '/reports/attendance/emp-att-camera',
  // Salary
  '/reports/salary/month-payslip',
  '/reports/salary/emp-payslip',
  '/reports/salary/emp-salary-structure',
  '/reports/salary/monthly-salary-graph',
  '/reports/salary/summary',
  '/reports/salary/gross-summary',
  '/reports/salary/short-hours-deduction',
  '/reports/salary/payment-voucher',
  // Taxation
  '/reports/taxation/month-sheet',
  '/reports/taxation/yearly-sheet',
  '/reports/taxation/emp-sheet',
  // Customize Report
  '/reports/customize',
  // Employee
  '/reports/employee/report',
  '/reports/employee/branch-wise',
  '/reports/employee/branch-transfer',
  '/reports/employee/tree',
  '/reports/employee/id-card',
  '/reports/employee/appraisal-due',
  '/reports/employee/appraisal',
  '/reports/employee/promotion',
  '/reports/employee/relative',
  '/reports/employee/education',
  '/reports/employee/document-det',
  '/reports/employee/prev-org-det',
  '/reports/employee/tds-regime',
  // Standalone reports
  '/reports/employee-ledger',
  '/reports/compliance-register',
  '/reports/loan-advance-detail',
  '/reports/other-add-ded',
  '/reports/mobile-bill',
  '/reports/full-and-final',
  '/reports/employee-gratuity',
  // Statement
  '/reports/statement/on-duty',
  '/reports/statement/over-time',
  '/reports/statement/exp-reimbursement',
  // TDS Deduction
  '/reports/tds-deduction/exemption',
  '/reports/tds-deduction/planning',
];

// ─── Setting routes (InProgress) ─────────────────────────────────────────────
const SETTING_ROUTES: string[] = [
  // PF / ESIC Rate Editor
  '/setting/pf-esic-rate/add',
  '/setting/pf-esic-rate/list',
  // PT Rate Setting
  '/setting/pt-rate/add',
  '/setting/pt-rate/list',
  // TDS Rate Editor
  '/setting/tds-rate/add',
  '/setting/tds-rate/list',
  // National Pension Scheme
  '/setting/national-pension/add',
  '/setting/national-pension/list',
  // Letter Format
  '/setting/letter-format/add',
  '/setting/letter-format/list',
  // Report Editor
  '/setting/report-editor/relieving-letter',
  '/setting/report-editor/resignation-letter',
  '/setting/report-editor/terms-and-condition',
  // Standalone settings
  '/setting/bonus-cal-formula',
  '/setting/deduction-cal-formula',
  '/setting/labour-welfare-fund',
  '/setting/emp-section-setting',
  // Mandatory Field
  '/setting/mandatory-field/employee-master',
  // More standalone
  '/setting/loan-advance-setting',
  '/setting/attendance-process-exec',
];
