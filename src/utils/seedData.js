import { adminApi, menuApi } from '../api';
import { USE_API } from '../config/api';
import { MENU_SEED_COUNT, MENU_SEED_VERSION } from '../data/menuSeed';
import { seedDefaultUsers, getUsers } from './authStorage';
import { getAddresses, saveCustomerProfile, addAddress } from './customerStorage';
import { resetBlogStorage } from './blogStorage';
import { getJson, removeKey, setJson, storageKeys } from './storage';

export const SEED_META_KEY = 'foodexpress_seed_meta';

const DEMO_CUSTOMER_EMAIL = 'customer@foodexpress.com';

export function getSeedMeta() {
  return getJson(SEED_META_KEY, null);
}

export function isApplicationSeeded() {
  const meta = getSeedMeta();
  return meta?.version === MENU_SEED_VERSION && meta?.menuCount === MENU_SEED_COUNT;
}

export async function resetMenuStorage() {
  if (USE_API) {
    await menuApi.resetSeed();
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('menu-updated'));
    }
    return;
  }

  removeKey(storageKeys.MENU_OVERRIDES_KEY);
  removeKey(storageKeys.MENU_CUSTOM_ITEMS_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('menu-updated'));
  }
}

export function resetBlogsStorage() {
  resetBlogStorage();
}

export function resetCartStorage() {
  removeKey(storageKeys.CART_KEY);
}

export function resetOrdersStorage() {
  removeKey(storageKeys.ORDERS_KEY);
}

export function resetReviewsStorage() {
  removeKey(storageKeys.REVIEWS_KEY);
}

export function resetCustomerStorage() {
  removeKey(storageKeys.CUSTOMER_PROFILES_KEY);
  removeKey(storageKeys.CUSTOMER_ADDRESSES_KEY);
}

export function clearApplicationData({ keepSession = false } = {}) {
  resetMenuStorage();
  resetBlogsStorage();
  resetCartStorage();
  resetOrdersStorage();
  resetReviewsStorage();
  resetCustomerStorage();
  removeKey(storageKeys.USERS_KEY);
  removeKey(SEED_META_KEY);

  if (!keepSession) {
    removeKey(storageKeys.USER_SESSION_KEY);
  }
}

function seedDemoCustomerData() {
  const customer = getUsers().find((user) => user.email === DEMO_CUSTOMER_EMAIL);
  if (!customer) return;

  saveCustomerProfile(customer.id, {
    phone: '+91 98765 43210',
    dietaryPreference: 'all',
  });

  if (!getAddresses(customer.id).length) {
    addAddress(customer.id, {
      label: 'Home',
      address: '42 MG Road, Koramangala, Bengaluru 560034',
      phone: '+91 98765 43210',
      isDefault: true,
    });
    addAddress(customer.id, {
      label: 'Office',
      address: 'FoodExpress HQ, Indiranagar, Bengaluru 560038',
      phone: '+91 98765 43210',
      isDefault: false,
    });
  }
}

function seedDemoReviews() {
  const customer = getUsers().find((user) => user.email === DEMO_CUSTOMER_EMAIL);
  if (!customer) return;

  const reviews = [
    {
      id: crypto.randomUUID(),
      userId: customer.id,
      userName: customer.name,
      orderId: 'seed-order-1',
      foodId: 7,
      foodName: 'Paneer Butter Masala',
      rating: 5,
      comment: 'Rich, creamy, and perfectly spiced. Will order again!',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: customer.id,
      userName: customer.name,
      orderId: 'seed-order-1',
      foodId: 8,
      foodName: 'Chicken Biryani',
      rating: 4,
      comment: 'Great aroma and tender chicken. Rice could be a bit more moist.',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: crypto.randomUUID(),
      userId: customer.id,
      userName: customer.name,
      orderId: 'seed-order-2',
      foodId: 9,
      foodName: 'Margherita Pizza',
      rating: 5,
      comment: 'Crispy crust and fresh basil — kids loved it.',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  setJson(storageKeys.REVIEWS_KEY, reviews);
}

export async function seedApplicationData({
  reset = true,
  includeReviews = true,
  includeCustomerProfile = true,
} = {}) {
  if (USE_API) {
    await adminApi.seed();
    const meta = {
      version: MENU_SEED_VERSION,
      menuCount: MENU_SEED_COUNT,
      seededAt: new Date().toISOString(),
    };
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('menu-updated'));
      window.dispatchEvent(new Event('orders-updated'));
      window.dispatchEvent(new Event('blog-updated'));
      window.dispatchEvent(new Event('customer-addresses-updated'));
      window.dispatchEvent(new Event('customer-reviews-updated'));
    }
    return meta;
  }

  if (reset) {
    clearApplicationData({ keepSession: true });
  } else {
    await resetMenuStorage();
  }

  await seedDefaultUsers();

  if (includeCustomerProfile) {
    seedDemoCustomerData();
  }

  if (includeReviews) {
    seedDemoReviews();
  }

  const meta = {
    version: MENU_SEED_VERSION,
    menuCount: MENU_SEED_COUNT,
    seededAt: new Date().toISOString(),
  };

  setJson(SEED_META_KEY, meta);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('menu-updated'));
  }

  return meta;
}
