import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme as antdTheme, App as AntApp } from 'antd';
import { store, useAppSelector } from '../store';
import { queryClient } from '../config/queryClient';
import { getAntdTheme, colorPalettes, type ThemeColor } from '../config/theme';

function AntdConfigWrapper({ children }: { children: React.ReactNode }) {
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const themeColor = useAppSelector((s) => s.ui.themeColor) as ThemeColor;
  const isDark = themeMode === 'dark';
  const palette = colorPalettes[themeColor] || colorPalettes.green;
  const themeConfig = getAntdTheme(palette.primary, isDark);

  return (
    <ConfigProvider
      theme={{
        ...themeConfig,
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
      }}
    >
      <AntApp>
        {children}
      </AntApp>
    </ConfigProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AntdConfigWrapper>
          {children}
        </AntdConfigWrapper>
      </QueryClientProvider>
    </Provider>
  );
}
