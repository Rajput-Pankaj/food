import { HOW_IT_WORKS } from '../../constants/home';

export default function HowItWorks() {
  return (
    <section className="py-10 sm:py-14 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600 mb-1">
            Simple process
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">How FoodExpress works</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-5 sm:gap-6">
          {HOW_IT_WORKS.map((item, index) => (
            <article
              key={item.step}
              className="relative rounded-2xl bg-white border border-gray-100 p-6 sm:p-7 shadow-sm"
            >
              {index < HOW_IT_WORKS.length - 1 && (
                <div
                  className="hidden md:block absolute top-1/2 -right-3 w-6 h-0.5 bg-green-200"
                  aria-hidden
                />
              )}
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-xl bg-green-600 text-white text-sm font-bold">
                {item.step}
              </span>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{item.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{item.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
