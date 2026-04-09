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
  href?: string;
  icon: LucideIcon;
  children?: NavItem[];
}

export const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Admin Panel',
    icon: LayoutGrid,
    children: [
      { title: 'User Management', href: '/admin/users', icon: Users },
      { title: 'Settings', href: '/admin/settings', icon: Settings },
    ],
  },
  {
    title: 'HR Management',
    icon: Contact,
    children: [
      { title: 'Employees', href: '/employees', icon: Users },
      { title: 'Departments', href: '/departments', icon: Building2 },
      { title: 'Designations', href: '/designations', icon: Award },
    ],
  },
  {
    title: 'Onboarding',
    icon: UserPlus,
    children: [
      { title: 'New Employee KYC', href: '/onboarding/new', icon: IdCard },
      { title: 'Onboarding List', href: '/onboarding/list', icon: Users },
    ],
  },
  {
    title: 'Attendance',
    icon: Clock,
    children: [
      { title: 'Attendance List', href: '/attendance', icon: ClipboardList },
      { title: 'My Attendance', href: '/attendance/my', icon: CalendarDays },
    ],
  },
  {
    title: 'Leave Management',
    icon: Palmtree,
    children: [
      { title: 'Leave Requests', href: '/leaves', icon: FileText },
      { title: 'Apply Leave', href: '/leaves/apply', icon: CalendarDays },
    ],
  },
  {
    title: 'Payroll',
    icon: IndianRupee,
    children: [
      { title: 'Payroll Management', href: '/payroll', icon: Wallet },
    ],
  },
  {
    title: 'Recruitment',
    icon: Briefcase,
    children: [
      { title: 'Job Postings', href: '/recruitment', icon: FileSearch },
      { title: 'Applications', href: '/recruitment/applications', icon: Users },
    ],
  },
  {
    title: 'Performance',
    icon: Star,
    children: [
      { title: 'Reviews & Goals', href: '/performance', icon: Target },
      { title: 'Review Form', href: '/performance/review', icon: ClipboardList },
    ],
  },
  {
    title: 'Training',
    icon: GraduationCap,
    children: [
      { title: 'Programs', href: '/training', icon: BookOpen },
    ],
  },
  {
    title: 'Documents',
    href: '/documents',
    icon: FolderOpen,
  },
  {
    title: 'Holidays',
    href: '/holidays',
    icon: PartyPopper,
  },
  {
    title: 'Announcements',
    href: '/announcements',
    icon: Megaphone,
  },
  {
    title: 'Expenses',
    href: '/expenses',
    icon: Receipt,
  },
  {
    title: 'Assets',
    href: '/assets',
    icon: Package,
  },
  {
    title: 'Helpdesk',
    href: '/helpdesk',
    icon: LifeBuoy,
  },
  {
    title: 'Reports',
    href: '/reports',
    icon: BarChart3,
  },
];
