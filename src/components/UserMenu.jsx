import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LuChevronDown,
  LuLayoutDashboard,
  LuLogOut,
  LuMapPin,
  LuReceipt,
  LuStar,
  LuUser,
} from 'react-icons/lu';
import { useAuth } from '../context/AuthContext';
import { getNameInitial, getUserGreeting } from '../utils/userDisplay';

export default function UserMenu() {
  const { user, isAdmin, isCustomer, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login');
  };

  const customerLinks = isCustomer
    ? [
        { to: '/dashboard', label: 'Dashboard', icon: LuLayoutDashboard },
        { to: '/dashboard?tab=orders', label: 'My Orders', icon: LuReceipt },
        { to: '/dashboard?tab=profile', label: 'Profile', icon: LuUser },
        { to: '/dashboard?tab=addresses', label: 'Addresses', icon: LuMapPin },
        { to: '/dashboard?tab=reviews', label: 'Reviews', icon: LuStar },
      ]
    : [];
  const adminLinks = isAdmin
    ? [
        { to: '/admin', label: 'Dashboard', icon: LuLayoutDashboard },
        { to: '/admin/orders', label: 'Orders', icon: LuReceipt },
      ]
    : [];

  const accountLinks = isAdmin ? adminLinks : customerLinks;

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 sm:gap-2 pl-1 pr-1.5 sm:pr-2 py-1 rounded-full border transition-all duration-200 max-w-[52px] sm:max-w-none cursor-pointer ${
          open
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/30 shadow-sm'
            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-green-200 dark:hover:border-green-700 hover:bg-green-50/60 dark:hover:bg-green-900/20'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Account menu"
      >
        <span
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold text-white shrink-0 ${
            isAdmin ? 'bg-purple-500' : 'bg-green-500'
          }`}
        >
          {getNameInitial(user?.name)}
        </span>

        <span className="hidden md:block text-sm font-semibold text-gray-800 dark:text-gray-100 truncate max-w-[140px] lg:max-w-[180px]">
          {getUserGreeting(user?.name)}
        </span>

        <LuChevronDown
          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform hidden md:block ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-[min(17rem,calc(100vw-1.5rem))] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 py-2 z-50 user-menu-dropdown"
          role="menu"
        >
          <div className="py-1">
            {accountLinks.map((link) => {
              const LinkIcon = link.icon;
              const isActive =
                location.pathname + location.search === link.to ||
                (link.to === '/dashboard' && location.pathname === '/dashboard' && !location.search);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-200 ${
                    isActive
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-semibold'
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-green-600'
                  }`}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <LinkIcon className={`w-4 h-4 shrink-0 ${isActive ? 'text-green-600' : 'text-green-500'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 pt-1">
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 cursor-pointer"
              role="menuitem"
            >
              <LuLogOut className="w-4 h-4 shrink-0" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
