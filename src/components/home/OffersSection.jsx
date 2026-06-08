import { Link } from 'react-router-dom';
import { LuTag } from 'react-icons/lu';
import { usePersonalizedHome } from '../../hooks/usePersonalizedHome';

export default function OffersSection() {
  const { offers } = usePersonalizedHome();

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-600 mb-1">
              Limited time
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Offers & deals</h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Save more on every order with exclusive FoodExpress promotions.
            </p>
          </div>
          <Link
            to="/menu"
            className="text-sm font-semibold text-green-600 hover:text-green-700 shrink-0"
          >
            Order with offers →
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {offers.map((offer) => (
            <article
              key={offer.id}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-lg transition-all"
            >
              <div className={`h-1.5 bg-gradient-to-r ${offer.gradient}`} />
              <div className="p-5 sm:p-6">
                <span className="text-3xl" aria-hidden>
                  {offer.icon}
                </span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{offer.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{offer.description}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-100 text-xs font-semibold text-gray-700">
                  <LuTag className="w-3.5 h-3.5 text-green-600" />
                  {offer.code}
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
