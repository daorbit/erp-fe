import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Layout, Menu, Avatar, Tooltip, Drawer, Input } from 'antd';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppDispatch } from '@/store';
import { logout } from '@/store/authSlice';
import { Settings, User, LogOut, Building2, Search as SearchIcon } from 'lucide-react';
import type { MenuProps } from 'antd';
import { navigationItems, type NavItem } from './navigation';
import { useAppSelector } from '@/store';

const { Sider } = Layout;

function filterNavByRole(items: NavItem[], userRole?: string): NavItem[] {
  return items
    .map((item) => {
      // If item has role restriction, hide it when role is unknown or not in the list
      if (item.roles && (!userRole || !item.roles.includes(userRole))) return null;
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

function buildMenuItems(items: NavItem[], t: (key: string) => string, depth = 0): MenuProps['items'] {
  const iconSize = depth === 0 ? 18 : depth === 1 ? 16 : 14;
  return items.map((item) => {
    const Icon = item.icon;
    if (item.children && item.children.length > 0) {
      return {
        key: item.titleKey,
        icon: <Icon size={iconSize} />,
        label: t(item.titleKey),
        children: buildMenuItems(item.children, t, depth + 1),
      };
    }
    return {
      key: item.href || item.titleKey,
      icon: <Icon size={iconSize} />,
      label: t(item.titleKey),
    };
  });
}

// Walk the tree; return the titleKeys of every ancestor whose subtree contains `pathname`.
function computeOpenKeys(items: NavItem[], pathname: string): string[] {
  const open: string[] = [];
  const walk = (nodes: NavItem[]): boolean => {
    let hit = false;
    for (const node of nodes) {
      if (node.href === pathname) { hit = true; continue; }
      if (node.children && walk(node.children)) {
        open.push(node.titleKey);
        hit = true;
      }
    }
    return hit;
  };
  walk(items);
  return open;
}

/**
 * Filter the nav tree by case-insensitive search against translated titles.
 * Keep a node if it matches OR any descendant matches; descendant pruning
 * keeps the rendered subtree compact while preserving parent context.
 */
function filterNavBySearch(items: NavItem[], query: string, t: (key: string) => string): NavItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;

  const recurse = (nodes: NavItem[]): NavItem[] => {
    const out: NavItem[] = [];
    for (const node of nodes) {
      const title = t(node.titleKey).toLowerCase();
      const selfMatches = title.includes(q);
      if (node.children && node.children.length > 0) {
        const childMatches = recurse(node.children);
        if (selfMatches || childMatches.length > 0) {
          // If the node itself matched, keep all its children so the user can
          // see the full subtree. Otherwise keep only the matching descendants.
          out.push({ ...node, children: selfMatches ? node.children : childMatches });
        }
      } else if (selfMatches) {
        out.push(node);
      }
    }
    return out;
  };
  return recurse(items);
}

/**
 * Collect every parent titleKey in the tree — used as openKeys when searching
 * so the user immediately sees all matching descendants without manually
 * expanding submenus.
 */
function collectAllParentKeys(items: NavItem[]): string[] {
  const keys: string[] = [];
  const walk = (nodes: NavItem[]) => {
    for (const node of nodes) {
      if (node.children && node.children.length > 0) {
        keys.push(node.titleKey);
        walk(node.children);
      }
    }
  };
  walk(items);
  return keys;
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

  const [searchQuery, setSearchQuery] = useState('');

  const roleFilteredNav = useMemo(
    () => filterNavByRole(navigationItems, user?.role),
    [user?.role],
  );
  // When searching, narrow the role-filtered nav further by the query.
  const visibleNav = useMemo(
    () => filterNavBySearch(roleFilteredNav, searchQuery, t),
    [roleFilteredNav, searchQuery, t],
  );
  const menuItems = useMemo(() => buildMenuItems(visibleNav, t), [visibleNav, t]);
  const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);

  // While searching, expand every parent so the matches are visible.
  // When not searching, fall back to the standard "open ancestors of current
  // route" behaviour.
  const openKeys = useMemo(
    () => (searchQuery.trim()
      ? collectAllParentKeys(visibleNav)
      : computeOpenKeys(visibleNav, location.pathname)),
    [visibleNav, searchQuery, location.pathname],
  );

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key.startsWith('/')) {
      navigate(key);
      onMobileOpenChange?.(false);
    }
  };

  const siderContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-12 ${collapsed ? 'justify-center px-0' : 'px-4 gap-2.5'} shrink-0 ${isDark ? 'border-b border-white/[0.06]' : 'border-b border-slate-200'}`}>
        <Avatar
          shape="square"
          size={collapsed ? 28 : 32}
          src={(typeof user?.company === 'object' && user?.company?.logo) || '/logo.png'}
          icon={<Building2 size={16} />}
          className="shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600"
        />
        {!collapsed && (
          <div className="min-w-0">
            <span className={`block ${isDark ? 'text-white' : 'text-slate-900'} text-[13px] font-bold leading-tight truncate`}>
              {user?.role === 'super_admin'
                ? 'ERP Platform'
                : (typeof user?.company === 'object' && user?.company?.name) || 'ERP'}
            </span>
            <span className={`block ${isDark ? 'text-white/40' : 'text-slate-400'} text-[10px] font-medium`}>
              {user?.role === 'super_admin' ? 'Platform Admin' : 'HR Management'}
            </span>
          </div>
        )}
      </div>

      {/* Search — hidden when sidebar is collapsed because there's no room */}
      {!collapsed && (
        <div className={`shrink-0 px-3 pt-3 pb-2 ${isDark ? 'border-b border-white/[0.04]' : 'border-b border-slate-100'}`}>
          <Input
            size="small"
            placeholder="Search..."
            allowClear
            prefix={<SearchIcon size={14} className={isDark ? 'text-white/40' : 'text-slate-400'} />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Menu */}
      <div className="sidebar-scrollbar-hidden flex-1 overflow-y-auto overflow-x-hidden py-2">
        <Menu
          // Re-mount the menu whenever the search query changes so
          // `defaultOpenKeys` is re-applied (it's only honoured on mount).
          // This makes search results auto-expand without us needing to flip
          // to controlled openKeys (which would break user click-to-collapse).
          key={searchQuery || 'idle'}
          mode="inline"
          theme={isDark ? 'dark' : 'light'}
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          inlineCollapsed={collapsed}
          style={{ border: 'none', background: 'transparent' }}
        />
        {searchQuery.trim() && menuItems && menuItems.length === 0 && (
          <div className={`px-4 py-3 text-xs ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            No menu items match “{searchQuery}”.
          </div>
        )}
      </div>

      {/* User Footer */}
      {!collapsed ? (
        <div className={`shrink-0 p-3 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-200'}`}>
          {/* User info */}
          <div className={`flex items-center gap-3 rounded-xl p-3 ${isDark ? 'bg-white/[0.04]' : 'bg-slate-50 border border-slate-200'}`}>
            <Avatar size={38} src={user?.avatar} icon={<User size={18} />} className="shrink-0 bg-gradient-to-br from-blue-500 to-violet-500" />
            <div className="flex-1 min-w-0">
              <span className={`block ${isDark ? 'text-white' : 'text-slate-900'} text-[13px] font-semibold truncate leading-tight`}>
                {user ? `${user.firstName} ${user.lastName}` : 'User'}
              </span>
              <span className={`block ${isDark ? 'text-white/35' : 'text-slate-400'} text-[11px] truncate mt-0.5`}>
                {user?.email || ''}
              </span>
            </div>
          </div>

          {/* Actions row */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={handleLogout}
              className={`flex-1 flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-[12px] font-medium transition ${isDark ? 'text-red-400/70 bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400' : 'text-red-500 bg-red-50/50 border border-red-200 hover:bg-red-50 hover:text-red-600'}`}
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
                className={`w-10 h-10 flex items-center justify-center rounded-xl transition ${isDark ? 'text-white/40 bg-white/[0.04] hover:bg-white/[0.07] hover:text-white/60' : 'text-slate-400 bg-slate-50 border border-slate-200 hover:bg-slate-100 hover:text-slate-600'}`}
              >
                <Settings size={15} />
              </button>
            </Tooltip>
          </div>
        </div>
      ) : (
        <div className={`shrink-0 py-3 flex flex-col items-center gap-2 ${isDark ? 'border-t border-white/[0.06]' : 'border-t border-slate-200'}`}>
          <Tooltip title={user ? `${user.firstName} ${user.lastName}` : 'User'} placement="right">
            <Avatar size={34} src={user?.avatar} icon={<User size={16} />} className="bg-gradient-to-br from-blue-500 to-violet-500" />
          </Tooltip>
          <Tooltip title="Logout" placement="right">
            <button
              onClick={handleLogout}
              className={`rounded-xl p-2 transition ${isDark ? 'text-red-400/70 hover:text-red-400 hover:bg-red-500/10' : 'text-red-500 border border-red-200 hover:text-red-600 hover:bg-red-50'}`}
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
              className={`rounded-xl p-2 transition ${isDark ? 'text-white/35 hover:text-white/60 hover:bg-white/[0.06]' : 'text-slate-400 border border-slate-200 hover:text-slate-600 hover:bg-slate-50'}`}
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
          background: isDark ? '#0a0a0c' : '#ffffff',
          overflow: 'hidden',
          borderRight: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid #e5e7eb',
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
        styles={{ body: { padding: 0, background: isDark ? '#09090b' : '#ffffff' } }}
        className="md:hidden"
      >
        {siderContent}
      </Drawer>
    </>
  );
}
