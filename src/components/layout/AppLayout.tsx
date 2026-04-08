import React, { useState } from "react";
import {
  Layout,
  Menu,
  Avatar,
  Dropdown,
  Badge,
  Space,
  Typography,
  Tooltip,
  Input,
} from "antd";
import {
  DashboardOutlined,
  UserAddOutlined,
  TeamOutlined,
  SettingOutlined,
  BellOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  UserOutlined,
  IdcardOutlined,
  AppstoreOutlined,
  SearchOutlined,
  SunOutlined,
  MoonOutlined,
  QuestionCircleOutlined,
  ExpandOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
   const navigate = useNavigate();
  const location = useLocation();
  const { mode, setMode, colorTheme } = useTheme();

  const isDark = mode === "dark";

  const sidebarBg = isDark ? "#111318" : "#0f172a";
  const sidebarHoverBg = isDark ? "#1e2330" : "#1e293b";
  const headerBg = isDark ? "#1a1d23" : "#ffffff";
  const headerBorder = isDark ? "#2d3140" : "#e5e7eb";
  const contentBg = isDark ? "#13151a" : "#f5f7fa";

  const menuItems = [
    {
      key: "/admin",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "admin-group",
      icon: <AppstoreOutlined />,
      label: "Admin Panel",
      children: [
        {
          key: "/admin/users",
          icon: <TeamOutlined />,
          label: "User Management",
        },
        {
          key: "/admin/settings",
          icon: <SettingOutlined />,
          label: "Settings",
        },
      ],
    },
    {
      key: "onboarding-group",
      icon: <UserAddOutlined />,
      label: "Onboarding",
      children: [
        {
          key: "/onboarding/new",
          icon: <IdcardOutlined />,
          label: "New Employee KYC",
        },
        {
          key: "/onboarding/list",
          icon: <TeamOutlined />,
          label: "Onboarding List",
        },
      ],
    },
  ];

  const userMenu = {
    items: [
      { key: "profile", icon: <UserOutlined />, label: "My Profile" },
      { key: "settings", icon: <SettingOutlined />, label: "Account Settings" },
      { type: "divider" as const },
      {
        key: "logout",
        icon: <LogoutOutlined />,
        label: "Sign Out",
        danger: true,
      },
    ],
  };

  const notifications = {
    items: [
      {
        key: "1",
        label: (
          <div>
            <Text strong style={{ fontSize: 13 }}>
              Rahul Sharma
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Uploaded Aadhaar card — 2 min ago
            </Text>
          </div>
        ),
      },
      {
        key: "2",
        label: (
          <div>
            <Text strong style={{ fontSize: 13 }}>
              Priya Singh
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              Completed onboarding — 15 min ago
            </Text>
          </div>
        ),
      },
      {
        key: "3",
        label: (
          <div>
            <Text strong style={{ fontSize: 13 }}>
              System
            </Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              3 KYC approvals pending — 1 hr ago
            </Text>
          </div>
        ),
      },
    ],
  };

  return (
    <Layout style={{ minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={270}
        collapsedWidth={72}
        style={{
          background: sidebarBg,
          borderRight: "none",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
          zIndex: 100,
          overflow: "auto",
          boxShadow: "2px 0 12px rgba(0,0,0,0.15)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            height: 72,
            display: "flex",
            alignItems: "center",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0" : "0 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 4px 12px rgba(59,130,246,0.4)",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: 800,
                fontSize: 15,
                letterSpacing: -0.5,
              }}
            >
              HR
            </Text>
          </div>
          {!collapsed && (
            <div>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 17,
                  fontWeight: 700,
                  display: "block",
                  lineHeight: 1.2,
                }}
              >
                ERP-FE
              </Text>
              <Text
                style={{
                  color: "rgba(255,255,255,0.45)",
                  fontSize: 11,
                  fontWeight: 500,
                }}
              >
                HR Management
              </Text>
            </div>
          )}
        </div>

        {/* Navigation */}
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          defaultOpenKeys={["admin-group", "onboarding-group"]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: "transparent",
            borderRight: "none",
            padding: "8px 8px",
          }}
        />

        {/* Sidebar Footer */}
        {!collapsed && (
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "16px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 12,
                padding: "12px",
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <Avatar
                size={36}
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                  boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
                }}
                icon={<UserOutlined />}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Text
                  style={{
                    color: "#fff",
                    fontSize: 13,
                    fontWeight: 600,
                    display: "block",
                  }}
                  ellipsis
                >
                  Admin User
                </Text>
                <Text style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>
                  Super Admin
                </Text>
              </div>
              <Tooltip title="Sign Out">
                <LogoutOutlined
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    cursor: "pointer",
                    fontSize: 14,
                  }}
                />
              </Tooltip>
            </div>
          </div>
        )}
      </Sider>

      <Layout
        style={{
          marginLeft: collapsed ? 72 : 270,
          transition: "all 0.3s cubic-bezier(0.2,0,0,1)",
        }}
      >
        {/* Header */}
        <Header
          style={{
            padding: "0 28px",
            background: headerBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: `1px solid ${headerBorder}`,
            position: "sticky",
            top: 0,
            zIndex: 99,
            height: 72,
            backdropFilter: "blur(12px)",
            boxShadow: isDark
              ? "0 1px 8px rgba(0,0,0,0.3)"
              : "0 1px 8px rgba(0,0,0,0.04)",
          }}
        >
          <Space size={16} align="center">
            <div
              onClick={() => setCollapsed(!collapsed)}
              style={{
                cursor: "pointer",
                width: 40,
                height: 40,
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isDark ? "#22262e" : "#f1f5f9",
                transition: "all 0.2s",
                fontSize: 16,
                color: isDark ? "#9ca3af" : "#64748b",
              }}
            >
              {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            </div>

            <div>
              <Text
                style={{ fontSize: 12, color: isDark ? "#6b7280" : "#94a3b8" }}
              >
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </div>
          </Space>

          <Space size={8} align="center">
            {/* Language */}
            <Tooltip title="Language">
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: isDark ? "#22262e" : "#f1f5f9",
                  color: isDark ? "#9ca3af" : "#64748b",
                  transition: "all 0.2s",
                }}
              >
                <GlobalOutlined style={{ fontSize: 16 }} />
              </div>
            </Tooltip>

            {/* Dark Mode Toggle */}
            <Tooltip title={isDark ? "Light Mode" : "Dark Mode"}>
              <div
                onClick={() => setMode(isDark ? "light" : "dark")}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: isDark ? "#22262e" : "#f1f5f9",
                  color: isDark ? "#fbbf24" : "#64748b",
                  transition: "all 0.2s",
                }}
              >
                {isDark ? (
                  <SunOutlined style={{ fontSize: 16 }} />
                ) : (
                  <MoonOutlined style={{ fontSize: 16 }} />
                )}
              </div>
            </Tooltip>

            {/* Fullscreen */}
            <Tooltip title="Fullscreen">
              <div
                onClick={() => {
                  if (!document.fullscreenElement)
                    document.documentElement.requestFullscreen();
                  else document.exitFullscreen();
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: isDark ? "#22262e" : "#f1f5f9",
                  color: isDark ? "#9ca3af" : "#64748b",
                }}
              >
                <ExpandOutlined style={{ fontSize: 16 }} />
              </div>
            </Tooltip>

            {/* Notifications */}
            <Dropdown
              menu={notifications}
              trigger={["click"]}
              placement="bottomRight"
            >
              <Badge count={3} size="small" offset={[-4, 4]}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    background: isDark ? "#22262e" : "#f1f5f9",
                    color: isDark ? "#9ca3af" : "#64748b",
                  }}
                >
                  <BellOutlined style={{ fontSize: 16 }} />
                </div>
              </Badge>
            </Dropdown>

            {/* Divider */}
            <div
              style={{
                width: 1,
                height: 32,
                background: isDark ? "#2d3140" : "#e5e7eb",
                margin: "0 4px",
              }}
            />

            {/* User Avatar */}
            <Dropdown menu={userMenu} trigger={["click"]}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  cursor: "pointer",
                  padding: "6px 12px 6px 6px",
                  borderRadius: 12,
                  transition: "all 0.2s",
                  background: "transparent",
                }}
              >
                <Avatar
                  size={38}
                  style={{
                    background:
                      "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                    boxShadow: "0 2px 8px rgba(59,130,246,0.25)",
                  }}
                  icon={<UserOutlined />}
                />
                <div style={{ lineHeight: 1.3 }}>
                  <Text
                    strong
                    style={{
                      fontSize: 13,
                      display: "block",
                      color: isDark ? "#e4e6eb" : "#1e293b",
                    }}
                  >
                    Admin User
                  </Text>
                  <Text
                    style={{
                      fontSize: 11,
                      color: isDark ? "#6b7280" : "#94a3b8",
                    }}
                  >
                    Super Admin
                  </Text>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        {/* Content */}
        <Content
          style={{
            margin: 0,
            padding: 28,
            minHeight: "calc(100vh - 72px)",
            background: contentBg,
            transition: "background 0.3s",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
