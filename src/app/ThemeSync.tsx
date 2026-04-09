import { useEffect } from 'react';
import { useAppSelector } from '../store';

/**
 * Syncs the Redux themeMode to the <html> class for Tailwind dark mode
 * and applies the themeColor as a CSS custom property.
 */
export default function ThemeSync() {
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const themeColor = useAppSelector((s) => s.ui.themeColor);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.style.setProperty('--theme-primary', themeColor);
  }, [themeColor]);

  return null;
}
