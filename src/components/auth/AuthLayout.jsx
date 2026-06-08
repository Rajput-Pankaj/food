import { MdFastfood, MdDeliveryDining, MdSecurity, MdLocalOffer } from 'react-icons/md';
import PageLayout from '../PageLayout';

const highlights = [
  { icon: MdDeliveryDining, text: 'Fast delivery within 30–45 minutes' },
  { icon: MdLocalOffer, text: 'Free delivery on orders above Rs.500' },
  { icon: MdSecurity, text: 'Secure checkout & order tracking' },
];

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <PageLayout mainClassName="py-8 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden grid lg:grid-cols-2">
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
                    <span className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                      <HighlightIcon className="w-5 h-5" />
                    </span>
                    <span className="text-sm">{item.text}</span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="p-8 sm:p-10 flex flex-col justify-center">
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{title}</h1>
              {subtitle && <p className="text-gray-500 mt-2 text-sm sm:text-base">{subtitle}</p>}
            </div>
            {children}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
