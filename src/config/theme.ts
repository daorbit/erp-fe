import type { ThemeConfig } from 'antd';

export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';

export const colorPalettes: Record<ThemeColor, { label: string; primary: string; colors: string[] }> = {
  blue: { label: 'Ocean Blue', primary: '#1a56db', colors: ['#1a56db', '#2563eb', '#3b82f6'] },
  green: { label: 'Emerald Green', primary: '#047857', colors: ['#047857', '#059669', '#10b981'] },
  purple: { label: 'Royal Purple', primary: '#7c3aed', colors: ['#7c3aed', '#8b5cf6', '#a78bfa'] },
  orange: { label: 'Sunset Orange', primary: '#ea580c', colors: ['#ea580c', '#f97316', '#fb923c'] },
  red: { label: 'Ruby Red', primary: '#dc2626', colors: ['#dc2626', '#ef4444', '#f87171'] },
  teal: { label: 'Tropical Teal', primary: '#0d9488', colors: ['#0d9488', '#14b8a6', '#2dd4bf'] },
};

export const fontFamilies = [
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Nunito', value: "'Nunito', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
];

export function getAntdTheme(primaryColor: string, isDark: boolean): ThemeConfig {
  return {
    token: {
      colorPrimary: primaryColor,
      borderRadius: 8,
      fontFamily: 'inherit',
      colorBgContainer: isDark ? '#1a1d23' : '#ffffff',
      colorBgElevated: isDark ? '#22262e' : '#ffffff',
      colorBgLayout: isDark ? '#111318' : '#f5f5f5',
      colorText: isDark ? '#e5e7eb' : '#1f2937',
      colorTextSecondary: isDark ? '#9ca3af' : '#6b7280',
      colorBorder: isDark ? '#2d3140' : '#e5e7eb',
      colorBorderSecondary: isDark ? '#374151' : '#f3f4f6',
    },
    components: {
      Layout: {
        siderBg: isDark ? '#111318' : '#0f172a',
        headerBg: isDark ? '#1a1d23' : '#ffffff',
        bodyBg: isDark ? '#111318' : '#f8fafc',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkItemColor: 'rgba(255,255,255,0.6)',
        darkItemHoverBg: 'rgba(255,255,255,0.06)',
        darkItemHoverColor: 'rgba(255,255,255,0.85)',
        darkItemSelectedBg: 'rgba(255,255,255,0.1)',
        darkItemSelectedColor: '#ffffff',
      },
      Card: {
        paddingLG: 20,
      },
      Table: {
        headerBg: isDark ? '#22262e' : '#fafafa',
      },
    },
  };
}
