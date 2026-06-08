import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { HOME_CATEGORIES } from '../../constants/home';
import { getMenuCategoryUrl } from '../../utils/menuLinks';

export default function CategoryShowcase() {
  return (
    <section className="py-10 sm:py-14 bg-slate-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-green-600 mb-1">
            Explore
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Browse by category</h2>
          <p className="text-sm sm:text-base text-gray-500 mt-2">
            Eight curated collections — from breakfast to beverages, all in one menu.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {HOME_CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.name}
                to={getMenuCategoryUrl(category.name)}
                className="group flex flex-col items-center text-center p-4 sm:p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 hover:-translate-y-0.5 transition-all"
              >
                <span className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                  <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                </span>
                <h3 className="mt-3 text-sm sm:text-base font-bold text-gray-800 group-hover:text-green-700">
                  {category.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1">{category.description}</p>
              </Link>
            );
          })}
        </div>

        <div className="text-center mt-8">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700"
          >
            View full menu
            <LuArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
