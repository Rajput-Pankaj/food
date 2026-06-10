import { useEffect, useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdReceiptLong,
  MdRestaurantMenu,
  MdPeople,
  MdStar,
  MdArticle,
  MdSettings,
  MdPermMedia,
  MdLogout,
  MdFastfood,
  MdMenu,
  MdClose,
  MdMoreHoriz,
} from 'react-icons/md';
import { useAuth } from '../../context/AuthContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useTheme } from '../../context/ThemeContext';
import { getUserGreeting } from '../../utils/userDisplay';
import { LuSun, LuMoon } from 'react-icons/lu';

const navItems = [
  { path: '/admin', label: 'Dashboard', shortLabel: 'Home', icon: MdDashboard, end: true, mobileQuick: true },
  { path: '/admin/orders', label: 'Orders', shortLabel: 'Orders', icon: MdReceiptLong, mobileQuick: true },
  { path: '/admin/kitchen', label: 'Kitchen', shortLabel: 'Kitchen', icon: MdFastfood, mobileQuick: true },
  { path: '/admin/menu', label: 'Menu', shortLabel: 'Menu', icon: MdRestaurantMenu, mobileQuick: true },
  { path: '/admin/promos', label: 'Promos', shortLabel: 'Promos', icon: MdStar },
  { path: '/admin/reviews', label: 'Reviews', shortLabel: 'Reviews', icon: MdStar },
  { path: '/admin/blogs', label: 'Blogs', shortLabel: 'Blogs', icon: MdArticle },
  { path: '/admin/media', label: 'Media', shortLabel: 'Media', icon: MdPermMedia },
  { path: '/admin/contacts', label: 'Inbox', shortLabel: 'Inbox', icon: MdPeople },
  { path: '/admin/audit', label: 'Audit Log', shortLabel: 'Audit', icon: MdReceiptLong },
  { path: '/admin/users', label: 'Users', shortLabel: 'Users', icon: MdPeople },
  { path: '/admin/settings', label: 'Settings', shortLabel: 'Setup', icon: MdSettings },
];

export default function AdminLayout() {
  useDocumentTitle('Admin');
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path, end = false) => {
    if (end) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const currentPage =
    navItems.find((item) => isActive(item.path, item.end))?.label ?? 'Admin';

  const mobileQuickItems = navItems.filter((item) => item.mobileQuick);
  const isMoreActive = !mobileQuickItems.some((item) => isActive(item.path, item.end));

  const closeSidebar = () => setSidebarOpen(false);

  const handleLogout = () => {
    closeSidebar();
    logout();
    navigate('/login');
  };

  useEffect(() => {
    closeSidebar();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const sidebarContent = (
    <>
      <div className="p-4 sm:p-5 border-b border-gray-800">
        <Link
          to="/"
          onClick={closeSidebar}
          className="flex items-center gap-3 rounded-lg p-1 -m-1 hover:bg-gray-800 transition-colors group"
          aria-label="Go to FoodExpress homepage"
          title="Back to homepage"
        >
          <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-green-400 transition-colors">
            <MdFastfood className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <p className="font-bold truncate">FoodExpress</p>
            <p className="text-xs text-green-400">Admin Panel</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const NavIcon = item.icon;
          const active = isActive(item.path, item.end);
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={closeSidebar}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm sm:text-base ${
                active
                  ? 'bg-green-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              <NavIcon className="w-5 h-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-800">
        <p className="text-sm font-medium truncate text-gray-200">
          {getUserGreeting(user?.name)}
        </p>
        <p className="text-xs text-gray-500 mt-0.5 mb-3">Administrator</p>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
        >
          <MdLogout className="w-4 h-4" />
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-gray-950 flex flex-col lg:flex-row transition-colors duration-200">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-gray-900 text-white border-b border-gray-800">
        <div className="flex items-center justify-between px-3 sm:px-4 h-14">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-800"
            aria-label="Open admin menu"
          >
            <MdMenu size={24} />
          </button>
          <div className="text-center flex-1 min-w-0 px-2">
            <p className="text-sm font-semibold truncate">{currentPage}</p>
            <p className="text-[10px] text-green-400">Admin Panel</p>
          </div>
          <Link
            to="/"
            className="p-2 rounded-lg hover:bg-gray-800 text-green-400 transition-colors"
            aria-label="Go to homepage"
            title="Homepage"
          >
            <MdFastfood size={22} />
          </Link>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/50"
            onClick={closeSidebar}
            aria-label="Close admin menu"
          />
          <aside className="relative w-[min(18rem,85vw)] h-full bg-gray-900 text-white flex flex-col mobile-nav-panel shadow-xl">
            <button
              type="button"
              onClick={closeSidebar}
              className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800"
              aria-label="Close menu"
            >
              <MdClose size={22} />
            </button>
            {sidebarContent}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-gray-900 text-white flex-col shrink-0 min-h-screen sticky top-0 h-screen">
        {sidebarContent}
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-0">
        <div className="hidden lg:flex items-center justify-between bg-white dark:bg-gray-900 border-b dark:border-gray-800 px-6 py-4 transition-colors duration-200">
          <div>
            <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{currentPage}</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">FoodExpress administration</p>
          </div>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <LuSun className="w-5 h-5" /> : <LuMoon className="w-5 h-5" />}
          </button>
        </div>
        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-gray-900 border-t border-gray-800 safe-area-pb"
        aria-label="Admin navigation"
      >
        <div className="grid grid-cols-5">
          {mobileQuickItems.map((item) => {
            const NavIcon = item.icon;
            const active = isActive(item.path, item.end);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center py-2.5 px-1 text-[10px] transition-colors ${
                  active ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <NavIcon className={`w-5 h-5 mb-0.5 ${active ? 'text-green-400' : ''}`} />
                <span className="truncate w-full text-center">{item.shortLabel}</span>
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className={`flex flex-col items-center justify-center py-2.5 px-1 text-[10px] transition-colors ${
              isMoreActive ? 'text-green-400' : 'text-gray-400 hover:text-gray-200'
            }`}
            aria-label="More admin pages"
          >
            <MdMoreHoriz className={`w-5 h-5 mb-0.5 ${isMoreActive ? 'text-green-400' : ''}`} />
            <span className="truncate w-full text-center">More</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
