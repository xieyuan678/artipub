'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

interface User {
  id?: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface AdminLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  title: string;
  subtitle?: string;
  user?: User;
  onSignOut?: () => void;
}

export function AdminLayout({ 
  children, 
  activeTab, 
  onTabChange, 
  title, 
  subtitle,
  user,
  onSignOut
}: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex h-screen">
        <aside className={`
          fixed inset-y-0 left-0 z-50 transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <Sidebar activeTab={activeTab} onTabChange={onTabChange} />
        </aside>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex flex-1 flex-col min-w-0">
          <Topbar 
            title={title} 
            subtitle={subtitle}
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            user={user}
            onSignOut={onSignOut}
          />

          <main className="flex-1 overflow-auto bg-background">
            <div className="container mx-auto px-4 py-4">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
