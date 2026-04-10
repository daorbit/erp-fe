import React, { useState } from 'react';
import {
  Card, Tabs, Input, Select, Switch, Button, Typography, Divider, Space, InputNumber, Upload, Slider, Radio,
} from 'antd';
import {
  Save, Check, Sun, Moon, Droplet, Banknote, Bell, Lock, Type, Globe,
  Upload as UploadIcon, Zap, Maximize, LayoutGrid, MonitorSmartphone,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  setThemeMode, setThemeColor, setFontFamily, setLanguage,
  setFontSize, setAnimationLevel, setBorderRadius, setCompactMode,
  type AnimationLevel, type FontSize, type BorderRadius,
} from '@/store/uiSlice';
import { colorPalettes, fontFamilies, type ThemeColor } from '@/config/theme';
import { languages } from '@/config/i18n';
import type { Language } from '@/config/i18n';
import { useTranslation } from '@/hooks/useTranslation';
import AnimateIn from '@/components/AnimateIn';
import { App } from 'antd';

const { Title, Text } = Typography;
const { TextArea } = Input;

const notificationItems = [
  { id: 'onboarding', label: 'Email notifications for new onboarding', desc: 'Receive email when a new employee starts KYC', defaultOn: true },
  { id: 'kyc-complete', label: 'KYC completion alerts', desc: 'Get notified when KYC is fully completed', defaultOn: true },
  { id: 'weekly-report', label: 'Weekly summary report', desc: 'Receive weekly HR summary via email', defaultOn: false },
  { id: 'doc-expiry', label: 'Document expiry reminders', desc: 'Alert when employee documents are about to expire', defaultOn: true },
];

const fontSizeOptions: { label: string; value: FontSize; desc: string; preview: string }[] = [
  { label: 'Small', value: 'small', desc: '13px base — Compact view', preview: 'Aa' },
  { label: 'Default', value: 'default', desc: '14px base — Standard', preview: 'Aa' },
  { label: 'Large', value: 'large', desc: '16px base — Accessibility', preview: 'Aa' },
];

const animationOptions: { label: string; value: AnimationLevel; desc: string; icon: React.ReactNode }[] = [
  { label: 'None', value: 'none', desc: 'No animations — best performance', icon: <MonitorSmartphone size={18} /> },
  { label: 'Minimal', value: 'minimal', desc: 'Subtle fades only', icon: <Zap size={18} /> },
  { label: 'Full', value: 'full', desc: 'All transitions & effects', icon: <Zap size={18} className="text-amber-500" /> },
];

const borderRadiusOptions: { label: string; value: BorderRadius; preview: string }[] = [
  { label: 'None', value: 'none', preview: '0px' },
  { label: 'Small', value: 'small', preview: '4px' },
  { label: 'Default', value: 'default', preview: '8px' },
  { label: 'Large', value: 'large', preview: '14px' },
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
  const fontSize = useAppSelector((s) => s.ui.fontSize);
  const animationLevel = useAppSelector((s) => s.ui.animationLevel);
  const borderRadius = useAppSelector((s) => s.ui.borderRadius);
  const compactMode = useAppSelector((s) => s.ui.compactMode);

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

          {/* Font Size */}
          <AnimateIn>
            <Card size="small" title={<span className="flex items-center gap-2"><Maximize size={18} /> Font Size</span>} className="!rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {fontSizeOptions.map((opt) => {
                  const isSelected = fontSize === opt.value;
                  const sizeMap = { small: '20px', default: '28px', large: '36px' };
                  return (
                    <button
                      key={opt.value}
                      onClick={() => dispatch(setFontSize(opt.value))}
                      className={`relative rounded-xl border-2 p-4 text-center transition-all hover:shadow-sm ${
                        isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-bold mb-2" style={{ fontSize: sizeMap[opt.value] }}>{opt.preview}</div>
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
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

          {/* Animations */}
          <AnimateIn>
            <Card size="small" title={<span className="flex items-center gap-2"><Zap size={18} /> Animation Effects</span>} className="!rounded-xl">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {animationOptions.map((opt) => {
                  const isSelected = animationLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => dispatch(setAnimationLevel(opt.value))}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all hover:shadow-sm ${
                        isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="mb-2">{opt.icon}</div>
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-gray-500">{opt.desc}</div>
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

          {/* Border Radius */}
          <AnimateIn>
            <Card size="small" title={<span className="flex items-center gap-2"><LayoutGrid size={18} /> Border Radius</span>} className="!rounded-xl">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {borderRadiusOptions.map((opt) => {
                  const isSelected = borderRadius === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => dispatch(setBorderRadius(opt.value))}
                      className={`relative rounded-xl border-2 p-4 text-center transition-all hover:shadow-sm ${
                        isSelected ? 'border-blue-500 shadow-sm' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-400 mx-auto mb-2" style={{ borderRadius: opt.preview }} />
                      <div className="text-sm font-semibold">{opt.label}</div>
                      <div className="text-xs text-gray-400">{opt.preview}</div>
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

          {/* Compact Mode */}
          <AnimateIn>
            <Card size="small" className="!rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Compact Mode</div>
                  <div className="text-xs text-gray-500">Reduce spacing and padding throughout the app</div>
                </div>
                <Switch checked={compactMode} onChange={(v) => dispatch(setCompactMode(v))} />
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
      key: 'company',
      label: <span className="flex items-center gap-2"><Banknote size={18} /> {t('company')}</span>,
      children: (
        <AnimateIn>
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
              <div>
                <label className="block text-sm font-medium mb-1">Company Logo</label>
                <Upload.Dragger name="logo" maxCount={1} beforeUpload={() => false}>
                  <p className="text-gray-400"><UploadIcon size={24} className="mx-auto mb-2" /></p>
                  <p className="text-sm">Click or drag to upload logo</p>
                </Upload.Dragger>
              </div>
              <Button type="primary" icon={<Save size={18} />} onClick={() => message.success('Company settings saved')}>
                {t('save')} Changes
              </Button>
            </div>
          </Card>
        </AnimateIn>
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
