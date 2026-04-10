import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout, Menu, Avatar, Tooltip, Drawer } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/authSlice';
import {
  LayoutDashboard, LayoutGrid, Users, Settings, Contact, Building2, Award,
  UserPlus, IdCard, Clock, ClipboardList, CalendarDays, Palmtree, FileText,
  IndianRupee, Wallet, Briefcase, FileSearch, Star, Target, GraduationCap,
  BookOpen, FolderOpen, PartyPopper, Megaphone, Receipt, Package, LifeBuoy, BarChart3,
  User, LogOut,
} from 'lucide-react';
import type { MenuProps } from 'antd';
import { navigationItems, type NavItem } from './navigation';
import { useAppSelector } from '@/store';

const { Sider } = Layout;

function filterNavByRole(items: NavItem[], userRole?: string): NavItem[] {
  return items
    .map((item) => {
      if (item.roles && userRole && !item.roles.includes(userRole)) return null;
      if (item.children) {
        const filteredChildren = filterNavByRole(item.children, userRole);
        if (filteredChildren.length === 0) return null;
        return { ...item, children: filteredChildren };
      }
      return item;
    })
    .filter(Boolean) as NavItem[];
}

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

function buildMenuItems(items: NavItem[], t: (key: string) => string): MenuProps['items'] {
  return items.map((item) => {
    const Icon = item.icon;
    if (item.children) {
      return {
        key: item.titleKey,
        icon: <Icon size={18} />,
        label: t(item.titleKey),
        children: item.children.map((child) => {
          const ChildIcon = child.icon;
          return {
            key: child.href || child.titleKey,
            icon: <ChildIcon size={16} />,
            label: t(child.titleKey),
          };
        }),
      };
    }
    return {
      key: item.href || item.titleKey,
      icon: <Icon size={18} />,
      label: t(item.titleKey),
    };
  });
}

export default function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  const collapsed = useSelector((state: any) => state.ui?.sidebarCollapsed ?? false);
  const themeMode = useSelector((state: any) => state.ui?.themeMode ?? 'light');
  const user = useAppSelector((state) => state.auth.user);
  const { t } = useTranslation();
  const isDark = themeMode === 'dark';
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
    onMobileOpenChange?.(false);
  };

  const filteredNav = useMemo(() => filterNavByRole(navigationItems, user?.role), [user?.role]);
  const menuItems = useMemo(() => buildMenuItems(filteredNav, t), [filteredNav, t]);
  const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);

  const openKeys = useMemo(() => {
    const keys: string[] = [];
    filteredNav.forEach((item) => {
      if (item.children?.some((c) => c.href === location.pathname)) {
        keys.push(item.titleKey);
      }
    });
    return keys;
  }, [filteredNav, location.pathname]);

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
      onMobileOpenChange?.(false);
    }
  };

  const siderContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-[64px] ${collapsed ? 'justify-center px-0' : 'px-5 gap-3'} shrink-0 ${isDark ? 'border-b border-white/[0.06]' : 'border-b border-slate-200'}`}>
        <img
          src="/logo.png"
          alt="Logo"
          className={`object-contain rounded-xl ${collapsed ? 'w-9 h-9' : 'w-11 h-11'}`}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        {!collapsed && (
          <div className="min-w-0">
            <span className={`block ${isDark ? 'text-white' : 'text-slate-950'} text-[16px] font-bold leading-tight truncate`}>
              Sheeraj Codeworks
            </span>
            <span className={`block ${isDark ? 'text-white/40' : 'text-slate-500'} text-[11px] font-medium`}>
              HR Management
            </span>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="sidebar-scrollbar-hidden flex-1 overflow-y-auto overflow-x-hidden py-2">
        <Menu
          mode="inline"
          theme={isDark ? 'dark' : 'light'}
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          inlineCollapsed={collapsed}
          style={{ border: 'none', background: 'transparent' }}
        />
      </div>

      {/* User Footer */}
      {!collapsed ? (
        <div className={`shrink-0 p-3 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-200'}`}>
          {/* User info */}
          <div className={`flex items-center gap-3 rounded-xl p-3 ${isDark ? 'bg-white/[0.04]' : 'bg-slate-50'}`}>
            <Avatar size={38} icon={<User size={18} />} className="shrink-0 bg-gradient-to-br from-blue-500 to-violet-500" />
            <div className="flex-1 min-w-0">
              <span className={`block ${isDark ? 'text-white' : 'text-slate-900'} text-[13px] font-semibold truncate leading-tight`}>
                {user?.name || 'Admin User'}
              </span>
              <span className={`block ${isDark ? 'text-white/35' : 'text-slate-400'} text-[11px] truncate mt-0.5`}>
                {user?.email || 'admin@sheeraj.com'}
              </span>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleLogout}
              className={`flex-1 flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-[12px] font-medium transition ${isDark ? 'text-red-400 bg-red-500/[0.08] hover:bg-red-500/[0.15]' : 'text-red-500 bg-red-50 hover:bg-red-100'}`}
            >
              <LogOut size={14} />
              <span>Logout</span>
            </button>
            <Tooltip title={t('settings')} placement="top">
              <button
                onClick={() => {
                  navigate('/admin/settings');
                  onMobileOpenChange?.(false);
                }}
                className={`w-9 h-9 flex items-center justify-center rounded-lg transition ${isDark ? 'text-white/40 bg-white/[0.04] hover:bg-white/[0.08] hover:text-white/60' : 'text-slate-400 bg-slate-100 hover:bg-slate-200 hover:text-slate-600'}`}
              >
                <Settings size={15} />
              </button>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className={`shrink-0 py-3 flex flex-col items-center gap-2 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-200'}`}>
          <Tooltip title={user?.name || 'Admin User'} placement="right">
            <Avatar size={34} icon={<User size={16} />} className="bg-gradient-to-br from-blue-500 to-violet-500" />
          </Tooltip>
          <Tooltip title="Logout" placement="right">
            <button
              onClick={handleLogout}
              className={`rounded-lg p-2 transition ${isDark ? 'text-red-400/60 hover:text-red-400 hover:bg-red-500/[0.1]' : 'text-red-400 hover:text-red-500 hover:bg-red-50'}`}
            >
              <LogOut size={15} />
            </button>
          </Tooltip>
          <Tooltip title={t('settings')} placement="right">
            <button
              onClick={() => {
                navigate('/admin/settings');
                onMobileOpenChange?.(false);
              }}
              className={`rounded-lg p-2 transition ${isDark ? 'text-white/30 hover:text-white/60 hover:bg-white/[0.08]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              <Settings size={15} />
            </button>
          </Tooltip>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <Sider
        collapsed={collapsed}
        width={270}
        collapsedWidth={72}
        className="!fixed inset-y-0 left-0 z-40 hidden md:!block"
        style={{
          background: isDark ? 'var(--sider-bg, #0f172a)' : '#ffffff',
          overflow: 'hidden',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid #e5e7eb',
        }}
        trigger={null}
      >
        {siderContent}
      </Sider>

      {/* Mobile Drawer */}
      <Drawer
        open={mobileOpen}
        onClose={() => onMobileOpenChange?.(false)}
        placement="left"
        width={270}
        closable={false}
        styles={{ body: { padding: 0, background: isDark ? '#0f172a' : '#ffffff' } }}
        className="md:hidden"
      >
        {siderContent}
      </Drawer>
    </>
  );
}
