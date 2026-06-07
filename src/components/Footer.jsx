import React from 'react';
import { MdFastfood, MdLocationOn, MdPhone, MdEmail } from "react-icons/md";
import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { LuClock } from "react-icons/lu";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      
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

            {/* 🔥 UPDATED SOCIAL ICONS */}
            <div className="flex space-x-4">

              {/* Email */}
              <a href="mailto:pankajkumarrajput1116@gmail.com"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <MdEmail className="w-5 h-5" />
              </a>

              {/* Instagram */}
              <a href="https://www.instagram.com/pankaj_rajput_1116/?hl=en"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <FaInstagram className="w-5 h-5" />
              </a>

              {/* LinkedIn */}
              <a href="https://www.linkedin.com/in/pankaj-kumar-rajput-b2458539b/"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition">
                <FaLinkedin className="w-5 h-5" />
              </a>

            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-gray-300 hover:text-green-400 text-sm">Home</a></li>
              <li><a href="/menu" className="text-gray-300 hover:text-green-400 text-sm">Menu</a></li>
              <li><a href="/about" className="text-gray-300 hover:text-green-400 text-sm">About Us</a></li>
              <li><a href="/contact" className="text-gray-300 hover:text-green-400 text-sm">Contact</a></li>
              <li><a href="/blog" className="text-gray-300 hover:text-green-400 text-sm">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 text-sm">Careers</a></li>
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">Food Categories</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-green-400 text-sm">Breakfast</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 text-sm">Soups & Salads</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 text-sm">Pasta & Noodles</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 text-sm">Main Course</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 text-sm">Pizza</a></li>
              <li><a href="#" className="text-gray-300 hover:text-green-400 text-sm">Burgers</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-green-400">Contact Info</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MdLocationOn className="w-5 h-5 text-green-400" />
                <p className="text-gray-300 text-sm">
                  123 Food Street, Kanpur City<br />
                  CC 12345, Foodland
                </p>
              </div>

              <div className="flex items-center gap-3">
                <MdPhone className="w-5 h-5 text-green-400" />
                <p className="text-gray-300 text-sm">+91 8429168953</p>
              </div>

              <div className="flex items-center gap-3">
                <MdEmail className="w-5 h-5 text-green-400" />
                <p className="text-gray-300 text-sm">
                  pankajkumarrajput1116@gmail.com
                </p>
              </div>

              <div className="flex items-center gap-3">
                <LuClock className="w-5 h-5 text-green-400" />
                <p className="text-gray-300 text-sm">24/7 Delivery Available</p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800 text-center py-4 text-gray-400 text-sm">
        ✨ Created by Pankaj Kumar Rajput ✨  
        © 2026 FoodExpress. All rights reserved.
      </div>

    </footer>
  );
}

export default Footer;