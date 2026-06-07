import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdFastfood, MdMenu, MdClose } from "react-icons/md";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { LuShoppingBag, LuUser, LuSearch } from "react-icons/lu";

function Header({ searchQuery, setSearchQuery, cartItemCount = 0, onCartClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState("");
  const location = useLocation();

  useEffect(() => {
    const loggedUser = localStorage.getItem("user");
    setUser(loggedUser);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">

      {/* Top Bar */}
      <div className="bg-green-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <span>Free Delivery on Orders Above Rs.500</span>

            <div className="hidden md:flex items-center space-x-4">
              <span>Call us: +91 8429168953</span>

              {/* ✅ Instagram */}
              <a
                href="https://www.instagram.com/pankaj_rajput_1116/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-300"
              >
                <FaInstagram size={18} />
              </a>

              {/* ✅ LinkedIn */}
              <a
                href="https://www.linkedin.com/in/pankaj-kumar-rajput-b2458539b/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-yellow-300"
              >
                <FaLinkedin size={18} />
              </a>

            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <MdFastfood className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">FoodExpress</h1>
              <p className="text-green-600 text-sm">Delicious Food Delivered</p>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link to="/" className={isActive("/") ? "text-green-600" : ""}>Home</Link>
            <Link to="/menu" className={isActive("/menu") ? "text-green-600" : ""}>Menu</Link>
            <Link to="/about" className={isActive("/about") ? "text-green-600" : ""}>About</Link>
            <Link to="/contact" className={isActive("/contact") ? "text-green-600" : ""}>Contact</Link>
            <Link to="/blog" className={isActive("/blog") ? "text-green-600" : ""}>Blog</Link>
          </nav>

          {/* Search */}
          <div className="hidden md:flex items-center bg-gray-100 px-3 py-2 rounded">
            <LuSearch />
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent outline-none ml-2"
            />
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">

            {user ? (
              <div className="flex items-center gap-2 text-sm">
                <LuUser className="text-gray-600" />
                <span className="hidden sm:inline text-gray-800 font-medium">
                  {user}
                </span>
                <button
                  onClick={logout}
                  className="text-green-600 hover:text-green-700 font-semibold"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1 text-gray-700 hover:text-green-600"
              >
                <LuUser />
                <span>Account</span>
              </Link>
            )}

            {/* Cart */}
            <button onClick={onCartClick} className="relative">
              <LuShoppingBag size={22} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu */}
            <button onClick={toggleMobileMenu} className="lg:hidden">
              {isMobileMenuOpen ? <MdClose /> : <MdMenu />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden px-4 pb-4">
          <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Home</Link><br />
          <Link to="/menu" onClick={() => setIsMobileMenuOpen(false)}>Menu</Link><br />
          <Link to="/about" onClick={() => setIsMobileMenuOpen(false)}>About</Link><br />
          <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contact</Link><br />
          <Link to="/blog" onClick={() => setIsMobileMenuOpen(false)}>Blog</Link>
        </div>
      )}
    </header>
  );
}

export default Header;