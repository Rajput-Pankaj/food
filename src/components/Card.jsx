import { Link } from 'react-router-dom';
import { MdLocalFireDepartment } from 'react-icons/md';
import { LuDrumstick, LuLeaf } from 'react-icons/lu';
import { MENU_PLACEHOLDER_IMAGE } from '../constants/menu';

function Card({
  id,
  name,
  image,
  price,
  type,
  calories,
  onAddToCart,
  variant = 'grid',
}) {
  const isVeg = type === 'veg';
  const detailPath = id ? `/food/${id}` : null;

  const title = detailPath ? (
    <Link to={detailPath} className="hover:text-green-600 transition-colors">
      {name}
    </Link>
  ) : (
    name
  );

  const imageElement = (
    <img
      src={image}
      alt={name}
      className="absolute inset-0 block w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
      loading="lazy"
      onError={(event) => {
        event.currentTarget.src = MENU_PLACEHOLDER_IMAGE;
      }}
    />
  );

  const imageBlock = detailPath ? (
    <Link to={detailPath} className="absolute inset-0 block">
      {imageElement}
    </Link>
  ) : (
    imageElement
  );

  if (variant === 'list') {
    return (
      <div className="w-full bg-white dark:bg-gray-800 p-4 rounded-lg flex flex-col sm:flex-row gap-4 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative w-full sm:w-40 h-40 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
          {imageBlock}
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">{title}</h3>
            <div className="flex flex-wrap items-center gap-2 text-sm font-medium mb-2">
              {isVeg ? (
                <span className="flex items-center gap-1 text-green-600">
                  <LuLeaf /> Veg
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-600">
                  <LuDrumstick /> Non-Veg
                </span>
              )}
              {calories && (
                <span className="inline-flex items-center gap-1 text-orange-600">
                  <MdLocalFireDepartment className="w-4 h-4" />
                  {calories} kcal
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 mt-2">
            <div className="text-lg font-bold text-green-600">Rs.{price}/-</div>
            <div className="flex items-center gap-2">
              {detailPath && (
                <Link
                  to={detailPath}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:border-green-500 hover:text-green-600 text-sm font-semibold transition-colors duration-200 cursor-pointer"
                >
                  Details
                </Link>
              )}
              <button
                className="px-5 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer transition-all font-semibold"
                onClick={onAddToCart}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group w-full max-w-[300px] bg-white dark:bg-gray-800 p-3 rounded-lg flex flex-col gap-3 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="relative w-full h-44 sm:h-48 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700 shrink-0">
        {imageBlock}
      </div>
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
      <div className="w-full flex justify-between items-center gap-2">
        <div className="text-lg font-bold text-green-600">Rs.{price}/-</div>
        <div className="flex flex-col items-end gap-1">
          {isVeg ? (
            <span className="flex items-center gap-1 text-green-600 text-sm font-semibold">
              <LuLeaf /> Veg
            </span>
          ) : (
            <span className="flex items-center gap-1 text-red-600 text-sm font-semibold">
              <LuDrumstick /> Non-Veg
            </span>
          )}
          {calories && (
            <span className="inline-flex items-center gap-1 text-orange-600 text-xs font-semibold">
              <MdLocalFireDepartment className="w-3.5 h-3.5" />
              {calories} kcal
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        {detailPath && (
          <Link
            to={detailPath}
            className="flex-1 py-2.5 text-center border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:border-green-500 hover:text-green-600 text-sm font-semibold transition-colors duration-200"
          >
            Details
          </Link>
        )}
        <button
          className="flex-1 p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 cursor-pointer transition-all font-semibold"
          onClick={onAddToCart}
        >
          Add
        </button>
      </div>
    </div>
  );
}

export default Card;
