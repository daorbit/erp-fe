import { useEffect } from 'react';
import { Provider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme as antdTheme, App as AntApp } from 'antd';
import { store, useAppSelector, useAppDispatch } from '../store';
import { setUser, logout } from '../store/authSlice';
import { queryClient } from '../config/queryClient';
import { getAntdTheme, colorPalettes, type ThemeColor } from '../config/theme';
import authService from '../services/authService';

/**
 * Fetches user profile on app load when token exists but user is not in state.
 * This handles the case where the user logged in before localStorage persistence was added,
 * or if localStorage was cleared but the token cookie survived.
 */
function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token);
  const user = useAppSelector((s) => s.auth.user);

  // Fetch latest user data on app load (handles stale localStorage)
  useEffect(() => {
    if (token) {
      authService.me()
        .then((res: any) => {
          const me = res?.data;
          if (me) {
            dispatch(setUser(me));
          }
        })
        .catch((err: any) => {
          // Only logout on auth errors (401/403), not network failures
          if (err?.status === 401 || err?.message?.includes('deactivated')) {
            dispatch(logout());
          }
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return <>{children}</>;
}

function AntdConfigWrapper({ children }: { children: React.ReactNode }) {
  const themeMode = useAppSelector((s) => s.ui.themeMode);
  const themeColor = useAppSelector((s) => s.ui.themeColor) as ThemeColor;
  const fontFamily = useAppSelector((s) => s.ui.fontFamily);
  const isDark = themeMode === 'dark';
  const palette = colorPalettes[themeColor] || colorPalettes.green;
  const themeConfig = getAntdTheme(palette.primary, isDark);

  return (
    <ConfigProvider
      theme={{
        ...themeConfig,
        algorithm: isDark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          ...themeConfig.token,
          fontFamily: fontFamily || "'Inter', sans-serif",
        },
        cssVar: { prefix: 'ant' },
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
        <AuthBootstrap>
          <AntdConfigWrapper>
            {children}
          </AntdConfigWrapper>
        </AuthBootstrap>
      </QueryClientProvider>
    </Provider>
  );
}
