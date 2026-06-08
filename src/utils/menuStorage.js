import { menuApi } from '../api';
import { USE_API } from '../config/api';
import { food_items } from '../data/menuSeed.js';
import { MENU_PLACEHOLDER_IMAGE } from '../constants/menu';
import { mergeNutrition, parseNutritionNumber } from '../constants/nutrition';
import { parseGalleryText } from './menuImages';
import { getJson, setJson, storageKeys } from './storage';

function normalizeItemDetails(source = {}, override = {}) {
  const nutrition = mergeNutrition(source.nutrition, override.nutrition);

  return {
    description: override.description ?? source.description ?? '',
    details: override.details ?? source.details ?? '',
    ingredients: override.ingredients ?? source.ingredients ?? '',
    allergens: override.allergens ?? source.allergens ?? '',
    prepTime: override.prepTime ?? source.prepTime ?? null,
    nutrition,
    galleryImages: override.galleryImages ?? source.galleryImages ?? [],
  };
}

function buildNutritionFromForm(formData = {}) {
  return {
    calories: parseNutritionNumber(formData.calories),
    servingSize: formData.servingSize?.trim() || '',
    protein: parseNutritionNumber(formData.protein),
    carbs: parseNutritionNumber(formData.carbs),
    fat: parseNutritionNumber(formData.fat),
    fiber: parseNutritionNumber(formData.fiber),
    sugar: parseNutritionNumber(formData.sugar),
    sodium: parseNutritionNumber(formData.sodium),
  };
}

function buildDetailsPayload(formData = {}) {
  return {
    description: formData.description?.trim() || '',
    details: formData.details?.trim() || '',
    ingredients: formData.ingredients?.trim() || '',
    allergens: formData.allergens?.trim() || '',
    prepTime: parseNutritionNumber(formData.prepTime),
    nutrition: buildNutritionFromForm(formData),
    galleryImages: parseGalleryText(formData.galleryImagesText),
  };
}

const DETAIL_UPDATE_KEYS = new Set([
  'description',
  'details',
  'ingredients',
  'allergens',
  'prepTime',
  'calories',
  'servingSize',
  'protein',
  'carbs',
  'fat',
  'fiber',
  'sugar',
  'sodium',
  'galleryImagesText',
]);

function hasDetailUpdates(updates = {}) {
  return Object.keys(updates).some((key) => DETAIL_UPDATE_KEYS.has(key));
}

function dispatchMenuUpdated() {
  window.dispatchEvent(new Event('menu-updated'));
}

function getMenuOverrides() {
  return getJson(storageKeys.MENU_OVERRIDES_KEY, {});
}

function getCustomItems() {
  return getJson(storageKeys.MENU_CUSTOM_ITEMS_KEY, []);
}

function saveCustomItems(items) {
  setJson(storageKeys.MENU_CUSTOM_ITEMS_KEY, items);
  dispatchMenuUpdated();
}

export function setMenuOverride(itemId, override) {
  const overrides = getMenuOverrides();
  overrides[itemId] = { ...overrides[itemId], ...override };
  setJson(storageKeys.MENU_OVERRIDES_KEY, overrides);
  dispatchMenuUpdated();
  return overrides;
}

function mergeItem(baseItem, override = {}) {
  const image = override.food_image_url || baseItem.food_image || MENU_PLACEHOLDER_IMAGE;
  const details = normalizeItemDetails(baseItem, override);

  return {
    ...baseItem,
    food_name: override.food_name ?? baseItem.food_name,
    food_category: override.food_category ?? baseItem.food_category,
    food_type: override.food_type ?? baseItem.food_type,
    price: override.price ?? baseItem.price,
    available: override.available ?? true,
    ...details,
    food_image: image,
    food_quantity: override.food_quantity ?? baseItem.food_quantity ?? 1,
    isCustom: Boolean(baseItem.isCustom),
    deleted: override.deleted === true,
  };
}

function getAllMenuItemsForAdmin() {
  const overrides = getMenuOverrides();

  const baseItems = food_items.map((item) =>
    mergeItem({ ...item, isCustom: false }, overrides[item.id] || {})
  );

  const customItems = getCustomItems().map((item) =>
    mergeItem({ ...item, isCustom: true }, overrides[item.id] || {})
  );

  return [...baseItems, ...customItems].filter((item) => !item.deleted);
}

export function getMenuItems() {
  return getAllMenuItemsForAdmin().filter((item) => item.available);
}

export function getPublicMenuItemById(itemId) {
  return getMenuItems().find((item) => String(item.id) === String(itemId)) || null;
}

export function getMenuStats() {
  const items = getAllMenuItemsForAdmin();
  const categories = [...new Set(items.map((item) => item.food_category))].sort();

  return {
    total: items.length,
    available: items.filter((item) => item.available).length,
    hidden: items.filter((item) => !item.available).length,
    custom: items.filter((item) => item.isCustom).length,
    categories: categories.length,
    categoryList: categories,
  };
}

