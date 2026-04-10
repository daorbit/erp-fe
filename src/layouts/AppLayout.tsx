import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const sidebarCollapsed = useSelector((state: any) => state.ui?.sidebarCollapsed ?? false);
  const themeMode = useSelector((state: any) => state.ui?.themeMode ?? 'light');
  const isDark = themeMode === 'dark';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar mobileOpen={mobileOpen} onMobileOpenChange={setMobileOpen} />

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ml-0
          ${sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[270px]'}`}
      >
        <Header onMobileMenuToggle={() => setMobileOpen((prev) => !prev)} />

        <main className={`flex-1 p-4 md:p-6 min-h-[calc(100vh-64px)] ${isDark ? 'bg-[#0c0e14]' : 'bg-[#f0f2f5]'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
