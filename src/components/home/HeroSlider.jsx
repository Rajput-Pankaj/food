import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuArrowRight, LuChevronLeft, LuChevronRight } from 'react-icons/lu';
import { usePersonalizedHome } from '../../hooks/usePersonalizedHome';

const TINT_OVERLAYS = {
  green: 'from-green-950/75 via-green-900/35 to-transparent',
  emerald: 'from-emerald-950/70 via-emerald-900/30 to-transparent',
  amber: 'from-amber-950/70 via-orange-900/30 to-transparent',
  rose: 'from-rose-950/70 via-red-900/30 to-transparent',
  teal: 'from-teal-950/70 via-cyan-900/25 to-transparent',
};

export default function HeroSlider() {
  const { slides, dietaryFilter, hasProfilePreference } = usePersonalizedHome();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.length, dietaryFilter]);

  const goTo = useCallback(
    (index) => {
      if (!slides.length) return;
      setActiveIndex((index + slides.length) % slides.length);
    },
    [slides.length]
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (isPaused || slides.length <= 1) return undefined;
    const timer = window.setInterval(goNext, 6000);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, slides.length]);

  if (!slides.length) return null;

  const slide = slides[activeIndex];
  const tintClass = TINT_OVERLAYS[slide.tint] || TINT_OVERLAYS.green;

  return (
    <section
      className="relative overflow-hidden bg-gray-900 min-h-[28rem] sm:min-h-[32rem] lg:min-h-[36rem]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured promotions"
    >
      <div className="absolute inset-0">
        {slides.map((item, index) => (
          <img
            key={item.id}
            src={item.image}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
              index === activeIndex ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
            }`}
            aria-hidden={index !== activeIndex}
          />
        ))}

        {/* Light left scrim for text — food stays visible on the right */}
        <div className={`absolute inset-0 bg-gradient-to-r ${tintClass}`} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/15 to-transparent md:to-black/0" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />
        <div className="absolute inset-y-0 right-0 w-1/2 hidden md:block bg-gradient-to-l from-transparent to-transparent pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-14 sm:py-20 lg:py-28">
        <div className="max-w-xl lg:max-w-2xl">
          {hasProfilePreference && dietaryFilter !== 'all' && (
            <span className="inline-flex items-center mb-3 px-2.5 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] sm:text-xs font-medium text-white/90">
              Personalized for {dietaryFilter === 'veg' ? 'vegetarian' : 'non-veg'} preferences
            </span>
          )}
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white text-xs sm:text-sm font-semibold mb-4 sm:mb-6">
            {slide.badge}
          </span>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-[1.1] whitespace-pre-line drop-shadow-sm">
            {slide.title}
          </h1>
          <p className="mt-4 sm:mt-6 text-sm sm:text-base lg:text-lg text-white/90 leading-relaxed max-w-lg drop-shadow-sm">
            {slide.subtitle}
          </p>
          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              to={slide.ctaLink}
              className="inline-flex items-center justify-center gap-2 bg-white text-green-700 px-6 py-3.5 rounded-xl font-bold hover:bg-green-50 transition-colors shadow-lg"
            >
              {slide.cta}
              <LuArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to={slide.secondaryLink}
              className="inline-flex items-center justify-center gap-2 border-2 border-white/50 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-white/10 transition-colors backdrop-blur-sm"
            >
              {slide.secondaryCta}
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 px-3 sm:px-4 lg:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => goTo(index)}
                className={`h-2 rounded-full transition-all ${
                  index === activeIndex ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          {slides.length > 1 && (
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={goPrev}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur border border-white/25 text-white hover:bg-black/45 transition-colors flex items-center justify-center"
                aria-label="Previous slide"
              >
                <LuChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="w-10 h-10 rounded-full bg-black/30 backdrop-blur border border-white/25 text-white hover:bg-black/45 transition-colors flex items-center justify-center"
                aria-label="Next slide"
              >
                <LuChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
