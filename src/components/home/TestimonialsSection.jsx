import { usePersonalizedHome } from '../../hooks/usePersonalizedHome';

function Stars({ count }) {
  return (
    <span className="text-amber-400 text-sm" aria-label={`${count} out of 5 stars`}>
      {'★'.repeat(count)}
      <span className="text-gray-200">{'★'.repeat(5 - count)}</span>
    </span>
  );
}

function TestimonialCard({ item }) {
  return (
    <blockquote className="h-full rounded-2xl bg-white/5 border border-white/10 p-5 sm:p-6 backdrop-blur-sm flex flex-col">
      <Stars count={item.rating} />
      <p className="mt-4 text-sm sm:text-base text-gray-200 leading-relaxed flex-1">
        &ldquo;{item.quote}&rdquo;
      </p>
      <footer className="mt-5 pt-4 border-t border-white/10">
        <p className="font-semibold text-white">{item.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{item.role}</p>
      </footer>
    </blockquote>
  );
}

export default function TestimonialsSection() {
  const { testimonials } = usePersonalizedHome();

  if (!testimonials.length) return null;

  return (
    <section className="py-10 sm:py-14 bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-400 mb-1">
            Testimonials
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold">Loved by foodies</h2>
          <p className="text-sm sm:text-base text-gray-400 mt-2">
            Real feedback from customers who order with us every week.
          </p>
        </div>

        <div className="flex sm:grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((item) => (
            <div key={item.name} className="min-w-[82%] sm:min-w-0 snap-start">
              <TestimonialCard item={item} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
