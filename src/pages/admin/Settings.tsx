import React, { useState } from 'react';
import {
  Card, Tabs, Input, Select, Switch, Button, Typography, Radio, Divider, Space,
} from 'antd';
import {
  SaveOutlined,
  CheckOutlined,
  SunOutlined,
  MoonOutlined,
  BgColorsOutlined,
  BankOutlined,
  BellOutlined,
  LockOutlined,
  FontSizeOutlined,
} from '@ant-design/icons';
import { useAppDispatch, useAppSelector } from '@/store';
import { setThemeMode, setThemeColor, setFontFamily } from '@/store/uiSlice';
import { colorPalettes, fontFamilies, type ThemeColor } from '@/config/theme';
import { App } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

const notificationItems = [
  { id: 'onboarding', label: 'Email notifications for new onboarding', desc: 'Receive email when a new employee starts KYC', defaultOn: true },
  { id: 'kyc-complete', label: 'KYC completion alerts', desc: 'Get notified when KYC is fully completed', defaultOn: true },
  { id: 'weekly-report', label: 'Weekly summary report', desc: 'Receive weekly HR summary via email', defaultOn: false },
  { id: 'doc-expiry', label: 'Document expiry reminders', desc: 'Alert when employee documents are about to expire', defaultOn: true },
];

