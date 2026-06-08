const USERS_KEY = 'foodexpress_users';
const USER_SESSION_KEY = 'foodexpress_user';
const CART_KEY = 'foodexpress_cart';
const ORDERS_KEY = 'foodexpress_orders';
const MENU_OVERRIDES_KEY = 'foodexpress_menu_overrides';
const MENU_CUSTOM_ITEMS_KEY = 'foodexpress_custom_menu_items';
const CUSTOMER_PROFILES_KEY = 'foodexpress_customer_profiles';
const CUSTOMER_ADDRESSES_KEY = 'foodexpress_customer_addresses';
const REVIEWS_KEY = 'foodexpress_reviews';
const BLOG_OVERRIDES_KEY = 'foodexpress_blog_overrides';
const BLOG_CUSTOM_POSTS_KEY = 'foodexpress_blog_custom_posts';
const STORE_SETTINGS_KEY = 'foodexpress_store_settings';

export function getJson(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeKey(key) {
  localStorage.removeItem(key);
}

export const storageKeys = {
  USERS_KEY,
  USER_SESSION_KEY,
  CART_KEY,
  ORDERS_KEY,
  MENU_OVERRIDES_KEY,
  MENU_CUSTOM_ITEMS_KEY,
  CUSTOMER_PROFILES_KEY,
  CUSTOMER_ADDRESSES_KEY,
  REVIEWS_KEY,
  BLOG_OVERRIDES_KEY,
  BLOG_CUSTOM_POSTS_KEY,
  STORE_SETTINGS_KEY,
};
