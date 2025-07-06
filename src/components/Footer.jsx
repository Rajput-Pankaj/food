import React from 'react';
import { MdFastfood, MdLocationOn, MdPhone, MdEmail } from "react-icons/md";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";
import { LuClock } from "react-icons/lu";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <MdFastfood className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">FoodExpress</h3>
                <p className="text-green-400 text-sm">Delicious Food Delivered</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              Bringing the best flavors from around the world to your doorstep. 
              Fresh ingredients, authentic recipes, and fast delivery.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors duration-300">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors duration-300">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors duration-300">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors duration-300">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Home
                </a>
              </li>
              <li>
                <a href="/menu" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Menu
                </a>
              </li>
              <li>
                <a href="/about" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  About Us
                </a>
              </li>
              <li>
                <a href="/contact" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Contact
                </a>
              </li>
              <li>
                <a href="/blog" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Blog
                </a>
              </li>
              <li>
                <a href="" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Careers
                </a>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">Food Categories</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Breakfast
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Soups & Salads
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Pasta & Noodles
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Main Course
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Pizza
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-green-400 transition-colors duration-300 text-sm">
                  Burgers
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MdLocationOn className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-gray-300 text-sm">
                    123 Food Street, Cuisine City<br />
                    CC 12345, Foodland
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">+1 (555) 123-4567</p>
              </div>
              <div className="flex items-center gap-3">
                <MdEmail className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">info@foodexpress.com</p>
              </div>
              <div className="flex items-center gap-3">
                <LuClock className="w-5 h-5 text-green-400 flex-shrink-0" />
                <p className="text-gray-300 text-sm">24/7 Delivery Available</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold text-green-400">Subscribe to Our Newsletter</h3>
            <p className="text-gray-300 text-sm max-w-md mx-auto">
              Get the latest updates on new menu items, special offers, and exclusive deals delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-green-500 text-white placeholder-gray-400"
              />
              <button className="px-6 py-3 bg-green-500 text-white font-semibold rounded-lg hover:bg-green-600 transition-colors duration-300">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 FoodExpress. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm">
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-green-400 transition-colors duration-300">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 