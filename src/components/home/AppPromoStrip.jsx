import { Link } from 'react-router-dom';
import { MdDeliveryDining, MdRestaurant, MdSupportAgent } from 'react-icons/md';

const perks = [
  {
    icon: MdDeliveryDining,
    title: 'Fast Delivery',
    text: 'Hot meals in ~30 minutes',
  },
  {
    icon: MdRestaurant,
    title: 'Fresh Ingredients',
    text: 'Chef-crafted every day',
  },
  {
    icon: MdSupportAgent,
    title: '24/7 Support',
    text: 'We are here to help',
  },
];

export default function AppPromoStrip() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 sm:py-8">
        <div className="grid sm:grid-cols-3 gap-4 sm:gap-6">
          {perks.map((perk) => {
            const Icon = perk.icon;
            return (
              <div
                key={perk.title}
                className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <span className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <Icon className="w-6 h-6" />
                </span>
                <div>
                  <p className="font-bold text-gray-900 text-sm sm:text-base">{perk.title}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{perk.text}</p>
                </div>
              </div>
            );
          })}
        </div>
        <p className="text-center text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
          New here?{' '}
          <Link to="/blog" className="text-green-600 font-semibold hover:text-green-700">
            Read food tips on our blog
          </Link>{' '}
          or{' '}
          <Link to="/about" className="text-green-600 font-semibold hover:text-green-700">
            learn our story
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
