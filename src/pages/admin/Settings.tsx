import React, { useState } from 'react';
import {
  Card, Tabs, Input, Select, Switch, Button, Typography, Divider, Space, InputNumber, App,
} from 'antd';
import {
  Save, Check, Sun, Moon, Droplet, Bell, Lock, Type, Globe, Palette, Clock,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setThemeMode, setThemeColor, setFontFamily, setLanguage, setBgStyle, setTimezone,
} from '@/store/uiSlice';
import { colorPalettes, fontFamilies, bgPresets, type ThemeColor } from '@/config/theme';
import { languages } from '@/config/i18n';
import type { Language } from '@/config/i18n';
import { useTranslation } from '@/hooks/useTranslation';
import AnimateIn from '@/components/AnimateIn';

const { Title, Text } = Typography;

const notificationItems = [
  { id: 'onboarding', label: 'Email notifications for new onboarding', desc: 'Receive email when a new employee starts KYC', defaultOn: true },
  { id: 'kyc-complete', label: 'KYC completion alerts', desc: 'Get notified when KYC is fully completed', defaultOn: true },
  { id: 'weekly-report', label: 'Weekly summary report', desc: 'Receive weekly HR summary via email', defaultOn: false },
  { id: 'doc-expiry', label: 'Document expiry reminders', desc: 'Alert when employee documents are about to expire', defaultOn: true },
];

const useIsMobile = () => {
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);
  React.useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  return isMobile;
};

