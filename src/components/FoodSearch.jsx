import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LuDrumstick, LuLeaf, LuSearch, LuX } from 'react-icons/lu';
import { MdLocalFireDepartment } from 'react-icons/md';
import { useMenuItems } from '../hooks/useMenuItems';
import { MENU_PLACEHOLDER_IMAGE } from '../constants/menu';
import { highlightMatch, searchMenuItems } from '../utils/fuzzySearch';
import { buildMenuSearchParams, getMenuUrl } from '../utils/menuLinks';

export default function FoodSearch({
  value = '',
  onChange,
  variant = 'desktop',
  onClose,
  autoFocus = false,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const { items } = useMenuItems();
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => searchMenuItems(items, value, 8), [items, value]);
  const showDropdown = isOpen && value.trim().length > 0;

  const closeDropdown = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  const handleSelect = useCallback(
    (item) => {
      onChange?.('');
      closeDropdown();
      onClose?.();
      navigate(`/food/${item.id}`);
    },
    [closeDropdown, navigate, onChange, onClose]
  );

  const handleViewAll = useCallback(() => {
    const query = value.trim();
    closeDropdown();
    onClose?.();
    const params = buildMenuSearchParams(
      { query },
      new URLSearchParams(location.search)
    );
    navigate(getMenuUrl(params));
  }, [closeDropdown, location.search, navigate, onClose, value]);

  useEffect(() => {
    if (autoFocus) {
      inputRef.current?.focus();
    }
  }, [autoFocus]);

  useEffect(() => {
    setActiveIndex(-1);
  }, [value, results.length]);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [closeDropdown]);

  const handleKeyDown = (event) => {
    if (!showDropdown) {
      if (event.key === 'ArrowDown' && value.trim()) {
        setIsOpen(true);
        setActiveIndex(0);
        event.preventDefault();
      }
      return;
    }

    const totalOptions = results.length + 1;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % totalOptions);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? totalOptions - 1 : index - 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      } else if (activeIndex === results.length || results.length === 0) {
        handleViewAll();
      }
    } else if (event.key === 'Escape') {
      closeDropdown();
      inputRef.current?.blur();
    }
  };

  const shellClass =
    variant === 'mobile'
      ? 'relative w-full'
      : 'relative hidden lg:block flex-1 max-w-[220px] xl:max-w-sm mx-2';

  const inputShellClass =
    variant === 'mobile'
      ? 'flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-3 rounded-xl border border-transparent focus-within:border-green-400 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-green-100 dark:focus-within:ring-green-900/30 transition-all duration-200'
      : 'flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border border-transparent focus-within:border-green-400 focus-within:bg-white dark:focus-within:bg-gray-800 focus-within:ring-2 focus-within:ring-green-100 dark:focus-within:ring-green-900/30 transition-all duration-200';

  return (
    <div ref={containerRef} className={shellClass}>
      <div className={inputShellClass}>
        <LuSearch className="text-gray-500 shrink-0 w-4 h-4" />
        <input
          ref={inputRef}
          type="text"
          inputMode="search"
          enterKeyHint="search"
          value={value}
          onChange={(event) => {
            onChange?.(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => value.trim() && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search dishes, categories..."
          className="food-search-input bg-transparent outline-none w-full min-w-0 text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500"
          aria-label="Search food"
          aria-expanded={showDropdown}
          aria-controls="food-search-results"
          aria-autocomplete="list"
          role="combobox"
          autoComplete="off"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange?.('');
              closeDropdown();
              inputRef.current?.focus();
            }}
            className="p-0.5 rounded text-gray-400 hover:text-gray-600"
            aria-label="Clear search"
          >
            <LuX className="w-4 h-4" />
          </button>
        )}
      </div>

      {showDropdown && (
        <div
          id="food-search-results"
          role="listbox"
          className={`absolute z-50 mt-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl overflow-hidden ${
            variant === 'mobile' ? 'left-0 right-0' : 'left-0 right-0 min-w-[20rem]'
          }`}
        >
          {results.length > 0 ? (
            <ul className="max-h-[min(24rem,70vh)] overflow-y-auto custom-scrollbar py-1">
              {results.map((item, index) => {
                const isVeg = item.food_type === 'veg';
                const isActive = activeIndex === index;

                return (
                  <li key={item.id} role="option" aria-selected={isActive}>
                    <button
                      type="button"
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => handleSelect(item)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors duration-200 cursor-pointer ${
                        isActive ? 'bg-green-50 dark:bg-green-900/30' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <img
                        src={item.food_image}
                        alt=""
                        className="w-12 h-12 rounded-lg object-cover shrink-0 bg-gray-100"
                        onError={(event) => {
                          event.currentTarget.src = MENU_PLACEHOLDER_IMAGE;
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">
                          {highlightMatch(item.food_name, value).map((part, partIndex) =>
                            part.match ? (
                              <mark
                                key={partIndex}
                                className="bg-yellow-200 text-gray-900 rounded px-0.5"
                              >
                                {part.text}
                              </mark>
                            ) : (
                              <span key={partIndex}>{part.text}</span>
                            )
                          )}
                        </p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">
                          {item.food_category}
                          {item.nutrition?.calories && (
                            <span className="text-orange-600 ml-2 inline-flex items-center gap-0.5">
                              <MdLocalFireDepartment className="w-3 h-3" />
                              {item.nutrition.calories} kcal
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-green-600">Rs.{item.price}/-</p>
                        <span
                          className={`inline-flex items-center gap-0.5 text-[10px] font-semibold mt-0.5 ${
                            isVeg ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {isVeg ? <LuLeaf className="w-3 h-3" /> : <LuDrumstick className="w-3 h-3" />}
                          {isVeg ? 'Veg' : 'Non-Veg'}
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-4 py-6 text-center text-sm text-gray-500">
              No dishes found for &quot;{value.trim()}&quot;
            </div>
          )}

          <div className="border-t border-gray-100 dark:border-gray-700 p-2 bg-gray-50/80 dark:bg-gray-900/50">
            <button
              type="button"
              onMouseEnter={() => setActiveIndex(results.length)}
              onClick={handleViewAll}
              className={`w-full text-center text-sm font-semibold py-2 rounded-lg transition-colors ${
                activeIndex === results.length
                  ? 'bg-green-100 text-green-700'
                  : 'text-green-600 hover:bg-green-50'
              }`}
            >
              {results.length > 0
                ? `View all results for "${value.trim()}"`
                : `Browse menu for "${value.trim()}"`}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
