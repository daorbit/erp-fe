import { useEffect } from 'react';
import { useAppSelector } from '../store';
import { colorPalettes, type ThemeColor, bgPresets } from '../config/theme';

const fontSizeMap = { small: '13px', default: '14px', large: '16px' };
const radiusMap = { none: '0px', small: '4px', default: '8px', large: '14px' };

export default function ThemeSync() {
  const { themeMode, themeColor, fontFamily, fontSize, animationLevel, borderRadius, bgStyle } =
    useAppSelector((s) => s.ui);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  useEffect(() => {
    const palette = colorPalettes[themeColor as ThemeColor];
    if (palette) {
      document.documentElement.style.setProperty('--theme-primary', palette.primary);
    }
  }, [themeColor]);

  useEffect(() => {
    if (fontFamily) {
      document.documentElement.style.setProperty('--font-family', fontFamily);
      document.body.style.fontFamily = fontFamily;
    }
  }, [fontFamily]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-font-size', fontSizeMap[fontSize] || '14px');
    document.body.style.fontSize = fontSizeMap[fontSize] || '14px';
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.style.setProperty('--base-radius', radiusMap[borderRadius] || '8px');
  }, [borderRadius]);

  useEffect(() => {
    document.documentElement.classList.toggle('no-animations', animationLevel === 'none');
    document.documentElement.classList.toggle('minimal-animations', animationLevel === 'minimal');
  }, [animationLevel]);

  useEffect(() => {
    const preset = bgPresets.find((p) => p.id === bgStyle) || bgPresets[0];
    const value = themeMode === 'dark' ? preset.dark : preset.light;
    document.documentElement.style.setProperty('--app-bg', value);
  }, [bgStyle, themeMode]);

  return null;
}
