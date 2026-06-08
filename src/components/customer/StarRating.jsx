import { MdStar, MdStarBorder } from 'react-icons/md';

export default function StarRating({ value, onChange, readOnly = false, size = 'md' }) {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5';

  return (
    <div className="flex items-center gap-0.5" role={readOnly ? 'img' : 'group'} aria-label={`Rating: ${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= value;
        const Icon = filled ? MdStar : MdStarBorder;

        if (readOnly) {
          return (
            <Icon
              key={star}
              className={`${sizeClass} ${filled ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          );
        }

        return (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-0.5 text-yellow-400 hover:scale-110 transition-transform"
            aria-label={`Rate ${star} stars`}
          >
            <Icon className={sizeClass} />
          </button>
        );
      })}
    </div>
  );
}
