import { ConfigProvider } from 'antd';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';
import Settings from './pages/admin/Settings';
import KYCOnboarding from './pages/onboarding/KYCOnboarding';
import OnboardingList from './pages/onboarding/OnboardingList';

const ThemedApp = () => {
  const { getAntdTheme } = useTheme();
  return (
    <ConfigProvider theme={getAntdTheme()}>
      <BrowserRouter>
        <AppLayout>
          <Routes>
            <Route path="/" element={<Navigate to="/admin" replace />} />
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/settings" element={<Settings />} />
            <Route path="/onboarding/new" element={<KYCOnboarding />} />
            <Route path="/onboarding/list" element={<OnboardingList />} />
          </Routes>
        </AppLayout>
      </BrowserRouter>
    </ConfigProvider>
  );
};

const App = () => (
  <ThemeProvider>
    <ThemedApp />
  </ThemeProvider>
);

export default App;
