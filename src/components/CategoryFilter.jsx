import { Link } from 'react-router-dom';
import { getCategoryIcon } from '../constants/categories';
export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
  categoryHref,
  edgeFadeClass = 'from-white',
  className = '',
  variant = 'default',
}) {
  const isCompact = variant === 'compact';

  return (
    <div className={`relative ${className}`}>
      <div
        className={`pointer-events-none absolute left-0 top-0 bottom-0 w-5 sm:w-8 bg-gradient-to-r ${edgeFadeClass} to-transparent z-10 xl:hidden`}
        aria-hidden
      />
      <div
        className={`pointer-events-none absolute right-0 top-0 bottom-0 w-5 sm:w-8 bg-gradient-to-l ${edgeFadeClass} to-transparent z-10 xl:hidden`}
        aria-hidden
      />

      <div
        className={`flex overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory xl:flex-wrap xl:justify-center xl:overflow-visible ${
          isCompact ? 'gap-2 py-0.5' : 'gap-2 sm:gap-2.5 py-1'
        }`}
        role="tablist"
        aria-label="Food categories"
      >
        {categories.map((category) => {
          const Icon = getCategoryIcon(category);
          const isActive = selectedCategory === category;
          const href = categoryHref?.(category);
          const itemClassName = `group flex flex-col items-center justify-center shrink-0 snap-start rounded-xl border transition-all duration-200 ${
            isCompact
              ? 'min-w-[4.75rem] px-2 py-2 gap-1'
              : 'min-w-[5.25rem] sm:min-w-[5.75rem] px-2.5 sm:px-3 py-2.5 gap-1.5'
          } ${
            isActive
              ? 'bg-green-50 border-green-500 text-green-700 shadow-sm ring-1 ring-green-500/20'
              : 'bg-white border-gray-200 text-gray-600 hover:border-green-300 hover:bg-green-50/50 hover:text-green-700'
          }`;
          const content = (
            <>
              <span
                className={`flex items-center justify-center rounded-lg transition-colors ${
                  isCompact ? 'w-9 h-9' : 'w-10 h-10 sm:w-11 sm:h-11'
                } ${
                  isActive
                    ? 'bg-green-100 text-green-600'
                    : 'bg-gray-50 text-green-600 group-hover:bg-green-100'
                }`}
              >
                <Icon className={isCompact ? 'w-4 h-4' : 'w-5 h-5 sm:w-[1.35rem] sm:h-[1.35rem]'} />
              </span>
              <span
                className={`font-semibold text-center leading-tight whitespace-nowrap ${
                  isCompact ? 'text-[10px]' : 'text-[11px] sm:text-xs'
                } ${category === 'Main Course' ? 'max-w-[5.5rem] truncate' : ''}`}
                title={category}
              >
                {category}
              </span>
            </>
          );

          if (href) {
            return (
              <Link
                key={category}
                to={href}
                role="tab"
                aria-selected={isActive}
                className={itemClassName}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onSelect(category)}
              className={itemClassName}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
}
