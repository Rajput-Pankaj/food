import { Link } from 'react-router-dom';
import { MdLocalFireDepartment } from 'react-icons/md';
import { LuDrumstick, LuLeaf } from 'react-icons/lu';
import { MENU_PLACEHOLDER_IMAGE } from '../constants/menu';

function RelatedFoodCard({ item }) {
  const isVeg = item.food_type === 'veg';

  return (
    <Link
      to={`/food/${item.id}`}
      className="group flex flex-col w-[10rem] sm:w-[11.5rem] h-full bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all overflow-hidden"
    >
      <div className="relative h-28 sm:h-32 w-full shrink-0 overflow-hidden bg-gray-100">
        <img
          src={item.food_image}
          alt={item.food_name}
          className="absolute inset-0 block w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.src = MENU_PLACEHOLDER_IMAGE;
          }}
        />
      </div>

      <div className="flex flex-col flex-1 p-2.5 sm:p-3 min-h-[6.75rem]">
        <p className="text-sm font-semibold text-gray-800 line-clamp-2 leading-snug group-hover:text-green-600">
          {item.food_name}
        </p>
        <p className="text-xs text-gray-500 mt-1 truncate">{item.food_category}</p>

        <div className="mt-auto pt-2 space-y-1">
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-bold text-green-600">Rs.{item.price}/-</span>
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] font-semibold shrink-0 ${
                isVeg ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isVeg ? <LuLeaf className="w-3 h-3" /> : <LuDrumstick className="w-3 h-3" />}
            </span>
          </div>
          <p className="text-[10px] text-orange-600 h-4 inline-flex items-center gap-0.5">
            {item.nutrition?.calories ? (
              <>
                <MdLocalFireDepartment className="w-3 h-3" />
                {item.nutrition.calories} kcal
              </>
            ) : (
              <span className="invisible">0 kcal</span>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default function RelatedFoodCarousel({ title, subtitle, items }) {
  if (!items?.length) return null;

  return (
    <section className="space-y-3 sm:space-y-4">
      <div>
        <h2 className="text-lg sm:text-xl font-bold text-gray-800">{title}</h2>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
        {items.map((item) => (
          <div key={item.id} className="snap-start shrink-0 h-auto">
            <RelatedFoodCard item={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
