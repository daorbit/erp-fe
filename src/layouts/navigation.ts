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

// Roles that belong to a company (excludes platform admin)
const COMPANY_ROLES = ['admin', 'hr_manager', 'manager', 'employee'];

export const navigationItems: NavItem[] = [
  { titleKey: 'dashboard', href: '/admin', icon: LayoutDashboard },
  {
    titleKey: 'admin_panel', icon: LayoutGrid,
    children: [
      { titleKey: 'company_management', href: '/admin/companies', icon: Building2, roles: ['super_admin'] },
      { titleKey: 'user_management', href: '/admin/users', icon: Users },
      { titleKey: 'settings', href: '/admin/settings', icon: Settings, roles: COMPANY_ROLES },
    ],
  },
  {
    titleKey: 'hr_management', icon: Contact, roles: COMPANY_ROLES,
    children: [
      { titleKey: 'employees', href: '/employees', icon: Users },
      { titleKey: 'departments', href: '/departments', icon: Building2 },
      { titleKey: 'designations', href: '/designations', icon: Award },
    ],
  },
  {
    titleKey: 'onboarding', icon: UserPlus, roles: COMPANY_ROLES,
    children: [
      { titleKey: 'new_employee_kyc', href: '/onboarding/new', icon: IdCard },
      { titleKey: 'onboarding_list', href: '/onboarding/list', icon: Users },
    ],
  },
  {
    titleKey: 'attendance', icon: Clock, roles: COMPANY_ROLES,
    children: [
      { titleKey: 'attendance_list', href: '/attendance', icon: ClipboardList },
      { titleKey: 'my_attendance', href: '/attendance/my', icon: CalendarDays },
    ],
  },
  {
    titleKey: 'leave_management', icon: Palmtree, roles: COMPANY_ROLES,
    children: [
      { titleKey: 'leave_requests', href: '/leaves', icon: FileText },
      { titleKey: 'apply_leave', href: '/leaves/apply', icon: CalendarDays },
    ],
  },
  {
    titleKey: 'payroll', icon: IndianRupee, roles: COMPANY_ROLES,
    children: [
      { titleKey: 'payroll_management', href: '/payroll', icon: Wallet },
    ],
  },
  {
    titleKey: 'recruitment', icon: Briefcase, roles: COMPANY_ROLES,
    children: [
      { titleKey: 'job_postings', href: '/recruitment', icon: FileSearch },
      { titleKey: 'applications', href: '/recruitment/applications', icon: Users },
    ],
  },
  {
    titleKey: 'performance', icon: Star, roles: COMPANY_ROLES,
    children: [
      { titleKey: 'reviews_goals', href: '/performance', icon: Target },
      { titleKey: 'review_form', href: '/performance/review', icon: ClipboardList },
    ],
  },
  {
    titleKey: 'training', icon: GraduationCap, roles: COMPANY_ROLES,
    children: [
      { titleKey: 'programs', href: '/training', icon: BookOpen },
    ],
  },
  { titleKey: 'documents', href: '/documents', icon: FolderOpen, roles: COMPANY_ROLES },
  { titleKey: 'holidays', href: '/holidays', icon: PartyPopper, roles: COMPANY_ROLES },
  { titleKey: 'announcements', href: '/announcements', icon: Megaphone, roles: COMPANY_ROLES },
  { titleKey: 'expenses', href: '/expenses', icon: Receipt, roles: COMPANY_ROLES },
  { titleKey: 'assets', href: '/assets', icon: Package, roles: COMPANY_ROLES },
  { titleKey: 'helpdesk', href: '/helpdesk', icon: LifeBuoy, roles: COMPANY_ROLES },
  { titleKey: 'reports', href: '/reports', icon: BarChart3, roles: COMPANY_ROLES },
];
