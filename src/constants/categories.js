import { TiThSmallOutline } from 'react-icons/ti';
import {
  MdOutlineFreeBreakfast,
  MdOutlineFoodBank,
  MdOutlineRestaurantMenu,
  MdOutlineIcecream,
  MdOutlineLocalCafe,
} from 'react-icons/md';
import { TbSoup } from 'react-icons/tb';
import { CiBowlNoodles } from 'react-icons/ci';
import { GiFullPizza, GiHamburger } from 'react-icons/gi';

export const BASE_CATEGORY_ORDER = [
  'Breakfast',
  'Soup',
  'Pasta',
  'Main Course',
  'Pizza',
  'Burger',
  'Dessert',
  'Beverages',
];

export const CATEGORY_ICONS = {
  All: TiThSmallOutline,
  Breakfast: MdOutlineFreeBreakfast,
  Soup: TbSoup,
  Pasta: CiBowlNoodles,
  'Main Course': MdOutlineFoodBank,
  Pizza: GiFullPizza,
  Burger: GiHamburger,
  Dessert: MdOutlineIcecream,
  Beverages: MdOutlineLocalCafe,
};

export function getCategoryIcon(categoryName) {
  return CATEGORY_ICONS[categoryName] || MdOutlineRestaurantMenu;
}

export function buildCategoryList(menuItems = []) {
  const fromMenu = new Set(menuItems.map((item) => item.food_category));
  const ordered = BASE_CATEGORY_ORDER.filter((category) => fromMenu.has(category));
  const extras = [...fromMenu]
    .filter((category) => !BASE_CATEGORY_ORDER.includes(category))
    .sort();
  return ['All', ...ordered, ...extras];
}

export function getCategoryCounts(menuItems = []) {
  const counts = { All: menuItems.length };
  for (const item of menuItems) {
    counts[item.food_category] = (counts[item.food_category] || 0) + 1;
  }
  return counts;
}
