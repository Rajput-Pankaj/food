import { LuDrumstick, LuLeaf } from 'react-icons/lu';
import { DIETARY_OPTIONS } from '../constants/dietary';

const optionMeta = {
  all: { icon: null, activeClass: 'bg-white text-gray-900 shadow-sm' },
  veg: {
    icon: LuLeaf,
    activeClass: 'bg-green-600 text-white shadow-sm',
    idleIconClass: 'text-green-600',
  },
  non_veg: {
    icon: LuDrumstick,
    activeClass: 'bg-red-500 text-white shadow-sm',
    idleIconClass: 'text-red-500',
  },
};

export default function DietaryFilter({ value, onChange }) {
  return (
    <div
      className="grid grid-cols-3 gap-1 bg-gray-100/90 rounded-xl p-1 w-full sm:w-[min(100%,20rem)]"
      role="group"
      aria-label="Dietary filter"
    >
      {DIETARY_OPTIONS.map((option) => {
        const isActive = value === option.value;
        const meta = optionMeta[option.value];
        const Icon = meta.icon;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg px-2 py-2.5 text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 min-h-[2.5rem] ${
              isActive
                ? meta.activeClass
                : 'text-gray-600 hover:bg-white/70 hover:text-gray-800'
            }`}
          >
            {Icon && (
              <Icon
                className={`w-4 h-4 shrink-0 ${
                  isActive ? 'text-current' : meta.idleIconClass
                }`}
              />
            )}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}
