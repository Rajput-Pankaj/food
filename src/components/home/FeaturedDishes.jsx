import { Link } from 'react-router-dom';
import { MdLocalFireDepartment } from 'react-icons/md';
import { LuArrowRight, LuDrumstick, LuLeaf } from 'react-icons/lu';
import { usePersonalizedHome } from '../../hooks/usePersonalizedHome';
import { useMenuItems } from '../../hooks/useMenuItems';
import { matchesDietaryPreference } from '../../utils/homeFilters';

export default function FeaturedDishes() {
  const { items } = useMenuItems();
  const { featuredDishIds, dietaryFilter } = usePersonalizedHome();

  const featured = featuredDishIds
    .map((id) => items.find((item) => item.id === id))
    .filter((item) => item && matchesDietaryPreference({ dietary: item.food_type }, dietaryFilter));

  if (!featured.length) return null;

  return (
    <section className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-green-600 mb-1">
              Chef&apos;s picks
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Customer favorites</h2>
            <p className="text-sm sm:text-base text-gray-500 mt-1">
              Hand-picked for you — explore the full menu for 50+ dishes.
            </p>
          </div>
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-sm font-semibold text-green-600 hover:text-green-700 shrink-0"
          >
            See all dishes
            <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {featured.map((item) => {
            const isVeg = item.food_type === 'veg';
            return (
              <Link
                key={item.id}
                to={`/food/${item.id}`}
                className="group rounded-2xl overflow-hidden border border-gray-100 bg-white shadow-sm hover:shadow-lg hover:border-green-100 transition-all"
              >
                <div className="relative h-40 sm:h-44 overflow-hidden bg-gray-100">
                  <img
                    src={item.food_image}
                    alt={item.food_name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-semibold text-gray-700">
                    {item.food_category}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-1">
                    {item.food_name}
                  </h3>
                  <div className="mt-2 flex items-center justify-between gap-2">
                    <span className="text-green-600 font-bold">Rs.{item.price}/-</span>
                    <span
                      className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                        isVeg ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {isVeg ? <LuLeaf className="w-3 h-3" /> : <LuDrumstick className="w-3 h-3" />}
                    </span>
                  </div>
                  {item.nutrition?.calories && (
                    <p className="mt-1 text-[11px] text-orange-600 inline-flex items-center gap-0.5">
                      <MdLocalFireDepartment className="w-3 h-3" />
                      {item.nutrition.calories} kcal
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
