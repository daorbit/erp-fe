import {
  type LucideIcon,
  LayoutDashboard,
  LayoutGrid,
  Users,
  Settings,
  Contact,
  Building2,
  Award,
  UserPlus,
  IdCard,
  Clock,
  ClipboardList,
  CalendarDays,
  Palmtree,
  FileText,
  IndianRupee,
  Wallet,
  Briefcase,
  FileSearch,
  Star,
  Target,
  GraduationCap,
  BookOpen,
  FolderOpen,
  PartyPopper,
  Megaphone,
  Receipt,
  Package,
  LifeBuoy,
  BarChart3,
} from 'lucide-react';

export interface NavItem {
  title: string;
  titleKey?: string;
  href?: string;
  icon: LucideIcon;
  children?: NavItem[];
}

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    titleKey: 'dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Admin Panel',
    titleKey: 'admin_panel',
    icon: LayoutGrid,
    children: [
      { title: 'User Management', titleKey: 'user_management', href: '/admin/users', icon: Users },
      { title: 'Settings', titleKey: 'settings', href: '/admin/settings', icon: Settings },
    ],
  },
  {
    title: 'HR Management',
    titleKey: 'hr_management',
    icon: Contact,
    children: [
      { title: 'Employees', titleKey: 'employees', href: '/employees', icon: Users },
      { title: 'Departments', titleKey: 'departments', href: '/departments', icon: Building2 },
      { title: 'Designations', titleKey: 'designations', href: '/designations', icon: Award },
    ],
  },
  {
    title: 'Onboarding',
    titleKey: 'onboarding',
    icon: UserPlus,
    children: [
      { title: 'New Employee KYC', titleKey: 'new_employee_kyc', href: '/onboarding/new', icon: IdCard },
      { title: 'Onboarding List', titleKey: 'onboarding_list', href: '/onboarding/list', icon: Users },
    ],
  },
  {
    title: 'Attendance',
    titleKey: 'attendance',
    icon: Clock,
    children: [
      { title: 'Attendance List', titleKey: 'attendance_list', href: '/attendance', icon: ClipboardList },
      { title: 'My Attendance', titleKey: 'my_attendance', href: '/attendance/my', icon: CalendarDays },
    ],
  },
  {
    title: 'Leave Management',
    titleKey: 'leave_management',
    icon: Palmtree,
    children: [
      { title: 'Leave Requests', titleKey: 'leave_requests', href: '/leaves', icon: FileText },
      { title: 'Apply Leave', titleKey: 'apply_leave', href: '/leaves/apply', icon: CalendarDays },
    ],
  },
  {
    title: 'Payroll',
    titleKey: 'payroll',
    icon: IndianRupee,
    children: [
      { title: 'Payroll Management', titleKey: 'payroll_management', href: '/payroll', icon: Wallet },
    ],
  },
  {
    title: 'Recruitment',
    titleKey: 'recruitment',
    icon: Briefcase,
    children: [
      { title: 'Job Postings', titleKey: 'job_postings', href: '/recruitment', icon: FileSearch },
      { title: 'Applications', titleKey: 'applications', href: '/recruitment/applications', icon: Users },
    ],
  },
  {
    title: 'Performance',
    titleKey: 'performance',
    icon: Star,
    children: [
      { title: 'Reviews & Goals', titleKey: 'reviews_goals', href: '/performance', icon: Target },
      { title: 'Review Form', titleKey: 'review_form', href: '/performance/review', icon: ClipboardList },
    ],
  },
  {
    title: 'Training',
    titleKey: 'training',
    icon: GraduationCap,
    children: [
      { title: 'Programs', titleKey: 'training_programs', href: '/training', icon: BookOpen },
    ],
  },
  {
    title: 'Documents',
    titleKey: 'documents',
    href: '/documents',
    icon: FolderOpen,
  },
  {
    title: 'Holidays',
    titleKey: 'holidays',
    href: '/holidays',
    icon: PartyPopper,
  },
  {
    title: 'Announcements',
    titleKey: 'announcements',
    href: '/announcements',
    icon: Megaphone,
  },
  {
    title: 'Expenses',
    titleKey: 'expenses',
    href: '/expenses',
    icon: Receipt,
  },
  {
    title: 'Assets',
    titleKey: 'assets',
    href: '/assets',
    icon: Package,
  },
  {
    title: 'Helpdesk',
    titleKey: 'helpdesk',
    href: '/helpdesk',
    icon: LifeBuoy,
  },
  {
    title: 'Reports',
    titleKey: 'reports',
    href: '/reports',
    icon: BarChart3,
  },
];
