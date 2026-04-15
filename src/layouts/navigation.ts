import {
  type LucideIcon,
  LayoutDashboard, Users, Settings, Contact, Building2, Award,
  UserPlus, Clock, ClipboardList, CalendarDays, Palmtree, FileText,
  IndianRupee, Wallet, Briefcase, FileSearch, Star, GraduationCap,
  BookOpen, FolderOpen, PartyPopper, Megaphone, Receipt, Package, LifeBuoy, BarChart3,
  Activity, Timer, GitBranch,
  // Master group additions (verified lucide-react exports)
  Database, Building, Coins, UserCog, Percent, Boxes, ArrowRightLeft,
  Plus, List, Merge, Hash, Link2, UserX, TrendingUp, Edit, FileSpreadsheet,
  CalendarPlus, CalendarClock, CalendarRange, ShieldCheck, KeyRound,
  CalendarCheck, BadgePercent, School, Landmark, Tag, MapPin, FileCheck,
  Layers, UploadCloud, BellRing, Image as ImageIcon, MessageSquare,
  Smartphone,
} from 'lucide-react';

export interface NavItem {
  titleKey: string;
  href?: string;
  icon: LucideIcon;
  children?: NavItem[];
  roles?: string[];
}

// ─── Role groups ─────────────────────────────────────────────────────────────
// admin        = Company Admin (full company control)
// hr_manager   = HR Manager (HR operations, no user management)
// manager      = Manager (team oversight)
// employee     = Employee (self-service only)

const ADMINS = ['admin', 'hr_manager'];
const SELF_SERVICE = ['manager', 'employee', 'viewer'];
const ALL_COMPANY = ['admin', 'hr_manager', 'manager', 'employee', 'viewer'];