const Settings: React.FC = () => {
  const dispatch = useAppDispatch();
  const { message } = App.useApp();
  const mode = useAppSelector((s) => s.ui.themeMode);
  const colorTheme = useAppSelector((s) => s.ui.themeColor) as ThemeColor;
  const fontFamily = useAppSelector((s) => s.ui.fontFamily);

  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationItems.map((n) => [n.id, n.defaultOn])),
  );

  const tabItems = [
    {
      key: 'appearance',
      label: (
        <span className="flex items-center gap-2">
          <BgColorsOutlined /> Appearance
        </span>
      ),
      children: (
        <div className="space-y-6">
          {/* Display Mode */}
          <Card size="small" title="Display Mode" className="!rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(['light', 'dark'] as const).map((m) => {
                const isSelected = mode === m;
                return (
                  <button
                    key={m}
                    onClick={() => dispatch(setThemeMode(m))}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${
                      isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className={`rounded-lg border p-3 mb-3 ${
                      m === 'dark' ? 'bg-[#1a1d23] border-[#2d3140]' : 'bg-[#f8fafc] border-[#e2e8f0]'
                    }`}>
                      <div className="flex gap-1.5 mb-2">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <div className="w-2 h-2 rounded-full bg-yellow-500" />
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                      </div>
                      <div className="flex gap-2">
                        <div className={`w-10 h-10 rounded-md ${m === 'dark' ? 'bg-[#22262e]' : 'bg-gray-200'}`} />
                        <div className="flex-1 space-y-1.5">
                          <div className={`h-1.5 rounded-full w-3/4 ${m === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
                          <div className={`h-1.5 rounded-full w-1/2 ${m === 'dark' ? 'bg-gray-700' : 'bg-gray-300'}`} />
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <CheckOutlined className="text-white text-[10px]" />
                      </div>
                    )}
                    <div className="mb-1">{m === 'dark' ? <MoonOutlined /> : <SunOutlined />}</div>
                    <div className="font-semibold text-sm capitalize">{m}</div>
                    <div className="text-xs text-gray-500">{m === 'dark' ? 'Easy on the eyes' : 'Clean bright interface'}</div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Color Theme */}
          <Card size="small" title="Color Theme" className="!rounded-xl">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {(Object.entries(colorPalettes) as [ThemeColor, typeof colorPalettes[ThemeColor]][]).map(([key, palette]) => {
                const isSelected = colorTheme === key;
                return (
                  <button
                    key={key}
                    onClick={() => dispatch(setThemeColor(key))}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${
                      isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex gap-1.5 mb-3">
                      {palette.colors.map((c, i) => (
                        <div key={i} className="w-6 h-6 rounded-md" style={{ background: c, opacity: 1 - i * 0.2 }} />
                      ))}
                    </div>
                    <div className="text-sm font-semibold">{palette.label}</div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: palette.primary }}>
                        <CheckOutlined className="text-white text-[10px]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Font Family */}
          <Card size="small" title={<span className="flex items-center gap-2"><FontSizeOutlined /> Font Family</span>} className="!rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {fontFamilies.map((font) => {
                const isSelected = fontFamily === font.value;
                return (
                  <button
                    key={font.value}
                    onClick={() => dispatch(setFontFamily(font.value))}
                    className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${
                      isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <div className="mb-2" style={{ fontFamily: font.value }}>
                      <div className="text-2xl font-bold">Aa</div>
                      <div className="text-sm mt-1">The quick brown fox</div>
                    </div>
                    <div className="text-sm font-semibold">{font.label}</div>
                    {isSelected && (
                      <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <CheckOutlined className="text-white text-[10px]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Preview */}
          <Card size="small" title="Preview" className="!rounded-xl">
            <Space wrap>
              <Button type="primary">Primary Button</Button>
              <Button>Default Button</Button>
              <Button type="dashed">Dashed</Button>
              <Button type="text">Text</Button>
              <Button type="link">Link</Button>
            </Space>
          </Card>
        </div>
      ),
    },
    {
      key: 'company',
      label: (
        <span className="flex items-center gap-2">
          <BankOutlined /> Company
        </span>
      ),
      children: (
        <Card size="small" title="Company Information" className="!rounded-xl">
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name</label>
              <Input defaultValue="Acme Corp Pvt Ltd" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <Select defaultValue="technology" className="w-full" options={[
                  { value: 'technology', label: 'Technology' },
                  { value: 'finance', label: 'Finance' },
                  { value: 'healthcare', label: 'Healthcare' },
                ]} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Company Size</label>
                <Select defaultValue="200-500" className="w-full" options={[
                  { value: '1-50', label: '1-50' },
                  { value: '50-200', label: '50-200' },
                  { value: '200-500', label: '200-500' },
                  { value: '500+', label: '500+' },
                ]} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Address</label>
              <TextArea rows={3} defaultValue="123 Tech Park, Bangalore, India" />
            </div>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('Company settings saved')}>
              Save Changes
            </Button>
          </div>
        </Card>
      ),
    },
    {
      key: 'notifications',
      label: (
        <span className="flex items-center gap-2">
          <BellOutlined /> Notifications
        </span>
      ),
      children: (
        <Card size="small" title="Notification Preferences" className="!rounded-xl">
          <div className="max-w-2xl divide-y">
            {notificationItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="pr-4">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-sm text-gray-500">{item.desc}</div>
                </div>
                <Switch
                  checked={notifications[item.id]}
                  onChange={(checked) => setNotifications((prev) => ({ ...prev, [item.id]: checked }))}
                />
              </div>
            ))}
          </div>
        </Card>
      ),
    },
    {
      key: 'security',
      label: (
        <span className="flex items-center gap-2">
          <LockOutlined /> Security
        </span>
      ),
      children: (
        <Card size="small" title="Security Settings" className="!rounded-xl">
          <div className="space-y-4 max-w-2xl">
            <div>
              <label className="block text-sm font-medium mb-1">Password Policy</label>
              <Select defaultValue="strong" className="w-full" options={[
                { value: 'basic', label: 'Basic (8+ characters)' },
                { value: 'strong', label: 'Strong (8+ chars, uppercase, number, symbol)' },
              ]} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Session Timeout</label>
              <Select defaultValue="30" className="w-full" options={[
                { value: '15', label: '15 minutes' },
                { value: '30', label: '30 minutes' },
                { value: '60', label: '1 hour' },
              ]} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div className="pr-4">
                <div className="text-sm font-medium">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">Require 2FA for all admin users</div>
              </div>
              <Switch defaultChecked />
            </div>
            <Divider />
            <Button type="primary" icon={<SaveOutlined />} onClick={() => message.success('Security settings saved')}>
              Save Security Settings
            </Button>
          </div>
        </Card>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">Settings</Title>
        <Text type="secondary">Manage your organization settings and preferences</Text>
      </div>
      <Tabs items={tabItems} tabPosition="left" className="settings-tabs" />
    </div>
  );
};

export default Settings;
