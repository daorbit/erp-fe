import React, { useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ChevronDown, LogOut, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { navigationItems, type NavItem } from './navigation';

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export default function Sidebar({ mobileOpen, onMobileOpenChange }: SidebarProps) {
  const collapsed = useSelector((state: any) => state.ui?.sidebarCollapsed ?? false);
  const location = useLocation();

  const sidebarContent = (
    <SidebarInner collapsed={collapsed} pathname={location.pathname} />
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex-col bg-[#0f172a] dark:bg-[#111318] shadow-[2px_0_12px_rgba(0,0,0,0.15)] transition-all duration-300 hidden md:flex',
          collapsed ? 'w-[72px]' : 'w-[270px]',
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar via Sheet */}
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent side="left" className="w-[270px] p-0 bg-[#0f172a] dark:bg-[#111318] border-r-0">
          <SidebarInner collapsed={false} pathname={location.pathname} />
        </SheetContent>
      </Sheet>
    </>
  );
}

function SidebarInner({
  collapsed,
  pathname,
}: {
  collapsed: boolean;
  pathname: string;
}) {
  const navigate = useNavigate();

  // Determine which groups should be open by default based on active route
  const defaultOpenGroups = useMemo(() => {
    const open = new Set<string>();
    navigationItems.forEach((item) => {
      if (item.children) {
        const hasActiveChild = item.children.some((child) => child.href === pathname);
        if (hasActiveChild) {
          open.add(item.title);
        }
      }
    });
    return open;
  }, [pathname]);

  const [openGroups, setOpenGroups] = useState<Set<string>>(() => defaultOpenGroups);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(title)) {
        next.delete(title);
      } else {
        next.add(title);
      }
      return next;
    });
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href;
  };

  const handleNavClick = (item: NavItem) => {
    if (item.href) {
      navigate(item.href);
    } else if (item.children) {
      toggleGroup(item.title);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Logo section */}
      <div
        className={cn(
          'flex items-center h-[72px] border-b border-white/[0.06] shrink-0',
          collapsed ? 'justify-center px-0' : 'justify-start px-5 gap-3',
        )}
      >
        <img
          src="/logo.png"
          alt="Sheeraj Codeworks"
          className={cn(
            'object-contain rounded-[14px]',
            collapsed ? 'w-10 h-10' : 'w-12 h-12',
          )}
        />
        {!collapsed && (
          <div className="min-w-0">
            <span className="block text-white text-[17px] font-bold leading-tight truncate">
              Sheeraj Codeworks
            </span>
            <span className="block text-white/45 text-[11px] font-medium">
              HR Management
            </span>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden py-2 px-2">
        <TooltipProvider delayDuration={0}>
          <ul className="flex flex-col gap-0.5">
            {navigationItems.map((item) => (
              <li key={item.title}>
                {item.children ? (
                  <NavGroup
                    item={item}
                    collapsed={collapsed}
                    isOpen={openGroups.has(item.title)}
                    onToggle={() => toggleGroup(item.title)}
                    pathname={pathname}
                    onNavigate={navigate}
                  />
                ) : (
                  <NavLink
                    item={item}
                    collapsed={collapsed}
                    active={isActive(item.href)}
                    onClick={() => handleNavClick(item)}
                  />
                )}
              </li>
            ))}
          </ul>
        </TooltipProvider>
      </nav>

      {/* User info at bottom */}
      {!collapsed && (
        <div className="shrink-0 p-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-2.5 bg-white/[0.04] rounded-xl p-3">
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-sm">
                <User className="h-[18px] w-[18px]" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <span className="block text-white text-[13px] font-semibold truncate">
                Admin User
              </span>
              <span className="block text-white/40 text-[11px]">
                Super Admin
              </span>
            </div>
            <button
              className="text-white/30 hover:text-white/60 transition-colors"
              aria-label="Sign Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Collapsed user avatar */}
      {collapsed && (
        <div className="shrink-0 py-4 flex justify-center border-t border-white/[0.06]">
          <Tooltip>
            <TooltipTrigger asChild>
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-sm">
                  <User className="h-[18px] w-[18px]" />
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent side="right">Admin User</TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
}

function NavLink({
  item,
  collapsed,
  active,
  onClick,
}: {
  item: NavItem;
  collapsed: boolean;
  active: boolean;
  onClick: () => void;
}) {
  const Icon = item.icon;

  const button = (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center w-full rounded-lg text-sm font-medium transition-colors',
        collapsed ? 'justify-center h-10 w-10 mx-auto' : 'gap-3 px-3 py-2.5',
        active
          ? 'bg-white/10 text-white'
          : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80',
      )}
    >
      <Icon className="h-5 w-5 shrink-0" />
      {!collapsed && <span className="truncate">{item.title}</span>}
    </button>
  );

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return button;
}

function NavGroup({
  item,
  collapsed,
  isOpen,
  onToggle,
  pathname,
  onNavigate,
}: {
  item: NavItem;
  collapsed: boolean;
  isOpen: boolean;
  onToggle: () => void;
  pathname: string;
  onNavigate: (path: string) => void;
}) {
  const Icon = item.icon;
  const hasActiveChild = item.children?.some((child) => child.href === pathname) ?? false;

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={onToggle}
            className={cn(
              'flex items-center justify-center h-10 w-10 mx-auto rounded-lg transition-colors',
              hasActiveChild
                ? 'bg-white/10 text-white'
                : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80',
            )}
          >
            <Icon className="h-5 w-5 shrink-0" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          'flex items-center w-full gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
          hasActiveChild
            ? 'text-white'
            : 'text-white/60 hover:bg-white/[0.06] hover:text-white/80',
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="flex-1 text-left truncate">{item.title}</span>
        <ChevronDown
          className={cn(
            'h-4 w-4 shrink-0 transition-transform duration-200',
            isOpen && 'rotate-180',
          )}
        />
      </button>

      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <ul className="ml-4 pl-4 border-l border-white/[0.08] py-1 space-y-0.5">
          {item.children?.map((child) => {
            const ChildIcon = child.icon;
            const childActive = child.href === pathname;

            return (
              <li key={child.title}>
                <button
                  onClick={() => child.href && onNavigate(child.href)}
                  className={cn(
                    'flex items-center w-full gap-3 px-3 py-2 rounded-lg text-sm transition-colors',
                    childActive
                      ? 'bg-white/10 text-white font-medium'
                      : 'text-white/50 hover:bg-white/[0.06] hover:text-white/70',
                  )}
                >
                  <ChildIcon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{child.title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
