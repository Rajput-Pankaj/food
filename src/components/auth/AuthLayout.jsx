import { MdFastfood, MdDeliveryDining, MdSecurity, MdLocalOffer } from 'react-icons/md';
import PageLayout from '../PageLayout';
import { useStoreSettings } from '../../hooks/useStoreSettings';

export default function AuthLayout({ title, subtitle, children }) {
  const { settings } = useStoreSettings();

  const highlights = [
    { icon: MdDeliveryDining, text: 'Fast delivery within 30–45 minutes' },
    {
      icon: MdLocalOffer,
      text: `Free delivery on orders above Rs.${settings.freeDeliveryThreshold}`,
    },
    { icon: MdSecurity, text: 'Secure checkout & order tracking' },
  ];

  return (
    <PageLayout mainClassName="py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-2 transition-colors duration-200">
          <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-green-600 to-green-800 text-white p-10">
            <div>
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <MdFastfood className="w-8 h-8" />
              </div>
              <h2 className="text-3xl font-bold mb-3">FoodExpress</h2>
              <p className="text-green-100 text-lg leading-relaxed">
                Delicious food delivered fresh to your doorstep. Order, track, and enjoy!
              </p>
            </div>

            <ul className="space-y-4 mt-10">
              {highlights.map((item) => {
                const HighlightIcon = item.icon;
                return (
                  <li key={item.text} className="flex items-center gap-3 text-green-50">
                    <HighlightIcon className="w-5 h-5 shrink-0 text-green-200" />
                    <span>{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-6 sm:p-8 lg:p-10">
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
              {subtitle && <p className="text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
