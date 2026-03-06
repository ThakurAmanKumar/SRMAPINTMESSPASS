'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Plus, FileText, LogOut, Menu, X, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: (collapsed: boolean) => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [internalCollapsed, setInternalCollapsed] = useState(isCollapsed);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const collapsed = isCollapsed !== undefined ? isCollapsed : internalCollapsed;

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setShowMobileMenu(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    router.push('/login');
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/issue-pass', label: 'Issue Pass', icon: Plus },
    { href: '/dashboard/issued-passes', label: 'Issued Passes', icon: FileText },
    { href: '/dashboard/pass-requests', label: 'Pass Requests', icon: ClipboardList },
  ];

  const toggleSidebar = () => {
    if (isMobile) {
      setShowMobileMenu(!showMobileMenu);
    } else {
      const newState = !collapsed;
      setInternalCollapsed(newState);
      onToggleCollapse?.(newState);
    }
  };

  // Render hamburger menu for header (mobile only)
  const HamburgerMenu = () => (
    <button
      onClick={toggleSidebar}
      className="md:hidden p-1.5 hover:bg-blue-700 transition-colors rounded-lg flex-shrink-0"
      aria-label="Toggle sidebar"
      title="Toggle menu"
    >
      {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
    </button>
  );

  // Desktop sidebar (collapsible and fixed)
  return (
    <>
      {/* Mobile Header with Hamburger */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-primary text-white flex items-center justify-between px-3 py-2 z-50 border-b border-blue-600 shadow-sm h-14">
        <div className="flex items-center space-x-2 min-w-0">
          <div className="flex-shrink-0 bg-white p-0.5 rounded">
            <Image
              src="/LOGO/dashboardsidebarlogo.png"
              alt="SRMAP Logo"
              width={32}
              height={32}
              className="rounded w-8 h-8"
            />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-sm font-bold leading-none">SRMAP</h1>
            <p className="text-blue-100 text-xs">Mess Pass</p>
          </div>
        </div>
        <HamburgerMenu />
      </div>

      {/* Mobile Overlay - Higher z-index to block interaction */}
      {isMobile && showMobileMenu && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 md:hidden z-30 top-14"
          onClick={() => setShowMobileMenu(false)}
        />
      )}

      {/* Mobile Sidebar - Slide from left */}
      {isMobile && (
        <div
          className={`fixed left-0 top-14 bottom-0 w-64 z-40 transition-transform duration-300 overflow-x-hidden overflow-y-auto ${
            showMobileMenu ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <aside className="w-full h-full bg-primary text-white flex flex-col overflow-hidden overflow-x-hidden">
            {/* Navigation */}
            <nav className="flex-1 p-4 pt-4 pb-2 space-y-2 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-yellow-600 text-white bg-opacity-80'
                        : 'text-yellow-100 hover:bg-yellow-600 hover:bg-opacity-50'
                    }`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    <span className="text-base">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Logout Button */}
            <div className="p-3 mt-auto border-t border-yellow-100 border-opacity-30 flex-shrink-0">
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 px-4 py-4 rounded-lg transition-colors font-semibold"
                style={{ backgroundColor: '#efeee3', color: '#484622' }}
              >
                <LogOut size={22} className="flex-shrink-0" />
                <span className="text-base">Logout</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Desktop Sidebar - Fixed positioning */}
      {!isMobile && (
        <aside className="w-full h-full bg-primary text-white flex flex-col overflow-hidden overflow-x-hidden">
          {/* Navigation */}
          <nav className="flex-1 p-4 pt-6 pb-2 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <div key={item.href} className={`relative group ${collapsed ? 'flex justify-center' : ''}`}>
                  <Link
                    href={item.href}
                    className={`flex ${
                      collapsed ? 'flex-col items-center px-2' : 'items-center space-x-3 px-4'
                    } py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-yellow-600 text-white bg-opacity-80'
                        : 'text-yellow-100 hover:bg-yellow-600 hover:bg-opacity-50'
                    }`}
                    title={collapsed ? item.label : ''}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {collapsed ? (
                      <span className="text-xs text-center mt-1 whitespace-normal max-w-[60px] break-words">{item.label}</span>
                    ) : (
                      <span>{item.label}</span>
                    )}
                  </Link>
                </div>
              );
            })}
          </nav>

        </aside>
      )}
    </>
  );
}
