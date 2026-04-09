import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  Bell,
  Globe,
  Maximize2,
  User,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const dispatch = useDispatch();
  const collapsed = useSelector((state: any) => state.ui?.sidebarCollapsed ?? false);
  const themeMode = useSelector((state: any) => state.ui?.themeMode ?? 'light');
  const isDark = themeMode === 'dark';

  const toggleSidebar = () => {
    dispatch({ type: 'ui/toggleSidebar' });
  };

  const toggleTheme = () => {
    dispatch({
      type: 'ui/setThemeMode',
      payload: isDark ? 'light' : 'dark',
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const dateString = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const notifications = [
    {
      id: '1',
      name: 'Rahul Sharma',
      message: 'Uploaded Aadhaar card',
      time: '2 min ago',
    },
    {
      id: '2',
      name: 'Priya Singh',
      message: 'Completed onboarding',
      time: '15 min ago',
    },
    {
      id: '3',
      name: 'System',
      message: '3 KYC approvals pending',
      time: '1 hr ago',
    },
  ];

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex items-center justify-between h-[72px] px-4 md:px-7 border-b backdrop-blur-xl transition-colors',
        'bg-white dark:bg-[#1a1d23]',
        'border-gray-200 dark:border-[#2d3140]',
        'shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_1px_8px_rgba(0,0,0,0.3)]',
      )}
    >
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-10 w-10 rounded-[10px] bg-gray-100 dark:bg-[#22262e] text-gray-500 dark:text-gray-400"
          onClick={onMobileMenuToggle}
        >
          <Menu className="h-[18px] w-[18px]" />
        </Button>

        {/* Desktop sidebar toggle */}
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-10 w-10 rounded-[10px] bg-gray-100 dark:bg-[#22262e] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2e36]"
                onClick={toggleSidebar}
              >
                {collapsed ? (
                  <ChevronRight className="h-[18px] w-[18px]" />
                ) : (
                  <ChevronLeft className="h-[18px] w-[18px]" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle sidebar</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500">
          {dateString}
        </span>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        <TooltipProvider delayDuration={0}>
          {/* Language */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-[10px] bg-gray-100 dark:bg-[#22262e] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2e36]"
              >
                <Globe className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Language</TooltipContent>
          </Tooltip>

          {/* Theme Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  'h-10 w-10 rounded-[10px] bg-gray-100 dark:bg-[#22262e] hover:bg-gray-200 dark:hover:bg-[#2a2e36]',
                  isDark ? 'text-amber-400' : 'text-gray-500',
                )}
                onClick={toggleTheme}
              >
                {isDark ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{isDark ? 'Light Mode' : 'Dark Mode'}</TooltipContent>
          </Tooltip>

          {/* Fullscreen */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hidden sm:flex h-10 w-10 rounded-[10px] bg-gray-100 dark:bg-[#22262e] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2e36]"
                onClick={toggleFullscreen}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Fullscreen</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-10 w-10 rounded-[10px] bg-gray-100 dark:bg-[#22262e] text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2a2e36]"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                3
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0">
            <div className="px-4 py-3 border-b">
              <p className="text-sm font-semibold">Notifications</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className="flex flex-col gap-0.5 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-b-0"
                >
                  <span className="text-[13px] font-semibold">{n.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {n.message} &mdash; {n.time}
                  </span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Divider */}
        <Separator orientation="vertical" className="mx-1 h-8 hidden sm:block" />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5 pr-3 hover:bg-gray-100 dark:hover:bg-[#22262e] transition-colors">
              <Avatar className="h-[38px] w-[38px]">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-violet-500 text-white text-sm">
                  <User className="h-[18px] w-[18px]" />
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block text-left leading-tight">
                <span className="block text-[13px] font-semibold text-gray-800 dark:text-gray-200">
                  Admin User
                </span>
                <span className="block text-[11px] text-gray-400 dark:text-gray-500">
                  Super Admin
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
