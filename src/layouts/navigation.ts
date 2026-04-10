import {
  type LucideIcon,
  LayoutDashboard, Users, Settings, Contact, Building2, Award,
  UserPlus, Clock, ClipboardList, CalendarDays, Palmtree, FileText,
  IndianRupee, Wallet, Briefcase, FileSearch, Star, GraduationCap,
  BookOpen, FolderOpen, PartyPopper, Megaphone, Receipt, Package, LifeBuoy, BarChart3,
  Activity,
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

  // ─── Admin ─────────────────────────────────────────────────────────────────
  { titleKey: 'company_management', href: '/admin/companies', icon: Building2, roles: ['super_admin'] },
  { titleKey: 'user_management', href: '/admin/users', icon: Users, roles: ['super_admin', 'admin', 'hr_manager'] },

  // ─── HR (admin & HR manager) ───────────────────────────────────────────────
  {
    titleKey: 'hr_management', icon: Contact, roles: ADMINS,
    children: [
      { titleKey: 'employees', href: '/employees', icon: Users },
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
  { titleKey: 'expenses', href: '/expenses', icon: Receipt, roles: ALL_COMPANY },
  { titleKey: 'assets', href: '/assets', icon: Package, roles: ALL_COMPANY },
  { titleKey: 'helpdesk', href: '/helpdesk', icon: LifeBuoy, roles: ALL_COMPANY },

  // ─── Settings (everyone) ───────────────────────────────────────────────────
  // ─── Audit & Settings ───────────────────────────────────────────────────────
  { titleKey: 'audit_logs', href: '/admin/audit-logs', icon: Activity, roles: ['super_admin', 'admin'] },
  { titleKey: 'settings', href: '/admin/settings', icon: Settings },
];
