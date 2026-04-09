import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Header from './Header';

interface AppLayoutProps {
  children: React.ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const sidebarCollapsed = useSelector((state: any) => state.ui?.sidebarCollapsed ?? false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'md:ml-[72px]' : 'md:ml-[270px]',
          'ml-0',
        )}
      >
        <Header onMobileMenuToggle={() => setMobileOpen((prev) => !prev)} />

        <main className="flex-1 p-4 md:p-7 bg-gray-50 dark:bg-gray-950">
          {children}
        </main>
      </div>
    </div>
  );
}
