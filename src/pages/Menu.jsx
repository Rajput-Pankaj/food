import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import PageLayout from '../components/PageLayout';
import MenuFilters from '../components/MenuFilters';
import Card from '../components/Card';
import { MdSort, MdGridOn, MdViewList } from 'react-icons/md';
import { useCart } from '../context/CartContext';
import { useMenuItems } from '../hooks/useMenuItems';
import { useDietaryFilter } from '../hooks/useDietaryFilter';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { buildCategoryList } from '../constants/categories';
import { filterMenuByFuzzyQuery } from '../utils/fuzzySearch';
import { buildMenuSearchParams, getMenuUrl, parseMenuCategory } from '../utils/menuLinks';

function Menu() {
  useDocumentTitle('Menu');
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('q') || '');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const { addToCart } = useCart();
  const { items: food_items } = useMenuItems();
  const { dietaryFilter, setDietaryFilter, hasProfilePreference } = useDietaryFilter();

  const categories = useMemo(() => buildCategoryList(food_items), [food_items]);

  useEffect(() => {
    setSearchQuery(searchParams.get('q') || '');
    setSelectedCategory(parseMenuCategory(searchParams, categories));
  }, [searchParams, categories]);

  const handleCategorySelect = useCallback(
    (category) => {
      setSelectedCategory(category);
      const params = buildMenuSearchParams(
        { category, query: searchQuery },
        searchParams
      );
      setSearchParams(params, { replace: true });
    },
    [searchParams, searchQuery, setSearchParams]
  );

  const handleSearchQueryChange = useCallback(
    (query) => {
      setSearchQuery(query);
      const params = buildMenuSearchParams(
        { category: selectedCategory, query },
        searchParams
      );
      if (getMenuUrl(params) !== getMenuUrl(searchParams)) {
        setSearchParams(params, { replace: true });
      }
    },
    [searchParams, selectedCategory, setSearchParams]
  );

  const filteredAndSortedItems = filterMenuByFuzzyQuery(food_items, searchQuery, {
    category: selectedCategory,
    dietary: dietaryFilter,
  }).sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.food_name.localeCompare(b.food_name);
      case 'price-low':
        return a.price - b.price;
      case 'price-high':
        return b.price - a.price;
      case 'type':
        return a.food_type.localeCompare(b.food_type);
      default:
        return 0;
    }
  });

  return (
    <PageLayout searchQuery={searchQuery} setSearchQuery={handleSearchQueryChange}>
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">Our Menu</h1>
          <p className="text-green-100 text-sm sm:text-base lg:text-lg">
            Discover our delicious selection of fresh and authentic dishes
          </p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-5 space-y-4">
          <MenuFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            dietaryFilter={dietaryFilter}
            onDietaryChange={setDietaryFilter}
            hasProfilePreference={hasProfilePreference}
            title="Categories"
            embedded={false}
          />

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-3 sm:px-4 py-3">
            <p className="text-xs sm:text-sm text-gray-500 order-2 sm:order-1">
              {filteredAndSortedItems.length}{' '}
              {filteredAndSortedItems.length === 1 ? 'item' : 'items'} found
            </p>

            <div className="flex items-center gap-2 sm:gap-4 order-1 sm:order-2">
              <div className="flex items-center gap-2 flex-1 sm:flex-none">
                <MdSort className="w-5 h-5 text-gray-600 shrink-0 hidden sm:block" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-green-500 bg-white dark:bg-gray-800 dark:text-gray-100"
                  aria-label="Sort menu items"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="type">Sort by Type</option>
                </select>
              </div>

              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors duration-200 cursor-pointer ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                  aria-label="Grid view"
                >
                  <MdGridOn className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors duration-200 cursor-pointer ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-600 text-green-600 dark:text-green-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100'
                  }`}
                  aria-label="List view"
                >
                  <MdViewList className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
          {filteredAndSortedItems.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid gap-4 sm:gap-6 grid-cols-1 min-[400px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 justify-items-center'
                  : 'flex flex-col gap-4 max-w-3xl mx-auto'
              }
            >
              {filteredAndSortedItems.map((item) => (
                <Card
                  key={item.id}
                  id={item.id}
                  name={item.food_name}
                  image={item.food_image}
                  price={item.price}
                  type={item.food_type}
                  calories={item.nutrition?.calories}
                  variant={viewMode === 'list' ? 'list' : 'grid'}
                  onAddToCart={() => addToCart(item)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16">
              <div className="text-5xl sm:text-6xl mb-4">🍽️</div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No items found</h3>
              <p className="text-sm sm:text-base text-gray-500 px-4">
                Try a different category or dietary filter
                {searchQuery ? ` for "${searchQuery}"` : ''}.
              </p>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}

export default Menu;
