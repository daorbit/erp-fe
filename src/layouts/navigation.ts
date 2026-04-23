import {
  type LucideIcon,
  LayoutDashboard, Users, Settings, Building2, Award,
  UserPlus, Clock, ClipboardList, CalendarDays, FileText,
  IndianRupee, Wallet, Briefcase, FileSearch, Star, GraduationCap,
  FolderOpen, Receipt, BarChart3,
  Activity, Timer, GitBranch,
  // Master group additions (verified lucide-react exports)
  Database, Building, Coins, UserCog, Percent, Boxes, ArrowRightLeft,
  Plus, List, Merge, Hash, Link2, UserX, TrendingUp, Edit, FileSpreadsheet,
  CalendarPlus, CalendarClock, CalendarRange, ShieldCheck, KeyRound,
  CalendarCheck, BadgePercent, School, Landmark, Tag, MapPin, FileCheck,
  Layers, UploadCloud, BellRing, Image as ImageIcon, MessageSquare,
  Smartphone,
  // Transaction & Reports additions
  CalendarMinus, ClipboardCheck, Calculator, Banknote, FileMinus, FileInput,
  Copy, Sandwich, FileBarChart, CircleDollarSign, CreditCard, ScrollText,
  Scale, FileOutput, MonitorSmartphone, Bell,
  // Setting additions
  Search, FileType, Notebook, HandCoins, DollarSign, Factory,
  SlidersHorizontal, ListChecks, ChevronsRight,
  // Admin module additions
  MapPinned, Route, Clipboard, FolderKey, Smartphone as SmartphoneIcon,
  LogIn, Send, UsersRound, Clock4, FileWarning,
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
  {
    titleKey: 'nav_transaction', icon: ArrowRightLeft, roles: ADMINS,
    children: [

      {
        titleKey: 'nav_on_duty', icon: ClipboardCheck,
        children: [
          { titleKey: 'nav_add', href: '/transaction/on-duty/add', icon: Plus },
          { titleKey: 'nav_list', href: '/transaction/on-duty/list', icon: List },
          { titleKey: 'nav_remove_pending', href: '/transaction/on-duty/remove-pending', icon: UserX },
          { titleKey: 'nav_multiple_on_duty', href: '/transaction/on-duty/multiple', icon: Users },
          { titleKey: 'nav_multiple_on_duty_list', href: '/transaction/on-duty/multiple-list', icon: ClipboardList },
        ],
      },
      {
        titleKey: 'nav_over_time', icon: Clock,
        children: [
          { titleKey: 'nav_add', href: '/transaction/overtime/add', icon: Plus },
          { titleKey: 'nav_list', href: '/transaction/overtime/list', icon: List },
          { titleKey: 'nav_overtime_calculation', href: '/transaction/overtime/calculation', icon: Calculator },
          { titleKey: 'nav_remove_pending', href: '/transaction/overtime/remove-pending', icon: UserX },
          { titleKey: 'nav_multiple_over_time', href: '/transaction/overtime/multiple', icon: Users },
          { titleKey: 'nav_multiple_over_time_list', href: '/transaction/overtime/multiple-list', icon: ClipboardList },
        ],
      },
      {
        titleKey: 'nav_attendance', icon: CalendarCheck,
        children: [
          { titleKey: 'nav_month_wise', href: '/transaction/attendance/month-wise', icon: CalendarDays },
          { titleKey: 'nav_day_wise', href: '/transaction/attendance/day-wise', icon: CalendarCheck },
          { titleKey: 'nav_employee_wise', href: '/transaction/attendance/employee-wise', icon: Users },
          { titleKey: 'nav_summary', href: '/transaction/attendance/summary', icon: FileBarChart },
          {
            titleKey: 'nav_machine_punch', icon: MonitorSmartphone,
            children: [
              { titleKey: 'nav_employee_wise', href: '/transaction/attendance/machine-punch/employee-wise', icon: Users },
              { titleKey: 'nav_day_wise', href: '/transaction/attendance/machine-punch/day-wise', icon: CalendarCheck },
            ],
          },
          { titleKey: 'nav_multiple_punch', href: '/transaction/attendance/multiple-punch', icon: ClipboardList },
          { titleKey: 'nav_attendance_import', href: '/transaction/attendance/import', icon: FileInput },
          { titleKey: 'nav_week_off_attendance', href: '/transaction/attendance/week-off', icon: CalendarClock },
          { titleKey: 'nav_copy_attendance', href: '/transaction/attendance/copy', icon: Copy },
        ],
      },
      {
        titleKey: 'nav_loan_advance', icon: Banknote,
        children: [
          { titleKey: 'nav_add', href: '/transaction/loan-advance/add', icon: Plus },
          { titleKey: 'nav_list', href: '/transaction/loan-advance/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_other_add_ded', icon: CircleDollarSign,
        children: [
          { titleKey: 'nav_addition', href: '/transaction/other-add-ded/addition', icon: Plus },
          { titleKey: 'nav_deduction', href: '/transaction/other-add-ded/deduction', icon: FileMinus },
          { titleKey: 'nav_add_ded_installment', href: '/transaction/other-add-ded/installment', icon: CreditCard },
          { titleKey: 'nav_day_deduction', href: '/transaction/other-add-ded/day-deduction', icon: CalendarMinus },
          { titleKey: 'nav_add_ded_import', href: '/transaction/other-add-ded/import', icon: FileInput },
          { titleKey: 'nav_deduction_xml_import', href: '/transaction/other-add-ded/deduction-xml-import', icon: FileInput },
        ],
      },
      {
        titleKey: 'nav_pt_tds_deduction', icon: Percent,
        children: [
          { titleKey: 'nav_pt_deduction', href: '/transaction/pt-tds/pt-deduction', icon: BadgePercent },
          { titleKey: 'nav_tds_deduction', href: '/transaction/pt-tds/tds-deduction', icon: Percent },
          { titleKey: 'nav_tds_exemption', href: '/transaction/pt-tds/tds-exemption', icon: ShieldCheck },
        ],
      },
      {
        titleKey: 'nav_salary_pre_process', icon: FileSpreadsheet,
        children: [
          { titleKey: 'nav_sandwich_policy', href: '/transaction/salary-pre-process/sandwich-policy', icon: Sandwich },
          { titleKey: 'nav_incentive_calculation', href: '/transaction/salary-pre-process/incentive-calculation', icon: Calculator },
        ],
      },
      {
        titleKey: 'nav_txn_salary', icon: IndianRupee,
        children: [
          { titleKey: 'nav_salary_calculation', href: '/transaction/salary/calculation', icon: Calculator },
          { titleKey: 'nav_salary_list', href: '/transaction/salary/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_sim_allotment', icon: Smartphone,
        children: [
          { titleKey: 'nav_add', href: '/transaction/sim-allotment/add', icon: Plus },
          { titleKey: 'nav_list', href: '/transaction/sim-allotment/list', icon: List },
          { titleKey: 'nav_mobile_bill_deduction', href: '/transaction/sim-allotment/mobile-bill-deduction', icon: Receipt },
          { titleKey: 'nav_multiple_mob_bill_ded', href: '/transaction/sim-allotment/multiple-mob-bill-ded', icon: FileSpreadsheet },
          { titleKey: 'nav_mob_bill_ded_list', href: '/transaction/sim-allotment/mob-bill-ded-list', icon: List },
        ],
      },
      {
        titleKey: 'nav_more_transaction', icon: Boxes,
        children: [
          {
            titleKey: 'nav_notice_board', icon: Bell,
            children: [
              { titleKey: 'nav_add', href: '/transaction/notice-board/add', icon: Plus },
              { titleKey: 'nav_list', href: '/transaction/notice-board/list', icon: List },
            ],
          },
        ],
      },
    ],
  },
  {
    titleKey: 'nav_reports', icon: BarChart3, roles: ADMINS,
    children: [
      {
        titleKey: 'nav_rpt_attendance', icon: CalendarCheck,
        children: [
          { titleKey: 'nav_month_wise', href: '/reports/attendance/month-wise', icon: CalendarDays },
          { titleKey: 'nav_day_wise', href: '/reports/attendance/day-wise', icon: CalendarCheck },
          { titleKey: 'nav_employee_wise', href: '/reports/attendance/employee-wise', icon: Users },
          { titleKey: 'nav_rpt_machine_punch', href: '/reports/attendance/machine-punch', icon: MonitorSmartphone },
          { titleKey: 'nav_rpt_attendance_sitewise', href: '/reports/attendance/sitewise', icon: MapPin },
          { titleKey: 'nav_rpt_daily_att_camera', href: '/reports/attendance/daily-att-camera', icon: MonitorSmartphone },
          { titleKey: 'nav_rpt_emp_att_camera', href: '/reports/attendance/emp-att-camera', icon: Users },
        ],
      },
      {
        titleKey: 'nav_rpt_salary', icon: IndianRupee,
        children: [
          { titleKey: 'nav_rpt_month_payslip', href: '/reports/salary/month-payslip', icon: FileText },
          { titleKey: 'nav_rpt_emp_payslip', href: '/reports/salary/emp-payslip', icon: Users },
          { titleKey: 'nav_rpt_emp_salary_structure', href: '/reports/salary/emp-salary-structure', icon: Wallet },
          { titleKey: 'nav_rpt_monthly_salary_graph', href: '/reports/salary/monthly-salary-graph', icon: BarChart3 },
          { titleKey: 'nav_rpt_salary_summary', href: '/reports/salary/summary', icon: FileBarChart },
          { titleKey: 'nav_rpt_salary_gross_summary', href: '/reports/salary/gross-summary', icon: FileSpreadsheet },
          { titleKey: 'nav_rpt_short_hours_deduction', href: '/reports/salary/short-hours-deduction', icon: Clock },
          { titleKey: 'nav_rpt_sal_payment_voucher', href: '/reports/salary/payment-voucher', icon: Receipt },
        ],
      },
      {
        titleKey: 'nav_rpt_taxation', icon: Percent,
        children: [
          { titleKey: 'nav_rpt_month_taxation_sheet', href: '/reports/taxation/month-sheet', icon: FileText },
          { titleKey: 'nav_rpt_yearly_taxation_sheet', href: '/reports/taxation/yearly-sheet', icon: CalendarRange },
          { titleKey: 'nav_rpt_emp_taxation_sheet', href: '/reports/taxation/emp-sheet', icon: Users },
        ],
      },
      { titleKey: 'nav_customize_report', href: '/reports/customize', icon: FileBarChart },
      {
        titleKey: 'nav_rpt_employee', icon: Users,
        children: [
          { titleKey: 'nav_rpt_employee_report', href: '/reports/employee/report', icon: FileText },
          { titleKey: 'nav_rpt_branch_wise_employee', href: '/reports/employee/branch-wise', icon: GitBranch },
          { titleKey: 'nav_rpt_branch_transfer_report', href: '/reports/employee/branch-transfer', icon: ArrowRightLeft },
          { titleKey: 'nav_rpt_employee_tree', href: '/reports/employee/tree', icon: Users },
          { titleKey: 'nav_rpt_employee_id_card', href: '/reports/employee/id-card', icon: CreditCard },
          { titleKey: 'nav_rpt_appraisal_due_report', href: '/reports/employee/appraisal-due', icon: CalendarClock },
          { titleKey: 'nav_rpt_appraisal_report', href: '/reports/employee/appraisal', icon: Star },
          { titleKey: 'nav_rpt_promotion_report', href: '/reports/employee/promotion', icon: TrendingUp },
          { titleKey: 'nav_rpt_employee_relative', href: '/reports/employee/relative', icon: Users },
          { titleKey: 'nav_rpt_employee_education', href: '/reports/employee/education', icon: GraduationCap },
          { titleKey: 'nav_rpt_employee_document_det', href: '/reports/employee/document-det', icon: FileText },
          { titleKey: 'nav_rpt_employee_prev_org_det', href: '/reports/employee/prev-org-det', icon: Briefcase },
          { titleKey: 'nav_rpt_employee_tds_regime', href: '/reports/employee/tds-regime', icon: Percent },
        ],
      },
      { titleKey: 'nav_employee_ledger', href: '/reports/employee-ledger', icon: ScrollText },
      { titleKey: 'nav_compliance_register', href: '/reports/compliance-register', icon: Scale },
      { titleKey: 'nav_loan_advance_detail', href: '/reports/loan-advance-detail', icon: Banknote },
      { titleKey: 'nav_rpt_other_add_ded', href: '/reports/other-add-ded', icon: CircleDollarSign },
      { titleKey: 'nav_mobile_bill', href: '/reports/mobile-bill', icon: Smartphone },
      { titleKey: 'nav_rpt_full_final', href: '/reports/full-and-final', icon: FileOutput },
      { titleKey: 'nav_employee_gratuity', href: '/reports/employee-gratuity', icon: Wallet },
      {
        titleKey: 'nav_rpt_statement', icon: FileText,
        children: [
          { titleKey: 'nav_rpt_stmt_on_duty', href: '/reports/statement/on-duty', icon: ClipboardCheck },
          { titleKey: 'nav_rpt_stmt_over_time', href: '/reports/statement/over-time', icon: Clock },
          { titleKey: 'nav_rpt_stmt_exp_reimbursement', href: '/reports/statement/exp-reimbursement', icon: Receipt },
        ],
      },
      {
        titleKey: 'nav_rpt_tds_deduction', icon: Percent,
        children: [
          { titleKey: 'nav_rpt_tds_exemption', href: '/reports/tds-deduction/exemption', icon: ShieldCheck },
          { titleKey: 'nav_rpt_tds_deduction_planning', href: '/reports/tds-deduction/planning', icon: Calculator },
        ],
      },
    ],
  },
  {
    titleKey: 'nav_setting', icon: Settings, roles: ADMINS,
    children: [
      {
        titleKey: 'nav_pf_esic_rate_editor', icon: BadgePercent,
        children: [
          { titleKey: 'nav_add', href: '/setting/pf-esic-rate/add', icon: Plus },
          { titleKey: 'nav_list', href: '/setting/pf-esic-rate/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_pt_rate_setting', icon: Percent,
        children: [
          { titleKey: 'nav_add', href: '/setting/pt-rate/add', icon: Plus },
          { titleKey: 'nav_list', href: '/setting/pt-rate/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_tds_rate_editor', icon: Percent,
        children: [
          { titleKey: 'nav_add', href: '/setting/tds-rate/add', icon: Plus },
          { titleKey: 'nav_list', href: '/setting/tds-rate/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_national_pension_scheme', icon: Landmark,
        children: [
          { titleKey: 'nav_add', href: '/setting/national-pension/add', icon: Plus },
          { titleKey: 'nav_list', href: '/setting/national-pension/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_letter_format', icon: FileType,
        children: [
          { titleKey: 'nav_add', href: '/setting/letter-format/add', icon: Plus },
          { titleKey: 'nav_list', href: '/setting/letter-format/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_report_editor', icon: Notebook,
        children: [
          { titleKey: 'nav_relieving_letter', href: '/setting/report-editor/relieving-letter', icon: FileText },
          { titleKey: 'nav_resignation_letter', href: '/setting/report-editor/resignation-letter', icon: FileText },
          { titleKey: 'nav_terms_and_condition', href: '/setting/report-editor/terms-and-condition', icon: FileCheck },
        ],
      },
      { titleKey: 'nav_bonus_cal_formula', href: '/setting/bonus-cal-formula', icon: Calculator },
      { titleKey: 'nav_deduction_cal_formula', href: '/setting/deduction-cal-formula', icon: Calculator },
      { titleKey: 'nav_labour_welfare_fund', href: '/setting/labour-welfare-fund', icon: Factory },
      { titleKey: 'nav_emp_section_setting', href: '/setting/emp-section-setting', icon: ListChecks },
      {
        titleKey: 'nav_mandatory_field', icon: ShieldCheck,
        children: [
          { titleKey: 'nav_employee_master', href: '/setting/mandatory-field/employee-master', icon: Users },
        ],
      },
      { titleKey: 'nav_loan_advance_setting', href: '/setting/loan-advance-setting', icon: Banknote },
      { titleKey: 'nav_attendance_process_exec', href: '/setting/attendance-process-exec', icon: ChevronsRight },
    ],
  },
  // ─── Employee Search (global) ──────────────────────────────────────────────
  { titleKey: 'nav_employee_search', href: '/employee-search', icon: Search, roles: ADMINS },

  // ─── Admin ─────────────────────────────────────────────────────────────────
  { titleKey: 'company_management', href: '/admin/companies', icon: Building2, roles: ['super_admin'] },
  { titleKey: 'user_management', href: '/admin/users', icon: Users, roles: ['super_admin', 'admin', 'hr_manager'] },

  { titleKey: 'onboarding', href: '/onboarding/list', icon: UserPlus, roles: ADMINS },
  {
    titleKey: 'recruitment', icon: Briefcase, roles: ADMINS,
    children: [
      { titleKey: 'job_postings', href: '/recruitment', icon: FileSearch },
      { titleKey: 'applications', href: '/recruitment/applications', icon: Users },
    ],
  },
  { titleKey: 'shifts', href: '/shifts', icon: Timer, roles: ['employee'] },
  { titleKey: 'reports', href: '/reports', icon: BarChart3, roles: ['employee'] },

  // Manager + self-service — only "My Attendance" is exposed in the sidebar.
  {
    titleKey: 'attendance', icon: Clock, roles: SELF_SERVICE,
    children: [
      { titleKey: 'my_attendance', href: '/attendance/my', icon: CalendarDays },
    ],
  },

  // ─── Settings (everyone) ───────────────────────────────────────────────────
  // ─── Audit & Settings ───────────────────────────────────────────────────────
  { titleKey: 'audit_logs', href: '/admin/audit-logs', icon: Activity, roles: ['super_admin', 'admin'] },
  // { titleKey: 'settings', href: '/admin/settings', icon: Settings },
];

// ══════════════════════════════════════════════════════════════════════════════
// ADMIN Module Navigation (module switcher = "admin")
// ══════════════════════════════════════════════════════════════════════════════
export const adminModuleNav: NavItem[] = [
  { titleKey: 'dashboard', href: '/admin-module', icon: LayoutDashboard },
  {
    titleKey: 'nav_master', icon: Database,
    children: [
      {
        titleKey: 'nav_adm_company', icon: Building2,
        children: [
          { titleKey: 'nav_list', href: '/admin-module/master/company/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_adm_site_plant_project', icon: Building,
        children: [
          { titleKey: 'nav_add', href: '/admin-module/master/site/add', icon: Plus },
          { titleKey: 'nav_list', href: '/admin-module/master/site/list', icon: List },
          { titleKey: 'nav_document', href: '/admin-module/master/site/document', icon: FileText },
        ],
      },
      {
        titleKey: 'nav_adm_site_location', icon: MapPinned,
        children: [
          { titleKey: 'nav_add', href: '/admin-module/master/site-location/add', icon: Plus },
          { titleKey: 'nav_list', href: '/admin-module/master/site-location/list', icon: List },
          { titleKey: 'nav_adm_location_route', href: '/admin-module/master/site-location/location-route', icon: Route },
          { titleKey: 'nav_adm_via_route', href: '/admin-module/master/site-location/via-route', icon: Route },
        ],
      },
      {
        titleKey: 'nav_user', icon: UserCog,
        children: [
          { titleKey: 'nav_add', href: '/admin-module/master/user/add', icon: Plus },
          { titleKey: 'nav_adm_add_user_by_mapping', href: '/admin-module/master/user/add-by-mapping', icon: Link2 },
          { titleKey: 'nav_list', href: '/admin-module/master/user/list', icon: List },
          { titleKey: 'nav_adm_user_rights_summary', href: '/admin-module/master/user/rights-summary', icon: ShieldCheck },
          { titleKey: 'nav_adm_day_auth_by_user', href: '/admin-module/master/user/day-auth-by-user', icon: CalendarCheck },
          { titleKey: 'nav_adm_day_auth_by_entity', href: '/admin-module/master/user/day-auth-by-entity', icon: CalendarCheck },
          { titleKey: 'nav_adm_copy_site_right', href: '/admin-module/master/user/copy-site-right', icon: Copy },
          { titleKey: 'nav_adm_copy_user_site_right', href: '/admin-module/master/user/copy-user-site-right', icon: Copy },
          { titleKey: 'nav_reset_password', href: '/admin-module/master/user/reset-password', icon: KeyRound },
        ],
      },
      { titleKey: 'nav_adm_message_from_mng', href: '/admin-module/master/message-from-mng', icon: MessageSquare },
      {
        titleKey: 'nav_adm_gst', icon: Receipt,
        children: [
          { titleKey: 'nav_adm_gst_master', href: '/admin-module/master/gst/master', icon: Receipt },
        ],
      },
      {
        titleKey: 'nav_adm_state', icon: MapPin,
        children: [
          { titleKey: 'nav_add', href: '/admin-module/master/state/add', icon: Plus },
          { titleKey: 'nav_list', href: '/admin-module/master/state/list', icon: List },
        ],
      },
      {
        titleKey: 'nav_city', icon: MapPin,
        children: [
          { titleKey: 'nav_add', href: '/admin-module/master/city/add', icon: Plus },
          { titleKey: 'nav_list', href: '/admin-module/master/city/list', icon: List },
        ],
      },
      { titleKey: 'nav_adm_item_ledger_update', href: '/admin-module/master/item-ledger-update', icon: Clipboard },
      {
        titleKey: 'nav_adm_sms_alert_on_voucher', icon: BellRing,
        children: [
          { titleKey: 'nav_add', href: '/admin-module/master/sms-alert-voucher/add', icon: Plus },
          { titleKey: 'nav_list', href: '/admin-module/master/sms-alert-voucher/list', icon: List },
        ],
      },
      { titleKey: 'nav_adm_mis_project_setting', href: '/admin-module/master/mis-project-setting', icon: Settings },
      { titleKey: 'nav_adm_front_image_gallery', href: '/admin-module/master/front-image-gallery', icon: ImageIcon },
      { titleKey: 'nav_adm_site_document_master', href: '/admin-module/master/site-document-master', icon: FolderOpen },
      {
        titleKey: 'nav_adm_mobile_app_count', icon: SmartphoneIcon,
        children: [
          { titleKey: 'nav_add', href: '/admin-module/master/mobile-app-count/add', icon: Plus },
          { titleKey: 'nav_list', href: '/admin-module/master/mobile-app-count/list', icon: List },
        ],
      },
    ],
  },
  {
    titleKey: 'nav_reports', icon: BarChart3,
    children: [
      { titleKey: 'nav_adm_login_log', href: '/admin-module/reports/login-log', icon: LogIn },
      { titleKey: 'nav_adm_company_report', href: '/admin-module/reports/company', icon: Building2 },
      { titleKey: 'nav_adm_site_report', href: '/admin-module/reports/site', icon: Building },
      { titleKey: 'nav_adm_location_report', href: '/admin-module/reports/location', icon: MapPinned },
      { titleKey: 'nav_adm_voucher_status_report', href: '/admin-module/reports/voucher-status', icon: FileCheck },
      { titleKey: 'nav_adm_user_work_report', href: '/admin-module/reports/user-work', icon: UsersRound },
      {
        titleKey: 'nav_adm_send_sms', icon: Send,
        children: [
          { titleKey: 'nav_adm_stock_report', href: '/admin-module/reports/send-sms/stock-report', icon: FileBarChart },
          { titleKey: 'nav_adm_machine_insurance_alert', href: '/admin-module/reports/send-sms/machine-insurance-alert', icon: FileWarning },
        ],
      },
      { titleKey: 'nav_adm_site_wise_users_list', href: '/admin-module/reports/site-wise-users', icon: Users },
      { titleKey: 'nav_adm_user_right_summary', href: '/admin-module/reports/user-right-summary', icon: ShieldCheck },
      { titleKey: 'nav_adm_idle_user_report', href: '/admin-module/reports/idle-user', icon: Clock4 },
    ],
  },
];

// ══════════════════════════════════════════════════════════════════════════════
// Module → Navigation map
// ══════════════════════════════════════════════════════════════════════════════
export const moduleNavigationMap: Record<string, NavItem[]> = {
  human_resource: navigationItems,
  admin: adminModuleNav,
};
