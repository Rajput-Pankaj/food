import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { MdFastfood, MdMenu, MdClose } from "react-icons/md";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { LuShoppingBag, LuUser, LuSearch } from "react-icons/lu";

function Header({ searchQuery, setSearchQuery, cartItemCount = 0, onCartClick }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-green-600 text-white py-2">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                Free Delivery on Orders Above Rs.500
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-4">
              <span>Call us: +1 (555) 123-4567</span>
              <div className="flex space-x-2">
                <a href="#" className="hover:text-green-200 transition-colors">
                  <FaFacebook size={16} />
                </a>
                <a href="#" className="hover:text-green-200 transition-colors">
                  <FaTwitter size={16} />
                </a>
                <a href="#" className="hover:text-green-200 transition-colors">
                  <FaInstagram size={16} />
                </a>
                <a href="#" className="hover:text-green-200 transition-colors">
                  <FaLinkedin size={16} />
                </a>
              </div>
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
            <div className="space-x-12">
              <h1 className="text-2xl font-bold text-gray-800">FoodExpress</h1>
              <p className="text-green-600 text-sm font-medium">Delicious Food Delivered</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
          {/* <Link to="/" className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
              <MdFastfood className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">FoodExpress</h1>
              <p className="text-green-600 text-sm font-medium">Delicious Food Delivered</p>
            </div>
          </Link> */}
            <Link 
              to="/" 
              className={`font-medium transition-colors duration-300 ${
                isActive('/') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Home
            </Link>
            <Link 
              to="/menu" 
              className={`font-medium transition-colors duration-300 ${
                isActive('/menu') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Menu
            </Link>
            <Link 
              to="/about" 
              className={`font-medium transition-colors duration-300 ${
                isActive('/about') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              About Us
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition-colors duration-300 ${
                isActive('/contact') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Contact
            </Link>
            <Link 
              to="/blog" 
              className={`font-medium transition-colors duration-300 ${
                isActive('/blog') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
              }`}
            >
              Blog
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 flex-1 max-w-md mx-8">
            <LuSearch className="w-5 h-5 text-gray-400 mr-2" />
            <input
              type="text"
              placeholder="Search for food..."
              className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* User Account */}
            <button className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors duration-300">
              <LuUser className="w-5 h-5" />
              <span className="font-medium">Account</span>
            </button>

            {/* Cart */}
            <button
              onClick={onCartClick}
              className="relative flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors duration-300"
            >
              <LuShoppingBag className="w-6 h-6" />
              <span className="font-medium hidden sm:inline">Cart</span>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-gray-700 hover:text-green-600 transition-colors duration-300"
            >
              {isMobileMenuOpen ? <MdClose size={24} /> : <MdMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="md:hidden px-4 pb-4">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2">
          <LuSearch className="w-5 h-5 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search for food..."
            className="bg-transparent outline-none text-gray-700 placeholder-gray-400 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-4 space-y-4">
            <nav className="space-y-3">
              <Link 
                to="/" 
                className={`block font-medium transition-colors duration-300 ${
                  isActive('/') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/menu" 
                className={`block font-medium transition-colors duration-300 ${
                  isActive('/menu') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Menu
              </Link>
              <Link 
                to="/about" 
                className={`block font-medium transition-colors duration-300 ${
                  isActive('/about') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About Us
              </Link>
              <Link 
                to="/contact" 
                className={`block font-medium transition-colors duration-300 ${
                  isActive('/contact') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contact
              </Link>
              <Link 
                to="/blog" 
                className={`block font-medium transition-colors duration-300 ${
                  isActive('/blog') ? 'text-green-600' : 'text-gray-700 hover:text-green-600'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
            </nav>
            <div className="pt-4 border-t border-gray-200">
              <button className="flex items-center space-x-2 text-gray-700 hover:text-green-600 transition-colors duration-300">
                <LuUser className="w-5 h-5" />
                <span className="font-medium">Account</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header; 