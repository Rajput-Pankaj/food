import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  MdLocalFireDepartment,
  MdSchedule,
  MdWarning,
} from 'react-icons/md';
import { LuDrumstick, LuLeaf } from 'react-icons/lu';
import PageLayout from '../components/PageLayout';
import FoodImageGallery from '../components/FoodImageGallery';
import {
  FoodAddToCartInline,
  FoodAddToCartSticky,
} from '../components/FoodAddToCartPanel';
import RelatedFoodCarousel from '../components/RelatedFoodCarousel';
import { useCart } from '../context/CartContext';
import { useMenuItem } from '../hooks/useMenuItem';
import { useMenuItems } from '../hooks/useMenuItems';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import {
  formatNutritionValue,
  getItemCalories,
  hasNutritionInfo,
  NUTRITION_FIELDS,
} from '../constants/nutrition';
import { getItemGallery } from '../utils/menuImages';
import { getMenuCategoryUrl } from '../utils/menuLinks';
import { getRelatedSections } from '../utils/relatedProducts';

export default function FoodDetail() {
  const { id } = useParams();
  const { item } = useMenuItem(id);
  const { items: menuItems } = useMenuItems();
  const { addItemsToCart } = useCart();
  const [quantity, setQuantity] = useState(1);

  useDocumentTitle(item?.food_name || 'Food Details');

  useEffect(() => {
    setQuantity(1);
  }, [id]);

  const related = useMemo(
    () => (item ? getRelatedSections(item, menuItems) : { sameCategory: [], pairings: [], explore: [] }),
    [item, menuItems]
  );

  if (!item) {
    return (
      <PageLayout mainClassName="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-5xl mb-4">🍽️</p>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Item not found</h1>
        <p className="text-gray-500 mb-6">This dish may be unavailable or removed from the menu.</p>
        <Link
          to="/menu"
          className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700"
        >
          Browse Menu
        </Link>
      </PageLayout>
    );
  }

  const isVeg = item.food_type === 'veg';
  const nutrition = item.nutrition || {};
  const totalCalories = getItemCalories(item, quantity);
  const showNutrition = hasNutritionInfo(item);
  const gallery = getItemGallery(item);

  const lineTotal = item.price * quantity;

  const handleDecrease = () => setQuantity((value) => Math.max(1, value - 1));
  const handleIncrease = () => setQuantity((value) => value + 1);

  const handleAddToCart = () => {
    addItemsToCart([{ ...item, quantity }]);
  };

  const sameCategoryTitle =
    item.food_category === 'Burger'
      ? 'More Burgers'
      : item.food_category === 'Pizza'
        ? 'More Pizzas'
        : `More ${item.food_category}`;

  return (
    <PageLayout mainClassName="pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-10">
      <div className="bg-gradient-to-b from-green-50/80 via-white to-slate-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-2">
          <nav className="text-xs sm:text-sm text-gray-500 flex flex-wrap items-center gap-1.5" aria-label="Breadcrumb">
            <Link to="/menu" className="hover:text-green-600 transition-colors">
              Menu
            </Link>
            <span>/</span>
            <Link
              to={getMenuCategoryUrl(item.food_category)}
              className="hover:text-green-600 transition-colors"
            >
              {item.food_category}
            </Link>
            <span>/</span>
            <span className="text-gray-800 font-medium truncate max-w-[12rem] sm:max-w-none">
              {item.food_name}
            </span>
          </nav>
        </div>

        <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-8">
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-10 items-start">
            <FoodImageGallery images={gallery} alt={item.food_name} />

            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide bg-white text-gray-600 px-2.5 py-1 rounded-full border border-gray-200">
                  {item.food_category}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                    isVeg ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}
                >
                  {isVeg ? <LuLeaf className="w-3.5 h-3.5" /> : <LuDrumstick className="w-3.5 h-3.5" />}
                  {isVeg ? 'Veg' : 'Non-Veg'}
                </span>
                {nutrition.calories && (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-100 text-orange-700">
                    <MdLocalFireDepartment className="w-3.5 h-3.5" />
                    {nutrition.calories} kcal
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                {item.food_name}
              </h1>

              <p className="text-2xl sm:text-3xl font-bold text-green-600">Rs.{item.price}/-</p>

              {item.description && (
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{item.description}</p>
              )}

              {item.details && (
                <p className="text-sm text-gray-500 leading-relaxed">{item.details}</p>
              )}

              <div className="flex flex-wrap gap-2 text-sm">
                {item.prepTime && (
                  <span className="inline-flex items-center gap-1.5 bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600">
                    <MdSchedule className="w-4 h-4 text-green-600" />
                    {item.prepTime} min prep
                  </span>
                )}
                {nutrition.servingSize && (
                  <span className="inline-flex items-center bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600">
                    Serving: {nutrition.servingSize}
                  </span>
                )}
              </div>

              <div className="hidden md:block pt-2">
                <FoodAddToCartInline
                  quantity={quantity}
                  onDecrease={handleDecrease}
                  onIncrease={handleIncrease}
                  onAddToCart={handleAddToCart}
                  unitPrice={item.price}
                  totalPrice={lineTotal}
                  totalCalories={totalCalories}
                  itemName={item.food_name}
                />
              </div>
            </div>
          </div>

          {showNutrition && (
            <div className="mt-8 sm:mt-10 grid md:grid-cols-2 gap-4 sm:gap-6">
              {nutrition.calories && (
                <section className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 sm:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                      <MdLocalFireDepartment className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-800">Calories per serving</h2>
                      <p className="text-3xl sm:text-4xl font-bold text-orange-600 mt-1">
                        {nutrition.calories}
                        <span className="text-base font-semibold text-orange-500 ml-1">kcal</span>
                      </p>
                      {nutrition.servingSize && (
                        <p className="text-sm text-gray-600 mt-2">Serving size: {nutrition.servingSize}</p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Nutrition Facts</h2>
                <dl className="space-y-2">
                  {NUTRITION_FIELDS.map((field) => (
                    <div
                      key={field.key}
                      className="flex items-center justify-between gap-4 py-2 border-b border-gray-100 last:border-0"
                    >
                      <dt className="text-sm text-gray-600">{field.label}</dt>
                      <dd className="text-sm font-semibold text-gray-800">
                        {formatNutritionValue(nutrition[field.key], field.unit)}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>

              {item.ingredients && (
                <section className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm">
                  <h2 className="text-lg font-bold text-gray-800 mb-3">Ingredients</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.ingredients}</p>
                </section>
              )}

              {item.allergens && (
                <section className="bg-red-50 border border-red-100 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-3 inline-flex items-center gap-2">
                    <MdWarning className="w-5 h-5 text-red-500" />
                    Allergen Information
                  </h2>
                  <p className="text-sm text-red-700 leading-relaxed">{item.allergens}</p>
                </section>
              )}
            </div>
          )}

          <div className="mt-10 sm:mt-12 space-y-8 sm:space-y-10">
            <RelatedFoodCarousel
              title={sameCategoryTitle}
              subtitle={`Other ${item.food_category.toLowerCase()} options you might enjoy`}
              items={related.sameCategory}
            />
            <RelatedFoodCarousel
              title="Goes great with"
              subtitle="Popular pairings — drinks, sides & more"
              items={related.pairings}
            />
            <RelatedFoodCarousel
              title="You may also like"
              subtitle="Explore more from our menu"
              items={related.explore}
            />
          </div>
        </div>
      </div>

      <FoodAddToCartSticky
        quantity={quantity}
        onDecrease={handleDecrease}
        onIncrease={handleIncrease}
        onAddToCart={handleAddToCart}
        totalPrice={lineTotal}
        totalCalories={totalCalories}
      />
    </PageLayout>
  );
}
