'use client';

import Image from 'next/image';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Sidebar } from '@/components/Sidebar';
import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen flex-col w-full">
        {/* Desktop Header */}
        <header className="hidden md:flex items-center justify-between bg-primary text-white px-4 py-2 border-b-2 border-white z-40 fixed top-0 left-0 right-0 shadow-sm">
          <div className="flex items-center space-x-2 min-w-0">
            <div className="flex-shrink-0 bg-white p-0.5 rounded">
              <Image
                src="/LOGO/dashboardsidebarlogo.png"
                alt="SRMAP Logo"
                width={40}
                height={40}
                priority
                className="rounded"
              />
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-lg font-bold leading-none">SRMAP</h1>
              <p className="text-blue-100 text-xs">Mess Pass Portal</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-1.5 hover:bg-blue-700 transition-colors rounded-lg flex-shrink-0"
              aria-label="Toggle sidebar"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <Menu size={22} />
            </button>
            <button
              onClick={handleLogout}
              className="p-1.5 hover:bg-red-600 transition-colors rounded-lg flex-shrink-0 flex items-center space-x-1"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut size={20} />
              <span className="text-sm font-semibold">Logout</span>
            </button>
          </div>
        </header>

        {/* Mobile Header - Moved here for better z-index control */}
        <div className="md:hidden w-full">
          <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={setSidebarCollapsed} />
        </div>

        {/* Main container */}
        <div className="flex flex-1 md:mt-10 w-full h-full">
          {/* Sidebar - Fixed on desktop only */}
          <div className={`hidden md:block fixed left-0 top-10 h-full transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} z-30 overflow-y-auto`}>
            <Sidebar isCollapsed={sidebarCollapsed} onToggleCollapse={setSidebarCollapsed} />
          </div>

          {/* Main Content */}
          <main 
            className={`flex-1 overflow-y-auto overflow-x-hidden w-full transition-all duration-300 dashboard-main ${sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}
          >
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
