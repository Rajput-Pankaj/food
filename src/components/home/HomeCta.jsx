import { Link } from 'react-router-dom';
import { LuArrowRight, LuUtensilsCrossed } from 'react-icons/lu';

export default function HomeCta() {
  return (
    <section className="py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 text-white px-6 sm:px-10 lg:px-14 py-10 sm:py-14 lg:py-16">
          <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" aria-hidden />
          <div className="absolute -left-10 -bottom-10 w-56 h-56 rounded-full bg-emerald-400/20 blur-2xl" aria-hidden />

          <div className="relative max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-sm font-medium mb-4">
              <LuUtensilsCrossed className="w-4 h-4" />
              Hungry now?
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">
              Your next favorite meal is one tap away
            </h2>
            <p className="mt-3 sm:mt-4 text-green-50 text-sm sm:text-base leading-relaxed">
              Browse 50+ dishes, apply offers, and get fresh food delivered fast. Sign up today and
              enjoy 20% off your first order.
            </p>
            <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
              <Link
                to="/menu"
                className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-6 py-3.5 rounded-xl font-bold hover:bg-green-50 transition-colors"
              >
                Start Ordering
                <LuArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/40 px-6 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
