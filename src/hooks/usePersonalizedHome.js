import { useMemo } from 'react';
import {
  FEATURED_DISH_IDS,
  HERO_SLIDES,
  HOME_OFFERS,
  HOME_TESTIMONIALS,
} from '../constants/home';
import { filterHomeContent } from '../utils/homeFilters';
import { useDietaryFilter } from './useDietaryFilter';

export function usePersonalizedHome() {
  const { dietaryFilter, hasProfilePreference } = useDietaryFilter();

  const slides = useMemo(() => {
    const filtered = filterHomeContent(HERO_SLIDES, dietaryFilter);
    if (dietaryFilter === 'veg') {
      return [...filtered].sort((a, b) => {
        const rank = (slide) => (slide.dietary === 'veg' ? 0 : 1);
        return rank(a) - rank(b);
      });
    }
    return filtered;
  }, [dietaryFilter]);

  const offers = useMemo(
    () => filterHomeContent(HOME_OFFERS, dietaryFilter),
    [dietaryFilter]
  );

  const testimonials = useMemo(
    () => filterHomeContent(HOME_TESTIMONIALS, dietaryFilter),
    [dietaryFilter]
  );

  const featuredDishIds = useMemo(() => {
    const ids = FEATURED_DISH_IDS[dietaryFilter] || FEATURED_DISH_IDS.all;
    return ids;
  }, [dietaryFilter]);

  return {
    dietaryFilter,
    hasProfilePreference,
    slides,
    offers,
    testimonials,
    featuredDishIds,
  };
}
