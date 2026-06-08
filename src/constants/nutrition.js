export const EMPTY_NUTRITION = {
  calories: null,
  servingSize: '',
  protein: null,
  carbs: null,
  fat: null,
  fiber: null,
  sugar: null,
  sodium: null,
};

export const NUTRITION_FIELDS = [
  { key: 'protein', label: 'Protein', unit: 'g' },
  { key: 'carbs', label: 'Carbohydrates', unit: 'g' },
  { key: 'fat', label: 'Fat', unit: 'g' },
  { key: 'fiber', label: 'Fiber', unit: 'g' },
  { key: 'sugar', label: 'Sugar', unit: 'g' },
  { key: 'sodium', label: 'Sodium', unit: 'mg' },
];

export function mergeNutrition(base = {}, override = {}) {
  return {
    ...EMPTY_NUTRITION,
    ...base,
    ...override,
  };
}

export function parseNutritionNumber(value) {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) || parsed < 0 ? null : parsed;
}

export function hasNutritionInfo(item) {
  if (!item) return false;
  const nutrition = item.nutrition || {};
  return Boolean(
    nutrition.calories ||
      nutrition.protein ||
      nutrition.carbs ||
      nutrition.fat ||
      item.ingredients ||
      item.details
  );
}

export function getItemCalories(item, quantity = 1) {
  const calories = item?.nutrition?.calories;
  if (!calories) return null;
  return Math.round(calories * quantity);
}

export function getCartCalories(cart = []) {
  return cart.reduce((total, item) => {
    const calories = getItemCalories(item, item.quantity);
    return calories ? total + calories : total;
  }, 0);
}

export function formatNutritionValue(value, unit = 'g') {
  if (value === null || value === undefined || value === '') return '—';
  return `${value}${unit}`;
}
