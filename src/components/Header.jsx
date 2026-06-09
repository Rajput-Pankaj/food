import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { MdFastfood, MdMenu, MdClose } from 'react-icons/md';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { LuShoppingBag, LuUser, LuPhone, LuSun, LuMoon } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import UserMenu from './UserMenu';
import FoodSearch from './FoodSearch';
import { getNameInitial, getUserGreeting } from '../utils/userDisplay';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { useTheme } from '../context/ThemeContext';
import StoreLogo from './StoreLogo';

const NAV_LINKS = [
  { path: '/', label: 'Home' },
  { path: '/menu', label: 'Menu' },
  { path: '/about', label: 'About' },
  { path: '/contact', label: 'Contact' },
  { path: '/blog', label: 'Blog' },
];

function Header({ searchQuery = '', setSearchQuery, showSearch = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { settings } = useStoreSettings();
  const { isAuthenticated, isAdmin, isCustomer, logout, user } = useAuth();
  const { cartItemCount, setIsCartOpen } = useCart();
  const { toggleTheme, isDark, darkModeAllowed } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `block px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
      isActive(path)
        ? 'text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400 font-semibold'
        : 'text-gray-700 dark:text-gray-200 hover:text-green-600 hover:bg-gray-50 dark:hover:bg-gray-800'
    }`;

  const desktopNavClass = (path) =>
    `text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
      isActive(path)
        ? 'text-green-600 dark:text-green-400 font-semibold'
        : 'text-gray-700 dark:text-gray-200 hover:text-green-600'
    }`;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const handleLogout = () => {
    closeMobileMenu();
    logout();
    navigate('/login');
  };

  useEffect(() => {
    closeMobileMenu();
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) closeMobileMenu();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 shadow-lg dark:shadow-black/20 sticky top-0 z-40 transition-colors duration-200">
      {/* Top announcement bar */}
      <div className="bg-green-600 text-white">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
          <div className="flex items-center justify-between gap-2 py-2 text-xs sm:text-sm min-h-[36px]">
            <p className="truncate flex-1 font-medium">
              <span className="hidden sm:inline">Free Delivery on Orders Above </span>
              <span className="sm:hidden">Free delivery above </span>
              Rs.{settings.freeDeliveryThreshold}
            </p>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <a
                href="tel:+918429168953"
                className="hidden sm:flex items-center gap-1 hover:text-yellow-200 transition-colors"
              >
                <LuPhone className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden md:inline">+91 8429168953</span>
                <span className="md:hidden">Call</span>
              </a>
              <a
                href="https://www.instagram.com/pankaj_rajput_1116/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-200 transition-colors p-1"
                aria-label="Instagram"
              >
                <FaInstagram size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
              <a
                href="https://www.linkedin.com/in/pankaj-kumar-rajput-b2458539b/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-200 transition-colors p-1"
                aria-label="LinkedIn"
              >
                <FaLinkedin size={16} className="sm:w-[18px] sm:h-[18px]" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 h-14 sm:h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 sm:gap-3 shrink-0 min-w-0">
            <StoreLogo settings={settings} size="sm" showName={false} />
            <div className="min-w-0 hidden min-[400px]:block">
              <p className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight truncate">
                {settings.storeName || 'FoodExpress'}
              </p>
              <p className="text-green-600 text-[10px] sm:text-xs truncate hidden sm:block">
                Delicious Food Delivered
              </p>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-6" aria-label="Main navigation">
            {NAV_LINKS.map((link) => (
              <Link key={link.path} to={link.path} className={desktopNavClass(link.path)}>
                {link.label}
              </Link>
            ))}
          </nav>

          {showSearch && setSearchQuery && (
            <FoodSearch value={searchQuery} onChange={setSearchQuery} variant="desktop" />
          )}

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {isAuthenticated ? (
              <UserMenu />
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 sm:gap-1.5 text-gray-700 dark:text-gray-200 hover:text-green-600 px-2 sm:px-3 py-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors duration-200 text-sm font-medium"
              >
                <LuUser className="w-5 h-5 shrink-0" />
                <span className="hidden sm:inline">Login</span>
              </Link>
            )}

            {darkModeAllowed && (
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-600 dark:text-gray-300 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                title={isDark ? 'Light mode' : 'Dark mode'}
              >
                {isDark ? <LuSun className="w-5 h-5" /> : <LuMoon className="w-5 h-5" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-green-500 focus-visible:outline-offset-2"
              aria-label={`Open cart${cartItemCount > 0 ? `, ${cartItemCount} items` : ''}`}
            >
              <LuShoppingBag size={20} className="text-gray-700 dark:text-gray-200 sm:w-[22px] sm:h-[22px]" />
              {cartItemCount > 0 && (
                <span className="absolute top-0.5 right-0.5 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 px-1 rounded-full flex items-center justify-center">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 cursor-pointer"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>
          </div>
        </div>

        {showSearch && setSearchQuery && (
          <div className="lg:hidden pb-3">
            <FoodSearch value={searchQuery} onChange={setSearchQuery} variant="mobile" />
          </div>
        )}
      </div>

      {/* Mobile / tablet menu overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[calc(36px+56px)] sm:top-[calc(36px+64px)] z-30">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={closeMobileMenu}
            aria-label="Close menu overlay"
          />
          <nav
            className="relative bg-white dark:bg-gray-900 h-full overflow-y-auto mobile-nav-panel shadow-xl transition-colors duration-200"
            aria-label="Mobile navigation"
          >
            <div className="px-4 py-4 max-w-lg mx-auto">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">
                Menu
              </p>
              <div className="flex flex-col gap-0.5 mb-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={navLinkClass(link.path)}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              {isAuthenticated ? (
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-3 mb-3">
                    Account
                  </p>
                  <div className="flex items-center gap-3 px-3 py-2 mb-2 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <span
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 ${
                        isAdmin ? 'bg-purple-500' : 'bg-green-500'
                      }`}
                    >
                      {getNameInitial(user?.name)}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                        {getUserGreeting(user?.name)}
                      </p>
                      <p
                        className={`text-xs font-semibold uppercase ${
                          isAdmin ? 'text-purple-600' : 'text-green-600'
                        }`}
                      >
                        {isAdmin ? 'Admin' : 'Customer'}
                      </p>
                    </div>
                  </div>
                  {isAdmin && (
                    <>
                      <Link
                        to="/admin"
                        className={navLinkClass('/admin')}
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/admin/orders"
                        className={navLinkClass('/admin/orders')}
                        onClick={closeMobileMenu}
                      >
                        Orders
                      </Link>
                    </>
                  )}
                  {isCustomer && (
                    <>
                      <Link
                        to="/dashboard"
                        className={navLinkClass('/dashboard')}
                        onClick={closeMobileMenu}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/dashboard?tab=orders"
                        className={navLinkClass('/dashboard')}
                        onClick={closeMobileMenu}
                      >
                        Orders
                      </Link>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 rounded-lg text-red-600 hover:bg-red-50 text-sm font-medium mt-1"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-100 dark:border-gray-700 pt-4 px-3">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block w-full text-center bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    Login / Sign Up
                  </Link>
                </div>
              )}

              <div className="mt-6 px-3 py-4 bg-green-50 dark:bg-green-900/20 rounded-xl text-center">
                <p className="text-sm text-green-800 dark:text-green-300 font-medium">Need help ordering?</p>
                <a
                  href="tel:+918429168953"
                  className="text-green-600 font-semibold text-sm mt-1 inline-block hover:underline"
                >
                  Call +91 8429168953
                </a>
              </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Header;
