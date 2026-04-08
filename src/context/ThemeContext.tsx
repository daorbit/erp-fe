import React, { createContext, useContext, useState, useEffect } from 'react';
import { theme as antdTheme } from 'antd';
import type { ThemeConfig } from 'antd';

export type ThemeMode = 'light' | 'dark';
export type ThemeColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'teal';

interface ThemeContextType {
  mode: ThemeMode;
  colorTheme: ThemeColor;
  setMode: (mode: ThemeMode) => void;
  setColorTheme: (color: ThemeColor) => void;
  getAntdTheme: () => ThemeConfig;
}

const colorPalettes: Record<ThemeColor, { primary: string; primaryLight: string; gradient: string; label: string }> = {
  blue: { primary: '#1a56db', primaryLight: '#3b82f6', gradient: 'linear-gradient(135deg, #1a56db 0%, #3b82f6 100%)', label: 'Ocean Blue' },
  green: { primary: '#059669', primaryLight: '#10b981', gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)', label: 'Emerald Green' },
  purple: { primary: '#7c3aed', primaryLight: '#a78bfa', gradient: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)', label: 'Royal Purple' },
  orange: { primary: '#ea580c', primaryLight: '#fb923c', gradient: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)', label: 'Sunset Orange' },
  red: { primary: '#dc2626', primaryLight: '#f87171', gradient: 'linear-gradient(135deg, #dc2626 0%, #f87171 100%)', label: 'Ruby Red' },
  teal: { primary: '#0d9488', primaryLight: '#2dd4bf', gradient: 'linear-gradient(135deg, #0d9488 0%, #2dd4bf 100%)', label: 'Tropical Teal' },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export const getColorPalettes = () => colorPalettes;

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setModeState] = useState<ThemeMode>(() => (localStorage.getItem('erp-theme-mode') as ThemeMode) || 'light');
  const [colorTheme, setColorThemeState] = useState<ThemeColor>(() => (localStorage.getItem('erp-color-theme') as ThemeColor) || 'blue');

  const setMode = (m: ThemeMode) => { setModeState(m); localStorage.setItem('erp-theme-mode', m); };
  const setColorTheme = (c: ThemeColor) => { setColorThemeState(c); localStorage.setItem('erp-color-theme', c); };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode);
  }, [mode]);

  const palette = colorPalettes[colorTheme];

  const getAntdTheme = (): ThemeConfig => ({
    algorithm: mode === 'dark' ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
    token: {
      colorPrimary: palette.primary,
      colorSuccess: '#059669',
      colorWarning: '#d97706',
      colorError: '#dc2626',
      colorInfo: palette.primary,
      borderRadius: 10,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      fontSize: 14,
      controlHeight: 40,
      ...(mode === 'dark' ? {
        colorBgContainer: '#1a1d23',
        colorBgElevated: '#22262e',
        colorBgLayout: '#13151a',
        colorBorder: '#2d3140',
        colorBorderSecondary: '#252830',
        colorText: '#e4e6eb',
        colorTextSecondary: '#9ca3af',
      } : {
        colorBgContainer: '#ffffff',
        colorBgLayout: '#f5f7fa',
        colorBorder: '#e5e7eb',
      }),
    },
    components: {
      Menu: { itemBorderRadius: 10, subMenuItemBorderRadius: 10 },
      Card: { borderRadiusLG: 14 },
      Button: { borderRadius: 10, controlHeight: 40 },
      Input: { borderRadius: 10, controlHeight: 40 },
      Select: { borderRadius: 10, controlHeight: 40 },
      Table: { borderRadius: 14 },
    },
  });

  return (
    <ThemeContext.Provider value={{ mode, colorTheme, setMode, setColorTheme, getAntdTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
