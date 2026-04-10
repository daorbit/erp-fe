import { useSelector, useDispatch } from "react-redux";
import {
  Badge,
  Tooltip,
  Button as AntButton,
  Popover,
  Space,
  Input,
} from "antd";
import { localeMap } from '@/config/i18n';
import { useTranslation } from "@/hooks/useTranslation";
import {
  Menu,
  PanelRightOpen,
  PanelLeftOpen,
  Bell,
  Maximize2,
  Sun,
  Moon,
  Search,
} from "lucide-react";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const { t, language } = useTranslation();
  const dispatch = useDispatch();
  const collapsed = useSelector((state: any) => state.ui?.sidebarCollapsed ?? false);
  const themeMode = useSelector((state: any) => state.ui?.themeMode ?? "light");
  const isDark = themeMode === "dark";

  const toggleSidebar = () => dispatch({ type: "ui/toggleSidebar" });
  const toggleTheme = () =>
    dispatch({ type: "ui/setThemeMode", payload: isDark ? "light" : "dark" });
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const locale = localeMap[language] ?? 'en-US';
  const dateString = new Date().toLocaleDateString(locale, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const notifications = [
    { name: "Rahul Sharma", message: "Uploaded Aadhaar card", time: "2 min ago" },
    { name: "Priya Singh", message: "Completed onboarding", time: "15 min ago" },
    { name: "System", message: "3 KYC approvals pending", time: "1 hr ago" },
  ];

  const notificationContent = (
    <div className="w-72">
      <div className="font-semibold text-sm mb-2">{t('notifications')}</div>
      {notifications.map((n, i) => (
        <div
          key={i}
          className="py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 rounded"
        >
          <div className="text-sm font-medium">{n.name}</div>
          <div className="text-xs text-gray-500">{n.message} — {n.time}</div>
        </div>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-14 px-4 md:px-6 bg-white dark:bg-[#111318] border-b border-gray-200 dark:border-gray-800">
      {/* Left */}
      <div className="flex items-center gap-3">
        <AntButton
          type="text"
          icon={<Menu size={18} />}
          onClick={onMobileMenuToggle}
          className="md:hidden"
        />
        <Tooltip title={t('dashboard')}>
          <AntButton
            type="text"
            icon={collapsed ? <PanelLeftOpen size={18} /> : <PanelRightOpen size={18} />}
            onClick={toggleSidebar}
            className="hidden md:inline-flex"
          />
        </Tooltip>
        <span className={`hidden sm:block text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}>
          {dateString}
        </span>
      </div>

      {/* Center - Search */}
      <div className="hidden md:block flex-1 max-w-md mx-4">
        <Input
          prefix={<Search size={14} className="text-gray-400" />}
          placeholder="Search anything..."
          className="!rounded-lg !bg-gray-50 dark:!bg-gray-800/50 !border-gray-200 dark:!border-gray-700"
          allowClear
        />
      </div>

      {/* Right */}
      <Space size={4}>
        <Tooltip title={isDark ? t('light') : t('dark')}>
          <AntButton
            type="text"
            icon={isDark ? <Sun size={18} /> : <Moon size={18} />}
            onClick={toggleTheme}
          />
        </Tooltip>

        <Tooltip title="Fullscreen">
          <AntButton
            type="text"
            icon={<Maximize2 size={18} />}
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex"
          />
        </Tooltip>

        <Popover content={notificationContent} trigger="click" placement="bottomRight">
          <Badge count={3} size="small">
            <AntButton type="text" icon={<Bell size={18} />} />
          </Badge>
        </Popover>
      </Space>
    </header>
  );
}