export async function addCustomMenuItem(itemData) {
  if (USE_API) {
    const details = buildDetailsPayload(itemData);
    const newItem = {
      id: Date.now(),
      food_name: itemData.food_name.trim(),
      food_category: itemData.food_category,
      food_type: itemData.food_type,
      food_quantity: 1,
      food_image: itemData.food_image_url?.trim() || MENU_PLACEHOLDER_IMAGE,
      price: Number(itemData.price),
      ...details,
      available: itemData.available !== false,
      isCustom: true,
    };
    const saved = await menuApi.create(newItem);
    dispatchMenuUpdated();
    return saved;
  }

  const customItems = getCustomItems();
  const id = `custom-${crypto.randomUUID()}`;
  const details = buildDetailsPayload(itemData);
  const newItem = {
    id,
    food_name: itemData.food_name.trim(),
    food_category: itemData.food_category,
    food_type: itemData.food_type,
    food_quantity: 1,
    food_image: itemData.food_image_url?.trim() || MENU_PLACEHOLDER_IMAGE,
    price: Number(itemData.price),
    ...details,
    galleryImages: details.galleryImages,
    isCustom: true,
    createdAt: new Date().toISOString(),
  };

  saveCustomItems([...customItems, newItem]);

  if (itemData.available === false) {
    setMenuOverride(id, { available: false });
  }

  return newItem;
}

export async function updateMenuItem(itemId, updates) {
  if (USE_API) {
    const detailsPayload = hasDetailUpdates(updates) ? buildDetailsPayload(updates) : {};
    const payload = {
      ...detailsPayload,
      ...(updates.price !== undefined ? { price: Number(updates.price) } : {}),
      ...(updates.available !== undefined ? { available: updates.available } : {}),
      ...(updates.food_name ? { food_name: updates.food_name.trim() } : {}),
      ...(updates.food_category ? { food_category: updates.food_category } : {}),
      ...(updates.food_type ? { food_type: updates.food_type } : {}),
      ...(updates.food_image_url ? { food_image: updates.food_image_url.trim() } : {}),
      ...(updates.deleted !== undefined ? { deleted: updates.deleted } : {}),
    };
    const saved = await menuApi.update(itemId, payload);
    dispatchMenuUpdated();
    return saved;
  }

  const customItems = getCustomItems();
  const isCustom = customItems.some((item) => item.id === itemId);

  const detailsPayload = hasDetailUpdates(updates) ? buildDetailsPayload(updates) : null;

  if (isCustom) {
    const updated = customItems.map((item) => {
      if (item.id !== itemId) return item;
      return {
        ...item,
        food_name: updates.food_name?.trim() ?? item.food_name,
        food_category: updates.food_category ?? item.food_category,
        food_type: updates.food_type ?? item.food_type,
        price: updates.price !== undefined ? Number(updates.price) : item.price,
        food_image: updates.food_image_url?.trim() || item.food_image,
        ...(detailsPayload || {}),
        galleryImages: detailsPayload?.galleryImages ?? item.galleryImages,
      };
    });
    saveCustomItems(updated);
  }

  const overrideFields = detailsPayload ? { ...detailsPayload } : {};
  if (updates.price !== undefined) overrideFields.price = Number(updates.price);
  if (updates.available !== undefined) overrideFields.available = updates.available;
  if (updates.food_name) overrideFields.food_name = updates.food_name.trim();
  if (updates.food_category) overrideFields.food_category = updates.food_category;
  if (updates.food_type) overrideFields.food_type = updates.food_type;
  if (updates.food_image_url) overrideFields.food_image_url = updates.food_image_url.trim();

  if (Object.keys(overrideFields).length) {
    setMenuOverride(itemId, overrideFields);
  } else {
    dispatchMenuUpdated();
  }
}

export async function deleteMenuItem(itemId, isCustom = false) {
  if (USE_API) {
    if (isCustom) {
      await menuApi.remove(itemId);
    } else {
      await menuApi.update(itemId, { deleted: true, available: false });
    }
    dispatchMenuUpdated();
    return;
  }

  const customItems = getCustomItems();

  if (customItems.some((item) => item.id === itemId)) {
    saveCustomItems(customItems.filter((item) => item.id !== itemId));
    const overrides = getMenuOverrides();
    delete overrides[itemId];
    setJson(storageKeys.MENU_OVERRIDES_KEY, overrides);
  } else {
    setMenuOverride(itemId, { deleted: true });
  }

  dispatchMenuUpdated();
}

export async function resetMenuItem(itemId) {
  if (USE_API) {
    const base = food_items.find((entry) => String(entry.id) === String(itemId));
    if (base) {
      await menuApi.update(itemId, { ...base, available: true, deleted: false });
    } else {
      await menuApi.remove(itemId);
    }
    dispatchMenuUpdated();
    return;
  }

  const customItems = getCustomItems();
  if (customItems.some((item) => item.id === itemId)) {
    deleteMenuItem(itemId);
    return;
  }

  const overrides = getMenuOverrides();
  delete overrides[itemId];
  setJson(storageKeys.MENU_OVERRIDES_KEY, overrides);
  dispatchMenuUpdated();
}
