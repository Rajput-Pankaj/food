import { resolveMediaUrl } from '../utils/mediaUrl';
import { MdFastfood } from 'react-icons/md';

const SIZE_CLASSES = {
  sm: { box: 'w-9 h-9 sm:w-11 sm:h-11', icon: 'w-5 h-5 sm:w-7 sm:h-7' },
  md: { box: 'w-10 h-10', icon: 'w-6 h-6' },
  lg: { box: 'w-24 h-24', icon: 'w-12 h-12' },
};

/** Logo mark only — green box with custom image or default burger icon. */
export function StoreLogoMark({ storeLogo, storeName = 'FoodExpress', size = 'md', className = '' }) {
  const logoUrl = storeLogo ? resolveMediaUrl(storeLogo) : null;
  const { box, icon } = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div
      className={`${box} bg-green-500 rounded-lg flex items-center justify-center shrink-0 overflow-hidden ${className}`}
    >
      {logoUrl ? (
        <img src={logoUrl} alt={`${storeName} logo`} className="w-full h-full object-cover" />
      ) : (
        <MdFastfood className={`${icon} text-white`} />
      )}
    </div>
  );
}

export default function StoreLogo({ settings, size = 'md', showName = true, className = '' }) {
  const name = settings?.storeName || 'FoodExpress';

  return (
    <div className={`flex items-center gap-2 sm:gap-3 shrink-0 min-w-0 ${className}`}>
      <StoreLogoMark storeLogo={settings?.storeLogo} storeName={name} size={size} />
      {showName && (
        <div className="min-w-0">
          <p className="text-base sm:text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight truncate">
            {name}
          </p>
        </div>
      )}
    </div>
  );
}
