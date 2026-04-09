import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Badge,
  Avatar,
  Dropdown,
  Tooltip,
  Button as AntButton,
  Popover,
  Space,
} from "antd";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  GlobalOutlined,
  FullscreenOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  SunOutlined,
  MoonOutlined,
  MenuOutlined,
} from "@ant-design/icons";

interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

export default function Header({ onMobileMenuToggle }: HeaderProps) {
  const dispatch = useDispatch();
  const collapsed = useSelector(
    (state: any) => state.ui?.sidebarCollapsed ?? false,
  );
  const themeMode = useSelector((state: any) => state.ui?.themeMode ?? "light");
  const isDark = themeMode === "dark";

  const toggleSidebar = () => dispatch({ type: "ui/toggleSidebar" });
  const toggleTheme = () =>
    dispatch({ type: "ui/setThemeMode", payload: isDark ? "light" : "dark" });
  const toggleFullscreen = () => {
    if (!document.fullscreenElement)
      document.documentElement.requestFullscreen();
    else document.exitFullscreen();
  };

  const dateString = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const notifications = [
    {
      name: "Rahul Sharma",
      message: "Uploaded Aadhaar card",
      time: "2 min ago",
    },
    {
      name: "Priya Singh",
      message: "Completed onboarding",
      time: "15 min ago",
    },
    { name: "System", message: "3 KYC approvals pending", time: "1 hr ago" },
  ];

  const notificationContent = (
    <div className="w-72">
      <div className="font-semibold text-sm mb-2">Notifications</div>
      {notifications.map((n, i) => (
        <div
          key={i}
          className="py-2 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 rounded"
        >
          <div className="text-sm font-medium">{n.name}</div>
          <div className="text-xs text-gray-500">
            {n.message} — {n.time}
          </div>
        </div>
      ))}
    </div>
  );

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "My Profile" },
    { key: "settings", icon: <SettingOutlined />, label: "Account Settings" },
    { type: "divider" as const },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Sign Out",
      danger: true,
    },
  ];

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6"
    >
      {/* Left */}
      <div className="flex items-center gap-3">
        <AntButton
          type="text"
          icon={<MenuOutlined />}
          onClick={onMobileMenuToggle}
          className="md:hidden"
        />
        <Tooltip title="Toggle sidebar">
          <AntButton
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleSidebar}
            className="hidden md:inline-flex"
          />
        </Tooltip>
        <span
          className={`hidden sm:block text-xs ${isDark ? "text-gray-500" : "text-gray-400"}`}
        >
          {dateString}
        </span>
      </div>

      {/* Right */}
      <Space size={4}>
        <Tooltip title="Language">
          <AntButton type="text" icon={<GlobalOutlined />} />
        </Tooltip>

        <Tooltip title="Fullscreen">
          <AntButton
            type="text"
            icon={<FullscreenOutlined />}
            onClick={toggleFullscreen}
            className="hidden sm:inline-flex"
          />
        </Tooltip>

        <Popover
          content={notificationContent}
          trigger="click"
          placement="bottomRight"
        >
          <Badge count={3} size="small">
            <AntButton type="text" icon={<BellOutlined />} />
          </Badge>
        </Popover>
      </Space>
    </header>
  );
}