const Settings: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const { message } = App.useApp();
  const mode = useAppSelector((s) => s.ui.themeMode);
  const colorTheme = useAppSelector((s) => s.ui.themeColor) as ThemeColor;
  const fontFamily = useAppSelector((s) => s.ui.fontFamily);
  const language = useAppSelector((s) => s.ui.language) as Language;
  const bgStyle = useAppSelector((s) => s.ui.bgStyle) || 'default';
  const timezone = useAppSelector((s) => s.ui.timezone) || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(notificationItems.map((n) => [n.id, n.defaultOn])),
  );

  const previewKeys = ['dashboard', 'employees', 'departments', 'attendance', 'leaves', 'payroll', 'settings'];

  const tabItems = [
    {
      key: 'appearance',
      label: <span className="flex items-center gap-2"><Droplet size={18} /> {t('appearance')}</span>,
      children: (
        <div className="space-y-6">
          {/* Theme Mode */}
          <AnimateIn>
            <Card size="small" title={t('theme_mode')} className="!rounded-xl">
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
                      <div className={`rounded-lg border p-3 mb-3 ${m === 'dark' ? 'bg-[#1a1d23] border-[#2d3140]' : 'bg-[#f8fafc] border-[#e2e8f0]'}`}>
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
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                      <div className="mb-1">{m === 'dark' ? <Moon size={18} /> : <Sun size={18} />}</div>
                      <div className="font-semibold text-sm capitalize">{m}</div>
                      <div className="text-xs text-gray-500">{m === 'dark' ? 'Easy on the eyes' : 'Clean bright interface'}</div>
                    </button>
                  );
                })}
              </div>
            </Card>
          </AnimateIn>

          {/* Color Theme */}
          <AnimateIn>
            <Card size="small" title={t('color_theme')} className="!rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(Object.entries(colorPalettes) as [ThemeColor, typeof colorPalettes[ThemeColor]][]).map(([key, palette]) => {
                  const isSelected = colorTheme === key;
                  return (
                    <button
                      key={key}
                      onClick={() => dispatch(setThemeColor(key))}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${
                        isSelected ? 'shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      style={isSelected ? { borderColor: palette.primary } : undefined}
                    >
                      <div className="flex gap-1.5 mb-3">
                        {palette.colors.map((c, i) => (
                          <div key={i} className="w-6 h-6 rounded-full shadow-sm" style={{ background: c }} />
                        ))}
                      </div>
                      <div className="text-sm font-semibold">{palette.label}</div>
                      {isSelected && (
                        <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: palette.primary }}>
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </AnimateIn>

          {/* Background Style */}
          <AnimateIn>
            <Card size="small" title={<span className="flex items-center gap-2"><Palette size={18} /> Background Style</span>} className="!rounded-xl">
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {bgPresets.map((preset) => {
                  const isSelected = bgStyle === preset.id;
                  const previewBg = mode === 'dark' ? preset.dark : preset.light;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => dispatch(setBgStyle(preset.id))}
                      className={`relative rounded-xl border-2 p-2 text-left transition-all hover:shadow-sm ${
                        isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-full aspect-[4/3] rounded-lg mb-2 border border-gray-200 dark:border-gray-700"
                        style={{ background: previewBg }}
                      >
                        <div className="p-2 h-full flex flex-col justify-end gap-1">
                          <div className={`h-1 rounded-full w-3/4 ${mode === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
                          <div className={`h-1 rounded-full w-1/2 ${mode === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
                        </div>
                      </div>
                      <div className="text-xs font-medium truncate">{preset.label}</div>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check size={8} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </AnimateIn>

          {/* Font Family */}
          <AnimateIn>
            <Card size="small" title={<span className="flex items-center gap-2"><Type size={18} /> {t('font_family')}</span>} className="!rounded-xl">
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
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </AnimateIn>

          {/* Preview */}
          <AnimateIn>
            <Card size="small" title="Preview" className="!rounded-xl">
              <Space wrap>
                <Button type="primary">Primary Button</Button>
                <Button>Default Button</Button>
                <Button type="dashed">Dashed</Button>
                <Button type="text">Text</Button>
                <Button type="link">Link</Button>
              </Space>
            </Card>
          </AnimateIn>
        </div>
      ),
    },
    {
      key: 'language',
      label: <span className="flex items-center gap-2"><Globe size={18} /> {t('language')}</span>,
      children: (
        <div className="space-y-6">
          <AnimateIn>
            <Card size="small" title={t('language')} className="!rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {languages.map((lang) => {
                  const isSelected = language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => dispatch(setLanguage(lang.code))}
                      className={`relative rounded-xl border-2 p-6 text-center transition-all hover:shadow-sm ${
                        isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-4xl mb-3">{lang.flag}</div>
                      <div className="font-semibold text-base">{lang.label}</div>
                      {isSelected && (
                        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </AnimateIn>
          <AnimateIn>
            <Card size="small" title="Preview" className="!rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {previewKeys.map((key) => (
                  <div key={key} className="rounded-lg border p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">{key}</div>
                    <div className="font-medium">{t(key)}</div>
                  </div>
                ))}
              </div>
            </Card>
          </AnimateIn>
        </div>
      ),
    },
    {
      key: 'notifications',
      label: <span className="flex items-center gap-2"><Bell size={18} /> {t('notifications')}</span>,
      children: (
        <AnimateIn>
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
            <Divider />
            <Button type="primary" icon={<Save size={18} />} onClick={() => message.success('Notification settings saved')}>
              {t('save')} Changes
            </Button>
          </Card>
        </AnimateIn>
      ),
    },
    {
      key: 'security',
      label: <span className="flex items-center gap-2"><Lock size={18} /> {t('security')}</span>,
      children: (
        <AnimateIn>
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
                <label className="block text-sm font-medium mb-1">Minimum Password Length</label>
                <InputNumber defaultValue={8} min={6} max={32} className="w-full" />
              </div>
              <div className="flex items-center justify-between py-2">
                <div className="pr-4">
                  <div className="text-sm font-medium">Two-Factor Authentication</div>
                  <div className="text-sm text-gray-500">Require 2FA for all admin users</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Divider />
              <Button type="primary" icon={<Save size={18} />} onClick={() => message.success('Security settings saved')}>
                {t('save')} Security Settings
              </Button>
            </div>
          </Card>
        </AnimateIn>
      ),
    },
    {
      key: 'timezone',
      label: <span className="flex items-center gap-2"><Clock size={18} /> Timezone</span>,
      children: (
        <AnimateIn>
          <Card size="small" title="Timezone Settings" className="!rounded-xl">
            <div className="space-y-4 max-w-2xl">
              <Text type="secondary">Choose your timezone. All dates and times across the app will be displayed in this timezone.</Text>
              <Select
                showSearch
                className="w-full"
                placeholder="Select timezone"
                value={timezone}
                onChange={(val) => dispatch(setTimezone(val))}
                optionFilterProp="label"
                options={[
                  { label: '(UTC-12:00) Baker Island', value: 'Etc/GMT+12' },
                  { label: '(UTC-11:00) Pago Pago', value: 'Pacific/Pago_Pago' },
                  { label: '(UTC-10:00) Honolulu (HST)', value: 'Pacific/Honolulu' },
                  { label: '(UTC-09:00) Anchorage (AKST)', value: 'America/Anchorage' },
                  { label: '(UTC-08:00) Los Angeles (PST)', value: 'America/Los_Angeles' },
                  { label: '(UTC-07:00) Denver (MST)', value: 'America/Denver' },
                  { label: '(UTC-06:00) Chicago (CST)', value: 'America/Chicago' },
                  { label: '(UTC-05:00) New York (EST)', value: 'America/New_York' },
                  { label: '(UTC-04:00) Halifax (AST)', value: 'America/Halifax' },
                  { label: '(UTC-03:30) St. Johns (NST)', value: 'America/St_Johns' },
                  { label: '(UTC-03:00) São Paulo (BRT)', value: 'America/Sao_Paulo' },
                  { label: '(UTC-02:00) South Georgia', value: 'Atlantic/South_Georgia' },
                  { label: '(UTC-01:00) Azores', value: 'Atlantic/Azores' },
                  { label: '(UTC+00:00) London (GMT)', value: 'Europe/London' },
                  { label: '(UTC+01:00) Paris (CET)', value: 'Europe/Paris' },
                  { label: '(UTC+02:00) Cairo (EET)', value: 'Africa/Cairo' },
                  { label: '(UTC+03:00) Moscow (MSK)', value: 'Europe/Moscow' },
                  { label: '(UTC+03:30) Tehran (IRST)', value: 'Asia/Tehran' },
                  { label: '(UTC+04:00) Dubai (GST)', value: 'Asia/Dubai' },
                  { label: '(UTC+04:30) Kabul (AFT)', value: 'Asia/Kabul' },
                  { label: '(UTC+05:00) Karachi (PKT)', value: 'Asia/Karachi' },
                  { label: '(UTC+05:30) Kolkata (IST)', value: 'Asia/Kolkata' },
                  { label: '(UTC+05:45) Kathmandu (NPT)', value: 'Asia/Kathmandu' },
                  { label: '(UTC+06:00) Dhaka (BST)', value: 'Asia/Dhaka' },
                  { label: '(UTC+06:30) Yangon (MMT)', value: 'Asia/Yangon' },
                  { label: '(UTC+07:00) Bangkok (ICT)', value: 'Asia/Bangkok' },
                  { label: '(UTC+08:00) Singapore (SGT)', value: 'Asia/Singapore' },
                  { label: '(UTC+08:00) Hong Kong (HKT)', value: 'Asia/Hong_Kong' },
                  { label: '(UTC+09:00) Tokyo (JST)', value: 'Asia/Tokyo' },
                  { label: '(UTC+09:30) Adelaide (ACST)', value: 'Australia/Adelaide' },
                  { label: '(UTC+10:00) Sydney (AEST)', value: 'Australia/Sydney' },
                  { label: '(UTC+11:00) Noumea (NCT)', value: 'Pacific/Noumea' },
                  { label: '(UTC+12:00) Auckland (NZST)', value: 'Pacific/Auckland' },
                  { label: '(UTC+13:00) Apia (WSST)', value: 'Pacific/Apia' },
                ]}
              />
              <Card size="small" className="!rounded-lg">
                <div className="text-sm">
                  <Text type="secondary">Current time in selected timezone:</Text>
                  <div className="text-lg font-semibold mt-1">
                    {new Intl.DateTimeFormat('en-US', {
                      timeZone: timezone,
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      timeZoneName: 'short',
                    }).format(new Date())}
                  </div>
                </div>
              </Card>
            </div>
          </Card>
        </AnimateIn>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Title level={4} className="!mb-1">{t('settings')}</Title>
        <Text type="secondary">Manage your organization settings and preferences</Text>
      </div>
      <Tabs items={tabItems} tabPosition={isMobile ? 'top' : 'left'} className="settings-tabs" />
    </div>
  );
};

export default Settings;
