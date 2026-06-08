import { useState } from 'react';
import { MENU_PLACEHOLDER_IMAGE } from '../constants/menu';

export default function FoodImageGallery({ images, alt }) {
  const gallery = images?.length ? images : [MENU_PLACEHOLDER_IMAGE];
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = gallery[activeIndex] || MENU_PLACEHOLDER_IMAGE;

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden bg-gray-100 shadow-lg aspect-[4/3] sm:aspect-[5/4] min-h-[220px] sm:min-h-[320px]">
        <img
          src={activeImage}
          alt={alt}
          className="absolute inset-0 block w-full h-full object-cover object-center transition-opacity duration-300"
          onError={(event) => {
            event.currentTarget.src = MENU_PLACEHOLDER_IMAGE;
          }}
        />
        {gallery.length > 1 && (
          <span className="absolute bottom-3 right-3 text-xs font-semibold bg-black/55 text-white px-2.5 py-1 rounded-full">
            {activeIndex + 1} / {gallery.length}
          </span>
        )}
      </div>

      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {gallery.map((image, index) => (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`relative shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all bg-gray-100 ${
                activeIndex === index
                  ? 'border-green-500 ring-2 ring-green-500/20'
                  : 'border-gray-200 opacity-80 hover:opacity-100'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image}
                alt=""
                className="absolute inset-0 block w-full h-full object-cover object-center"
                onError={(event) => {
                  event.currentTarget.src = MENU_PLACEHOLDER_IMAGE;
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