export const navigationItems: NavItem[] = [
  // ─── Everyone ──────────────────────────────────────────────────────────────
  { titleKey: 'dashboard', href: '/admin', icon: LayoutDashboard },

  // ══════════════════════════════════════════════════════════════════════════
  // NwayERP-style Master / Transaction / Reports / Setting groups
  // (Pinned right below Dashboard per user request; old per-module nav items
  // still follow below for backward-compat until they get migrated/removed.)
  // ══════════════════════════════════════════════════════════════════════════
  {
    titleKey: 'nav_master', icon: Database, roles: ADMINS,
    children: [
      {
        titleKey: 'nav_parent_department', icon: Building,
        children: [
          { titleKey: 'nav_add', href: '/master/parent-department/add', icon: Plus },
          { titleKey: 'nav_list', href: '/master/parent-department/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_department', icon: Building2,
        children: [
          { titleKey: 'nav_add', href: '/master/department/add', icon: Plus },
          { titleKey: 'nav_list', href: '/master/department/list', icon: List },
          { titleKey: 'nav_merge', href: '/master/department/merge', icon: Merge },
        ],
      },
      {
        titleKey: 'nav_designation', icon: Award,
        children: [
          { titleKey: 'nav_add', href: '/master/designation/add', icon: Plus },
          { titleKey: 'nav_list', href: '/master/designation/list', icon: List },
          { titleKey: 'nav_merge', href: '/master/designation/merge', icon: Merge },
          { titleKey: 'nav_no_of_employee', href: '/master/designation/employee-count', icon: Hash },
        ],
      },
      // Employee Group — new addition per user request.
      { titleKey: 'nav_employee_group', href: '/master/employee-group', icon: Users },
      {
        titleKey: 'nav_salary_head', icon: Coins,
        children: [
          { titleKey: 'nav_add', href: '/master/salary-head/add', icon: Plus },
          { titleKey: 'nav_list', href: '/master/salary-head/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_salary_structure', icon: Wallet,
        children: [
          // The Salary Structure "Add" screen shows a combined form + list,
          // so the "Add" link lands on the same page as "List" below.
          { titleKey: 'nav_add', href: '/master/salary-structure/list', icon: Plus },
          { titleKey: 'nav_assign_salary_head', href: '/master/salary-structure/assign', icon: Link2 },
        ],
      },
      {
        titleKey: 'nav_employee', icon: Users,
        children: [
          { titleKey: 'nav_add', href: '/master/employee/add', icon: Plus },
          { titleKey: 'nav_list', href: '/master/employee/list', icon: List },
          { titleKey: 'nav_employee_branch_shift', href: '/master/employee/branch-shift', icon: GitBranch },
          { titleKey: 'nav_multiple_shift_transfer', href: '/master/employee/multiple-shift-transfer', icon: ArrowRightLeft },
          { titleKey: 'nav_resignation', href: '/master/employee/resignation', icon: UserX },
          { titleKey: 'nav_multiple_salary_struc', href: '/master/employee/multiple-salary-structure', icon: Wallet },
          { titleKey: 'nav_multiple_salary_appraisal', href: '/master/employee/multiple-salary-appraisal', icon: TrendingUp },
          { titleKey: 'nav_multiple_update', href: '/master/employee/multiple-update', icon: Edit },
          { titleKey: 'nav_multiple_branch_transfer', href: '/master/employee/multiple-branch-transfer', icon: ArrowRightLeft },
          { titleKey: 'nav_multiple_rep_emp_update', href: '/master/employee/multiple-reporting-update', icon: Users },
          { titleKey: 'nav_full_and_final_statement', href: '/master/employee/full-and-final', icon: FileSpreadsheet },
          { titleKey: 'nav_temporary_employee', href: '/master/employee/temporary', icon: UserPlus },
          { titleKey: 'nav_document_update', href: '/master/employee/document-update', icon: FileText },
        ],
      },
      {
        titleKey: 'nav_leave', icon: Palmtree,
        children: [
          { titleKey: 'nav_leave_leaf', href: '/master/leave/leave', icon: CalendarDays },
          { titleKey: 'nav_emp_leave_opening', href: '/master/leave/opening', icon: CalendarPlus },
          { titleKey: 'nav_closing_leave_transfer', href: '/master/leave/closing-transfer', icon: CalendarClock },
          { titleKey: 'nav_branch_wise_holiday', href: '/master/leave/branch-holiday', icon: PartyPopper },
          { titleKey: 'nav_leave_finyear', href: '/master/leave/finyear', icon: CalendarRange },
        ],
      },
      {
        titleKey: 'nav_user', icon: UserCog,
        children: [
          { titleKey: 'nav_user_add', href: '/master/user/add', icon: Plus },
          { titleKey: 'nav_user_list', href: '/master/user/list', icon: List },
          { titleKey: 'nav_user_rights', href: '/master/user/rights', icon: ShieldCheck },
          { titleKey: 'nav_reset_password', href: '/master/user/reset-password', icon: KeyRound },
          { titleKey: 'nav_day_authorization', href: '/master/user/day-authorization', icon: CalendarCheck },
        ],
      },
      {
        titleKey: 'nav_tds', icon: Percent,
        children: [
          { titleKey: 'nav_exemption_master', href: '/master/tds/exemption', icon: BadgePercent },
          { titleKey: 'nav_other_income_master', href: '/master/tds/other-income', icon: IndianRupee },
        ],
      },
      {
        titleKey: 'nav_other', icon: Boxes,
        children: [
          { titleKey: 'nav_qualification', href: '/master/other/qualification', icon: School },
          { titleKey: 'nav_bank', href: '/master/other/bank', icon: Landmark },
          { titleKey: 'nav_sms_email_alert', href: '/master/other/sms-email-alert', icon: BellRing },
          { titleKey: 'nav_tag', href: '/master/other/tag', icon: Tag },
          { titleKey: 'nav_city', href: '/master/other/city', icon: MapPin },
          { titleKey: 'nav_document', href: '/master/other/document', icon: FileText },
          { titleKey: 'nav_shift', href: '/master/other/shift', icon: Timer },
          { titleKey: 'nav_important_form', href: '/master/other/important-form', icon: FileCheck },
          { titleKey: 'nav_level', href: '/master/other/level', icon: Layers },
          { titleKey: 'nav_grade_form', href: '/master/other/grade-form', icon: GraduationCap },
          { titleKey: 'nav_att_upload_site', href: '/master/other/attendance-upload-site', icon: UploadCloud },
          { titleKey: 'nav_att_auto_mail_sms_setting', href: '/master/other/attendance-auto-mail-sms', icon: MessageSquare },
          { titleKey: 'nav_image_gallery', href: '/master/other/image-gallery', icon: ImageIcon },
          { titleKey: 'nav_manage_messages', href: '/master/other/manage-messages', icon: MessageSquare },
          {
            titleKey: 'nav_sim', icon: Smartphone,
            children: [
              { titleKey: 'nav_add', href: '/master/other/sim/add', icon: Plus },
              { titleKey: 'nav_list', href: '/master/other/sim/list', icon: List },
            ],
          },
        ],
      },
    ],
  },
  { titleKey: 'nav_transaction', href: '/transaction', icon: ArrowRightLeft, roles: ADMINS },
  { titleKey: 'nav_reports', href: '/reports-hub', icon: BarChart3, roles: ADMINS },
  { titleKey: 'nav_setting', href: '/setting', icon: Settings, roles: ADMINS },

  // ─── Admin ─────────────────────────────────────────────────────────────────
  { titleKey: 'company_management', href: '/admin/companies', icon: Building2, roles: ['super_admin'] },
  { titleKey: 'user_management', href: '/admin/users', icon: Users, roles: ['super_admin', 'admin', 'hr_manager'] },

  // ─── Branches ──────────────────────────────────────────────────────────────
  { titleKey: 'branches', href: '/branches', icon: GitBranch, roles: ADMINS },

  // ─── HR (admin & HR manager) ───────────────────────────────────────────────
  {
    titleKey: 'hr_management', icon: Contact, roles: ADMINS,
    children: [
      { titleKey: 'employees', href: '/employees', icon: Users },
      { titleKey: 'parent_departments', href: '/parent-departments', icon: Building2 },
      { titleKey: 'departments', href: '/departments', icon: Building2 },
      { titleKey: 'designations', href: '/designations', icon: Award },
    ],
  },
  { titleKey: 'onboarding', href: '/onboarding/list', icon: UserPlus, roles: ADMINS },
  {
    titleKey: 'payroll', icon: IndianRupee, roles: ADMINS,
    children: [
      { titleKey: 'payroll_management', href: '/payroll', icon: Wallet },
    ],
  },
  {
    titleKey: 'recruitment', icon: Briefcase, roles: ADMINS,
    children: [
      { titleKey: 'job_postings', href: '/recruitment', icon: FileSearch },
      { titleKey: 'applications', href: '/recruitment/applications', icon: Users },
    ],
  },
  { titleKey: 'shifts', href: '/shifts', icon: Timer, roles: ADMINS },
  { titleKey: 'reports', href: '/reports', icon: BarChart3, roles: ADMINS },

  // ─── Management (admin + HR + manager) ─────────────────────────────────────
  // Admin/HR see only management views (list), not self-service
  { titleKey: 'attendance_list', href: '/attendance', icon: Clock, roles: ADMINS },
  { titleKey: 'leave_requests', href: '/leaves', icon: Palmtree, roles: ADMINS },

  // Manager sees both management + self-service
  {
    titleKey: 'attendance', icon: Clock, roles: SELF_SERVICE,
    children: [
      { titleKey: 'attendance_list', href: '/attendance', icon: ClipboardList, roles: ['manager'] },
      { titleKey: 'my_attendance', href: '/attendance/my', icon: CalendarDays },
    ],
  },
  {
    titleKey: 'leave_management', icon: Palmtree, roles: SELF_SERVICE,
    children: [
      { titleKey: 'leave_requests', href: '/leaves', icon: FileText, roles: ['manager'] },
      { titleKey: 'apply_leave', href: '/leaves/apply', icon: CalendarDays },
    ],
  },
  { titleKey: 'performance', href: '/performance', icon: Star, roles: ALL_COMPANY },

  // ─── All company roles ─────────────────────────────────────────────────────
  {
    titleKey: 'training', icon: GraduationCap, roles: ALL_COMPANY,
    children: [
      { titleKey: 'programs', href: '/training', icon: BookOpen },
    ],
  },
  { titleKey: 'documents', href: '/documents', icon: FolderOpen, roles: ALL_COMPANY },
  { titleKey: 'holidays', href: '/holidays', icon: PartyPopper, roles: ALL_COMPANY },
  { titleKey: 'announcements', href: '/announcements', icon: Megaphone, roles: ALL_COMPANY },
  { titleKey: 'expenses', href: '/expenses', icon: Receipt, roles: ['admin', 'hr_manager', 'manager', 'viewer'] },
  { titleKey: 'assets', href: '/assets', icon: Package, roles: ALL_COMPANY },
  { titleKey: 'helpdesk', href: '/helpdesk', icon: LifeBuoy, roles: ALL_COMPANY },

  // ─── Settings (everyone) ───────────────────────────────────────────────────
  // ─── Audit & Settings ───────────────────────────────────────────────────────
  { titleKey: 'audit_logs', href: '/admin/audit-logs', icon: Activity, roles: ['super_admin', 'admin'] },
  // { titleKey: 'settings', href: '/admin/settings', icon: Settings },
];
