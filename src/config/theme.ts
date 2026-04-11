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

export interface BgPreset {
  id: string;
  label: string;
  light: string;
  dark: string;
}

export const bgPresets: BgPreset[] = [
  {
    id: 'default',
    label: 'Flat',
    light: '#f0f2f5',
    dark: '#09090b',
  },
  {
    id: 'subtle',
    label: 'Subtle Mist',
    light: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8ee 100%)',
    dark: 'linear-gradient(135deg, #0a0a0c 0%, #111115 100%)',
  },
  {
    id: 'cool',
    label: 'Cool Slate',
    light: 'linear-gradient(160deg, #e8edf5 0%, #f0f2f5 50%, #e6ecf5 100%)',
    dark: 'linear-gradient(160deg, #09090b 0%, #0c0d12 50%, #09090e 100%)',
  },
  {
    id: 'warm',
    label: 'Warm Sand',
    light: 'linear-gradient(160deg, #f5f0e8 0%, #f2f0ed 50%, #f5efe6 100%)',
    dark: 'linear-gradient(160deg, #0b0a09 0%, #0d0c0a 50%, #0b0a08 100%)',
  },
  {
    id: 'aurora',
    label: 'Aurora',
    light: 'linear-gradient(135deg, #e8f0fe 0%, #f0e8f5 50%, #e8f5f0 100%)',
    dark: 'linear-gradient(135deg, #090b10 0%, #0d0a10 50%, #090d0b 100%)',
  },
  {
    id: 'ocean',
    label: 'Deep Ocean',
    light: 'linear-gradient(180deg, #eaf2fb 0%, #f0f2f5 60%, #e8eff8 100%)',
    dark: 'linear-gradient(180deg, #08090e 0%, #09090b 60%, #080a0f 100%)',
  },
  {
    id: 'sunset',
    label: 'Dusk',
    light: 'linear-gradient(135deg, #f5ece8 0%, #f0f2f5 50%, #f0e8f0 100%)',
    dark: 'linear-gradient(135deg, #0d0a09 0%, #09090b 50%, #0c090c 100%)',
  },
  {
    id: 'mint',
    label: 'Fresh Mint',
    light: 'linear-gradient(160deg, #e8f5f0 0%, #f0f2f5 50%, #e8f2f5 100%)',
    dark: 'linear-gradient(160deg, #080c0b 0%, #09090b 50%, #080a0c 100%)',
  },
  {
    id: 'charcoal',
    label: 'Charcoal',
    light: 'linear-gradient(180deg, #eaecef 0%, #f0f2f5 100%)',
    dark: 'linear-gradient(180deg, #0c0c0c 0%, #080808 100%)',
  },
];

export const fontFamilies = [
  { label: 'Inter', value: "'Inter', sans-serif" },
  { label: 'Poppins', value: "'Poppins', sans-serif" },
  { label: 'DM Sans', value: "'DM Sans', sans-serif" },
  { label: 'Nunito', value: "'Nunito', sans-serif" },
  { label: 'Roboto', value: "'Roboto', sans-serif" },
  { label: 'Open Sans', value: "'Open Sans', sans-serif" },
  { label: 'Lato', value: "'Lato', sans-serif" },
  { label: 'Montserrat', value: "'Montserrat', sans-serif" },
  { label: 'Source Sans 3', value: "'Source Sans 3', sans-serif" },
  { label: 'Raleway', value: "'Raleway', sans-serif" },
];

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');
  const expanded = normalized.length === 3
    ? normalized.split('').map((c) => c + c).join('')
    : normalized;
  const int = parseInt(expanded, 16);
  const r = (int >> 16) & 255;
  const g = (int >> 8) & 255;
  const b = int & 255;
  return `${r}, ${g}, ${b}`;
}

export function getAntdTheme(primaryColor: string, isDark: boolean): ThemeConfig {
  const primaryRgb = hexToRgb(primaryColor);

  return {
    token: {
      colorPrimary: primaryColor,
      borderRadius: 8,
      fontFamily: 'inherit',
      colorBgContainer: isDark ? '#111113' : '#ffffff',
      colorBgElevated: isDark ? '#161618' : '#ffffff',
      colorBgLayout: isDark ? '#09090b' : '#ffffff',
      colorText: isDark ? '#e5e7eb' : '#1f2937',
      colorTextSecondary: isDark ? '#9ca3af' : '#6b7280',
      colorBorder: isDark ? '#1e1e22' : '#e5e7eb',
      colorBorderSecondary: isDark ? '#262628' : '#f3f4f6',
    },
    components: {
      Layout: {
        siderBg: isDark ? '#09090b' : '#ffffff',
        headerBg: isDark ? '#0e0e10' : '#ffffff',
        bodyBg: isDark ? '#09090b' : '#ffffff',
      },
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
        darkItemColor: 'rgba(255,255,255,0.65)',
        darkItemHoverBg: 'rgba(255,255,255,0.06)',
        darkItemHoverColor: 'rgba(255,255,255,0.95)',
        darkItemSelectedBg: `rgba(${primaryRgb}, 0.16)`,
        darkItemSelectedColor: '#ffffff',
        darkPopupBg: isDark ? '#0a0a0c' : undefined,
        itemBg: 'transparent',
        subMenuItemBg: 'transparent',
        itemColor: '#475569',
        itemHoverBg: `rgba(${primaryRgb}, 0.08)`,
        itemHoverColor: '#1f2937',
        itemSelectedBg: `rgba(${primaryRgb}, 0.14)`,
        itemSelectedColor: primaryColor,
        itemActiveBg: `rgba(${primaryRgb}, 0.14)`,
      },
      Card: {
        paddingLG: 20,
      },
      Table: {
        headerBg: isDark ? '#161618' : '#fafafa',
      },
    },
  };
}
