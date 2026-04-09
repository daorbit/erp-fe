import { useEffect } from 'react';
import { useAppSelector } from '../store';
import { colorPalettes, type ThemeColor } from '../config/theme';

export default function ThemeSync() {
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const themeColor = useAppSelector((s) => s.ui.themeColor) as ThemeColor;
  const fontFamily = useAppSelector((s) => s.ui.fontFamily);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    const palette = colorPalettes[themeColor];
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

  return null;
}
