import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout, Menu, Avatar, Tooltip, Drawer } from 'antd';
import {
  LogoutOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  LayoutDashboard, LayoutGrid, Users, Settings, Contact, Building2, Award,
  UserPlus, IdCard, Clock, ClipboardList, CalendarDays, Palmtree, FileText,
  IndianRupee, Wallet, Briefcase, FileSearch, Star, Target, GraduationCap,
  BookOpen, FolderOpen, PartyPopper, Megaphone, Receipt, Package, LifeBuoy, BarChart3,
} from 'lucide-react';
import type { MenuProps } from 'antd';
import { navigationItems, type NavItem } from './navigation';

const { Sider } = Layout;

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

function buildMenuItems(items: NavItem[]): MenuProps['items'] {
  return items.map((item) => {
    const Icon = item.icon;
    if (item.children) {
      return {
        key: item.title,
        icon: <Icon size={18} />,
        label: item.title,
        children: item.children.map((child) => {
          const ChildIcon = child.icon;
          return {
            key: child.href || child.title,
            icon: <ChildIcon size={16} />,
            label: child.title,
          };
        }),
      };
    }
    return {
      key: item.href || item.title,
      icon: <Icon size={18} />,
      label: item.title,
    };
  });
}

export default function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  const collapsed = useSelector((state: any) => state.ui?.sidebarCollapsed ?? false);
  const themeMode = useSelector((state: any) => state.ui?.themeMode ?? 'light');
  const isDark = themeMode === 'dark';
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = useMemo(() => buildMenuItems(navigationItems), []);

  const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);

  const openKeys = useMemo(() => {
    const keys: string[] = [];
    navigationItems.forEach((item) => {
      if (item.children?.some((c) => c.href === location.pathname)) {
        keys.push(item.title);
      }
    });
    return keys;
  }, [location.pathname]);

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

      {/* User Card */}
      {!collapsed ? (
        <div className={`shrink-0 p-3 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-200'}`}>
          <div className={`flex items-center gap-2.5 rounded-xl p-3 ${isDark ? 'bg-white/[0.04]' : 'bg-slate-100'}`}>
            <Avatar size={36} icon={<UserOutlined />} className="shrink-0 bg-gradient-to-br from-blue-500 to-violet-500" />
            <div className="flex-1 min-w-0">
              <span className={`block ${isDark ? 'text-white' : 'text-slate-950'} text-[13px] font-semibold truncate`}>Admin User</span>
              <span className={`block ${isDark ? 'text-white/40' : 'text-slate-500'} text-[11px]`}>Super Admin</span>
            </div>
            <button className={`transition-colors ${isDark ? 'text-white/30 hover:text-white/60' : 'text-slate-500 hover:text-slate-700'}`}>
              <LogoutOutlined style={{ fontSize: 14 }} />
            </button>
          </div>
        </div>
      ) : (
        <div className={`shrink-0 py-4 flex justify-center ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-200'}`}>
          <Tooltip title="Admin User" placement="right">
            <Avatar size={36} icon={<UserOutlined />} className="bg-gradient-to-br from-blue-500 to-violet-500" />
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
