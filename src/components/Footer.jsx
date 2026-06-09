import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BASE_CATEGORY_ORDER } from '../constants/categories';
import { getMenuCategoryUrl } from '../utils/menuLinks';
import { useStoreSettings } from '../hooks/useStoreSettings';
import StoreLogo from './StoreLogo';
import { MdLocationOn, MdPhone, MdEmail, MdExpandMore } from 'react-icons/md';
import { FaInstagram, FaLinkedin } from 'react-icons/fa';
import { LuClock } from 'react-icons/lu';

function FooterSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-800/60 lg:border-0 pb-4 lg:pb-0 last:border-0">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="lg:hidden w-full flex items-center justify-between py-2 text-left group"
        aria-expanded={open}
      >
        <h4 className="text-base font-semibold text-green-400">{title}</h4>
        <MdExpandMore
          className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <h4 className="hidden lg:block text-lg font-semibold text-green-400 mb-4">{title}</h4>
      <div className={`${open ? 'block' : 'hidden'} lg:block pt-1 lg:pt-0`}>{children}</div>
    </div>
  );
}

function Footer() {
  const { settings } = useStoreSettings();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-10">
          {/* Brand — always visible */}
          <div className="space-y-4 lg:col-span-1 text-center sm:text-left">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <StoreLogo settings={settings} size="lg" showName={false} />
              <div>
                <h3 className="text-xl font-bold">{settings.storeName || 'FoodExpress'}</h3>
                <p className="text-green-400 text-sm">Delicious Food Delivered</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md mx-auto sm:mx-0">
              Bringing the best flavors from around the world to your doorstep.
              Fresh ingredients, authentic recipes, and fast delivery.
            </p>
            <div className="flex justify-center sm:justify-start gap-3">
              <a
                href="mailto:pankajkumarrajput1116@gmail.com"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
                aria-label="Email"
              >
                <MdEmail className="w-5 h-5" />
              </a>
              <a
                href="https://www.instagram.com/pankaj_rajput_1116/?hl=en"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
                aria-label="Instagram"
              >
                <FaInstagram className="w-5 h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/pankaj-kumar-rajput-b2458539b/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-green-500 transition-colors"
                aria-label="LinkedIn"
              >
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FooterSection title="Quick Links" defaultOpen>
              <ul className="space-y-2.5">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/menu', label: 'Menu' },
                  { to: '/about', label: 'About Us' },
                  { to: '/contact', label: 'Contact' },
                  { to: '/blog', label: 'Blog' },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.to}
                      className="text-gray-300 hover:text-green-400 text-sm transition-colors inline-block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>

            <FooterSection title="Food Categories">
              <ul className="space-y-2.5">
                {BASE_CATEGORY_ORDER.map((category) => (
                  <li key={category}>
                    <Link
                      to={getMenuCategoryUrl(category)}
                      className="text-gray-300 hover:text-green-400 text-sm transition-colors inline-block py-0.5"
                    >
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </FooterSection>

            <FooterSection title="Contact Info">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <MdLocationOn className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <p className="text-gray-300 text-sm">
                    123 Food Street, Kanpur City
                    <br />
                    Uttar Pradesh 208027, India
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <MdPhone className="w-5 h-5 text-green-400 shrink-0" />
                  <a
                    href="tel:+918429168953"
                    className="text-gray-300 text-sm hover:text-green-400 transition-colors"
                  >
                    +91 8429168953
                  </a>
                </div>
                <div className="flex items-start gap-3">
                  <MdEmail className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                  <a
                    href="mailto:pankajkumarrajput1116@gmail.com"
                    className="text-gray-300 text-sm hover:text-green-400 transition-colors break-all"
                  >
                    pankajkumarrajput1116@gmail.com
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <LuClock className="w-5 h-5 text-green-400 shrink-0" />
                  <p className="text-gray-300 text-sm">24/7 Delivery Available</p>
                </div>
              </div>
            </FooterSection>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-400 text-xs sm:text-sm leading-relaxed">
            Created by Pankaj Kumar Rajput
            <span className="hidden sm:inline"> · </span>
            <br className="sm:hidden" />
            © {new Date().getFullYear()} FoodExpress. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
