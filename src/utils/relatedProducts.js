const PAIRING_CATEGORIES = {
  Burger: ['Beverages', 'Dessert', 'Pizza'],
  Pizza: ['Beverages', 'Soup', 'Dessert'],
  Pasta: ['Beverages', 'Soup', 'Main Course'],
  'Main Course': ['Beverages', 'Soup', 'Dessert'],
  Breakfast: ['Beverages', 'Dessert'],
  Soup: ['Main Course', 'Pasta', 'Beverages'],
  Dessert: ['Beverages', 'Breakfast'],
  Beverages: ['Burger', 'Pizza', 'Dessert'],
};

export function getRelatedSections(currentItem, allItems) {
  if (!currentItem) {
    return { sameCategory: [], pairings: [], explore: [] };
  }

  const others = allItems.filter((item) => String(item.id) !== String(currentItem.id));
  const usedIds = new Set();

  const sameCategory = others
    .filter((item) => item.food_category === currentItem.food_category)
    .slice(0, 6);
  sameCategory.forEach((item) => usedIds.add(item.id));

  const pairingCategories =
    PAIRING_CATEGORIES[currentItem.food_category] || ['Beverages', 'Dessert'];
  const pairings = [];

  for (const category of pairingCategories) {
    const match = others.find(
      (item) => item.food_category === category && !usedIds.has(item.id)
    );
    if (match) {
      pairings.push(match);
      usedIds.add(match.id);
    }
  }

  const explore = others
    .filter((item) => !usedIds.has(item.id) && item.food_category !== currentItem.food_category)
    .slice(0, 6);

  return { sameCategory, pairings, explore };
}
