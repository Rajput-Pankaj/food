import { useState } from 'react';
import { MdExpandLess, MdExpandMore, MdRestaurantMenu } from 'react-icons/md';
import CategoryFilter from './CategoryFilter';
import DietaryFilter from './DietaryFilter';
import { DIETARY_LABELS } from '../constants/dietary';

export default function MenuFilters({
  categories,
  selectedCategory,
  onCategorySelect,
  categoryHref,
  dietaryFilter,
  onDietaryChange,
  hasProfilePreference = false,
  edgeFadeClass = 'from-white',
  title = 'Categories',
  embedded = false,
}) {
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const activeSummary = [
    dietaryFilter !== 'all' ? DIETARY_LABELS[dietaryFilter] : null,
    selectedCategory !== 'All' ? selectedCategory : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const shellClass = embedded
    ? 'space-y-4'
    : 'bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5 space-y-4';

  return (
    <div className={shellClass}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800">Dietary preference</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {hasProfilePreference
              ? 'Default from your profile — change anytime below'
              : 'Filter veg or non-veg items'}
          </p>
        </div>
        <DietaryFilter value={dietaryFilter} onChange={onDietaryChange} />
      </div>

      <div className="border-t border-gray-100 pt-4">
        <button
          type="button"
          onClick={() => setCategoriesOpen((open) => !open)}
          className="w-full flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl border border-gray-200 bg-gray-50/80 text-sm font-medium text-gray-700 hover:border-green-300 hover:bg-green-50/60 transition-colors"
          aria-expanded={categoriesOpen}
          aria-controls="food-category-filter"
        >
          <span className="inline-flex items-center gap-2 min-w-0 text-left">
            <span className="w-8 h-8 rounded-lg bg-green-50 border border-green-100 flex items-center justify-center shrink-0">
              <MdRestaurantMenu className="w-4 h-4 text-green-600" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-gray-800 truncate">
                {categoriesOpen ? 'Hide categories' : `Show ${title.toLowerCase()}`}
              </span>
              {!categoriesOpen && activeSummary ? (
                <span className="block text-xs text-green-600 truncate mt-0.5">
                  Active: {activeSummary}
                </span>
              ) : (
                !categoriesOpen && (
                  <span className="block text-xs text-gray-500 truncate mt-0.5">
                    Tap to browse all food categories
                  </span>
                )
              )}
            </span>
          </span>
          {categoriesOpen ? (
            <MdExpandLess className="w-5 h-5 shrink-0 text-gray-500" />
          ) : (
            <MdExpandMore className="w-5 h-5 shrink-0 text-gray-500" />
          )}
        </button>

        {categoriesOpen && (
          <div id="food-category-filter" className="mt-3">
            <div className="sm:hidden">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={onCategorySelect}
                categoryHref={categoryHref}
                edgeFadeClass={edgeFadeClass}
                variant="compact"
              />
            </div>
            <div className="hidden sm:block">
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelect={onCategorySelect}
                categoryHref={categoryHref}
                edgeFadeClass={edgeFadeClass}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
