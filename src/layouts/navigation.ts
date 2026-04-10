import {
  type LucideIcon,
  LayoutDashboard, LayoutGrid, Users, Settings, Contact, Building2, Award,
  UserPlus, IdCard, Clock, ClipboardList, CalendarDays, Palmtree, FileText,
  IndianRupee, Wallet, Briefcase, FileSearch, Star, Target, GraduationCap,
  BookOpen, FolderOpen, PartyPopper, Megaphone, Receipt, Package, LifeBuoy, BarChart3,
} from 'lucide-react';

export interface NavItem {
  titleKey: string;
  href?: string;
  icon: LucideIcon;
  children?: NavItem[];
  roles?: string[];
}

// Role groups for navigation visibility
const ADMINS = ['admin', 'hr_manager'];
const MANAGEMENT = ['admin', 'hr_manager', 'manager'];
const ALL_COMPANY = ['admin', 'hr_manager', 'manager', 'employee'];

export const navigationItems: NavItem[] = [
  // Everyone sees dashboard
  { titleKey: 'dashboard', href: '/admin', icon: LayoutDashboard },

  // Admin Panel
  {
    titleKey: 'admin_panel', icon: LayoutGrid,
    children: [
      { titleKey: 'company_management', href: '/admin/companies', icon: Building2, roles: ['super_admin'] },
      { titleKey: 'user_management', href: '/admin/users', icon: Users, roles: ['super_admin', ...ADMINS] },
      { titleKey: 'settings', href: '/admin/settings', icon: Settings, roles: ADMINS },
    ],
  },

  // HR Management — admin & HR only
  {
    titleKey: 'hr_management', icon: Contact, roles: ADMINS,
    children: [
      { titleKey: 'employees', href: '/employees', icon: Users },
      { titleKey: 'departments', href: '/departments', icon: Building2 },
      { titleKey: 'designations', href: '/designations', icon: Award },
    ],
  },

  // Onboarding — admin & HR only
  {
    titleKey: 'onboarding', icon: UserPlus, roles: ADMINS,
    children: [
      { titleKey: 'new_employee_kyc', href: '/onboarding/new', icon: IdCard },
      { titleKey: 'onboarding_list', href: '/onboarding/list', icon: Users },
    ],
  },

  // Attendance — managers+ see list, everyone sees own
  {
    titleKey: 'attendance', icon: Clock, roles: ALL_COMPANY,
    children: [
      { titleKey: 'attendance_list', href: '/attendance', icon: ClipboardList, roles: MANAGEMENT },
      { titleKey: 'my_attendance', href: '/attendance/my', icon: CalendarDays },
    ],
  },

  // Leaves — managers+ see requests, everyone can apply
  {
    titleKey: 'leave_management', icon: Palmtree, roles: ALL_COMPANY,
    children: [
      { titleKey: 'leave_requests', href: '/leaves', icon: FileText, roles: MANAGEMENT },
      { titleKey: 'apply_leave', href: '/leaves/apply', icon: CalendarDays },
    ],
  },

  // Payroll — admin & HR only
  {
    titleKey: 'payroll', icon: IndianRupee, roles: ADMINS,
    children: [
      { titleKey: 'payroll_management', href: '/payroll', icon: Wallet },
    ],
  },

  // Recruitment — admin & HR only
  {
    titleKey: 'recruitment', icon: Briefcase, roles: ADMINS,
    children: [
      { titleKey: 'job_postings', href: '/recruitment', icon: FileSearch },
      { titleKey: 'applications', href: '/recruitment/applications', icon: Users },
    ],
  },

  // Performance — managers+ see all, employees see own
  {
    titleKey: 'performance', icon: Star, roles: ALL_COMPANY,
    children: [
      { titleKey: 'reviews_goals', href: '/performance', icon: Target },
      { titleKey: 'review_form', href: '/performance/review', icon: ClipboardList },
    ],
  },

  // Training — everyone can see
  {
    titleKey: 'training', icon: GraduationCap, roles: ALL_COMPANY,
    children: [
      { titleKey: 'programs', href: '/training', icon: BookOpen },
    ],
  },

  // Self-service modules — everyone
  { titleKey: 'documents', href: '/documents', icon: FolderOpen, roles: ALL_COMPANY },
  { titleKey: 'holidays', href: '/holidays', icon: PartyPopper, roles: ALL_COMPANY },
  { titleKey: 'announcements', href: '/announcements', icon: Megaphone, roles: ALL_COMPANY },
  { titleKey: 'expenses', href: '/expenses', icon: Receipt, roles: ALL_COMPANY },
  { titleKey: 'assets', href: '/assets', icon: Package, roles: ALL_COMPANY },
  { titleKey: 'helpdesk', href: '/helpdesk', icon: LifeBuoy, roles: ALL_COMPANY },

  // Reports — admin & HR only
  { titleKey: 'reports', href: '/reports', icon: BarChart3, roles: ADMINS },
];
