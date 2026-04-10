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
}

export const navigationItems: NavItem[] = [
  { titleKey: 'dashboard', href: '/admin', icon: LayoutDashboard },
  {
    titleKey: 'admin_panel', icon: LayoutGrid,
    children: [
      { titleKey: 'user_management', href: '/admin/users', icon: Users },
      { titleKey: 'settings', href: '/admin/settings', icon: Settings },
    ],
  },
  {
    titleKey: 'hr_management', icon: Contact,
    children: [
      { titleKey: 'employees', href: '/employees', icon: Users },
      { titleKey: 'departments', href: '/departments', icon: Building2 },
      { titleKey: 'designations', href: '/designations', icon: Award },
    ],
  },
  {
    titleKey: 'onboarding', icon: UserPlus,
    children: [
      { titleKey: 'new_employee_kyc', href: '/onboarding/new', icon: IdCard },
      { titleKey: 'onboarding_list', href: '/onboarding/list', icon: Users },
    ],
  },
  {
    titleKey: 'attendance', icon: Clock,
    children: [
      { titleKey: 'attendance_list', href: '/attendance', icon: ClipboardList },
      { titleKey: 'my_attendance', href: '/attendance/my', icon: CalendarDays },
    ],
  },
  {
    titleKey: 'leave_management', icon: Palmtree,
    children: [
      { titleKey: 'leave_requests', href: '/leaves', icon: FileText },
      { titleKey: 'apply_leave', href: '/leaves/apply', icon: CalendarDays },
    ],
  },
  {
    titleKey: 'payroll', icon: IndianRupee,
    children: [
      { titleKey: 'payroll_management', href: '/payroll', icon: Wallet },
    ],
  },
  {
    titleKey: 'recruitment', icon: Briefcase,
    children: [
      { titleKey: 'job_postings', href: '/recruitment', icon: FileSearch },
      { titleKey: 'applications', href: '/recruitment/applications', icon: Users },
    ],
  },
  {
    titleKey: 'performance', icon: Star,
    children: [
      { titleKey: 'reviews_goals', href: '/performance', icon: Target },
      { titleKey: 'review_form', href: '/performance/review', icon: ClipboardList },
    ],
  },
  {
    titleKey: 'training', icon: GraduationCap,
    children: [
      { titleKey: 'programs', href: '/training', icon: BookOpen },
    ],
  },
  { titleKey: 'documents', href: '/documents', icon: FolderOpen },
  { titleKey: 'holidays', href: '/holidays', icon: PartyPopper },
  { titleKey: 'announcements', href: '/announcements', icon: Megaphone },
  { titleKey: 'expenses', href: '/expenses', icon: Receipt },
  { titleKey: 'assets', href: '/assets', icon: Package },
  { titleKey: 'helpdesk', href: '/helpdesk', icon: LifeBuoy },
  { titleKey: 'reports', href: '/reports', icon: BarChart3 },
];
