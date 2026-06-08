import { customerApi } from '../api';
import { USE_API } from '../config/api';
import { getJson, setJson, storageKeys } from './storage';

function getAllProfiles() {
  return getJson(storageKeys.CUSTOMER_PROFILES_KEY, {});
}

function getAllAddressBooks() {
  return getJson(storageKeys.CUSTOMER_ADDRESSES_KEY, {});
}

export function getCustomerProfile(userId) {
  return getAllProfiles()[userId] || { phone: '', dietaryPreference: null };
}

export async function saveCustomerProfile(userId, profile) {
  if (USE_API) {
    const saved = await customerApi.saveProfile(profile);
    window.dispatchEvent(new Event('customer-profile-updated'));
    return saved;
  }

  const profiles = getAllProfiles();
  profiles[userId] = { ...profiles[userId], ...profile };
  setJson(storageKeys.CUSTOMER_PROFILES_KEY, profiles);
  return profiles[userId];
}

export function getAddresses(userId) {
  return getAllAddressBooks()[userId] || [];
}

export async function fetchAddresses() {
  if (!USE_API) return [];
  return customerApi.getAddresses();
}

export async function fetchCustomerCheckoutDefaults() {
  if (!USE_API) return { address: '', phone: '' };

  const [profile, addresses] = await Promise.all([
    customerApi.getProfile().catch(() => ({ phone: '' })),
    customerApi.getAddresses().catch(() => []),
  ]);

  const defaultAddress =
    addresses.find((entry) => entry.isDefault) || addresses[0] || null;

  return {
    address: defaultAddress?.address || '',
    phone: defaultAddress?.phone || profile.phone || '',
  };
}

function saveAddressesForUser(userId, addresses) {
  const all = getAllAddressBooks();
  all[userId] = addresses;
  setJson(storageKeys.CUSTOMER_ADDRESSES_KEY, all);
}

export async function addAddress(userId, address) {
  if (USE_API) {
    const saved = await customerApi.createAddress(address);
    window.dispatchEvent(new Event('customer-addresses-updated'));
    return saved;
  }

  const addresses = getAddresses(userId);
  const newAddress = {
    id: crypto.randomUUID(),
    label: address.label.trim(),
    address: address.address.trim(),
    phone: address.phone.trim(),
    isDefault: address.isDefault || addresses.length === 0,
  };

  let updated = [...addresses, newAddress];
  if (newAddress.isDefault) {
    updated = updated.map((entry) => ({ ...entry, isDefault: entry.id === newAddress.id }));
  }

  saveAddressesForUser(userId, updated);
  return newAddress;
}

export async function updateAddress(userId, addressId, updates) {
  if (USE_API) {
    const saved = await customerApi.updateAddress(addressId, updates);
    window.dispatchEvent(new Event('customer-addresses-updated'));
    return saved;
  }

  let addresses = getAddresses(userId).map((entry) =>
    entry.id === addressId ? { ...entry, ...updates } : entry
  );

  if (updates.isDefault) {
    addresses = addresses.map((entry) => ({
      ...entry,
      isDefault: entry.id === addressId,
    }));
  }

  saveAddressesForUser(userId, addresses);
  return addresses;
}

export async function deleteAddress(userId, addressId) {
  if (USE_API) {
    await customerApi.deleteAddress(addressId);
    window.dispatchEvent(new Event('customer-addresses-updated'));
    return fetchAddresses();
  }

  let addresses = getAddresses(userId).filter((entry) => entry.id !== addressId);
  if (addresses.length && !addresses.some((entry) => entry.isDefault)) {
    addresses[0] = { ...addresses[0], isDefault: true };
  }
  saveAddressesForUser(userId, addresses);
  return addresses;
}

export function getDefaultAddress(userId) {
  const addresses = getAddresses(userId);
  return addresses.find((entry) => entry.isDefault) || addresses[0] || null;
}

export function getAllReviews() {
  return getJson(storageKeys.REVIEWS_KEY, []);
}

export function getReviewsByUser(userId) {
  return getAllReviews().filter((review) => review.userId === userId);
}

export async function fetchReviewsByUser() {
  if (!USE_API) return [];
  return customerApi.getReviews();
}

export async function saveReview(review) {
  if (USE_API) {
    const saved = await customerApi.saveReview(review);
    window.dispatchEvent(new Event('customer-reviews-updated'));
    return saved;
  }

  const reviews = getAllReviews();
  const existingIndex = reviews.findIndex(
    (entry) =>
      entry.userId === review.userId &&
      entry.orderId === review.orderId &&
      entry.foodId === review.foodId
  );

  const entry = {
    id: existingIndex >= 0 ? reviews[existingIndex].id : crypto.randomUUID(),
    ...review,
    createdAt:
      existingIndex >= 0 ? reviews[existingIndex].createdAt : new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    reviews[existingIndex] = entry;
  } else {
    reviews.unshift(entry);
  }

  setJson(storageKeys.REVIEWS_KEY, reviews);
  return entry;
}

export async function deleteReview(reviewId) {
  if (USE_API) {
    await customerApi.deleteReview(reviewId);
    window.dispatchEvent(new Event('customer-reviews-updated'));
    return;
  }

  const reviews = getAllReviews().filter((review) => review.id !== reviewId);
  setJson(storageKeys.REVIEWS_KEY, reviews);
}

export function getReviewStats() {
  const reviews = getAllReviews();
  const total = reviews.length;
  const averageRating =
    total > 0
      ? Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / total) * 10) / 10
      : 0;

  const byRating = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  return { total, averageRating, byRating, recent: reviews.slice(0, 5) };
}

export function getReviewsForAdmin(userLookup = []) {
  const userMap = Object.fromEntries(userLookup.map((user) => [user.id, user]));

  return getAllReviews().map((review) => ({
    ...review,
    userName: userMap[review.userId]?.name || 'Unknown',
    userEmail: userMap[review.userId]?.email || '—',
  }));
}
