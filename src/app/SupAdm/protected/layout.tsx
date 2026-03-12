'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, Menu, X, LayoutDashboard, Users, History, LogIn, ChevronLeft, ChevronRight, Shield } from 'lucide-react';

export default function ProtectedSuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<string>('');

  useEffect(() => {
    const token = localStorage.getItem('superadmin-token');
    if (!token) {
      router.push('/SupAdm/login');
      return;
    }

    // Decode JWT to get email and userType
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setUserEmail(payload.email);
      setUserType(payload.userType || 'SuperAdmin');
      
      // If user is Admin, redirect to admin dashboard
      if (payload.userType === 'Admin') {
        router.push('/dashboard');
        return;
      }
      
      setIsLoggedIn(true);
    } catch (error) {
      localStorage.removeItem('superadmin-token');
      router.push('/SupAdm/login');
    }

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    setLoading(false);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('superadmin-token');
    router.push('/SupAdm/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: '#f5f5f5' }}>
        <div className="text-center">
          <div className="mb-4">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-[#484622] rounded-full animate-spin mx-auto"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return null;
  }

  const navigation = [
    { label: 'Dashboard', href: '/SupAdm/protected/dashboard', icon: LayoutDashboard },
    { label: 'Super Admins', href: '/SupAdm/protected/superadmins', icon: Shield },
    { label: 'Admins', href: '/SupAdm/protected/admins', icon: Users },
    { label: 'Activity History', href: '/SupAdm/protected/history', icon: History },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-full px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition text-gray-600 md:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <Image 
              src="/LOGO/dashboardsidebarlogo.png" 
              alt="Super Admin Logo" 
              width={60} 
              height={60}
              className="h-auto"
            />
            <h1 className="text-xl sm:text-2xl font-bold" style={{ color: '#484622' }}>
              Super Admin
            </h1>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs sm:text-sm text-gray-600">Logged in as</p>
              <p className="text-xs sm:text-sm font-semibold text-gray-800 truncate max-w-xs">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg transition text-white"
              style={{ backgroundColor: '#484622' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3a3419'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#484622'}
            >
              <LogOut size={18} />
              <span className="hidden sm:inline text-sm">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Backdrop */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`border-r border-gray-200 transition-all duration-300 overflow-y-auto
            ${isMobile 
              ? `fixed left-0 top-20 bottom-0 w-64 z-40 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}` 
              : `hidden md:flex flex-col ${desktopCollapsed ? 'w-24' : 'w-64'}`
            }`}
          style={{ backgroundColor: '#efeee3' }}
        >
          {!isMobile && (
            <div className="flex justify-end p-2 border-b border-gray-300">
              <button
                onClick={() => setDesktopCollapsed(!desktopCollapsed)}
                className="p-2 hover:bg-gray-300 rounded-lg transition text-gray-600"
                title={desktopCollapsed ? 'Expand' : 'Collapse'}
              >
                {desktopCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
              </button>
            </div>
          )}
          <nav className="p-4 space-y-2 flex-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-3 rounded-lg transition group ${
                    desktopCollapsed && !isMobile ? 'flex flex-col items-center justify-center text-center' : 'flex items-center space-x-3'
                  }`}
                  style={{
                    color: '#484622',
                  }}
                  onClick={() => isMobile && setSidebarOpen(false)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#484622';
                    e.currentTarget.style.color = 'white';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#484622';
                  }}
                  title={isMobile ? undefined : !desktopCollapsed ? undefined : item.label}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {(!desktopCollapsed || isMobile) ? (
                    <span className="font-medium whitespace-nowrap">{item.label}</span>
                  ) : (
                    <span className="font-medium text-xs mt-1 whitespace-normal break-words">{item.label}</span>
                  )}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
