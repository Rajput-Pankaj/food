import { DEFAULT_STORE_SETTINGS } from '../constants/storeSettings';
import { settingsApi } from '../api';
import { USE_API } from '../config/api';
import { getJson, setJson, storageKeys } from './storage';

function mergeSettings(stored) {
  if (!stored) return { ...DEFAULT_STORE_SETTINGS };

  return {
    ...DEFAULT_STORE_SETTINGS,
    ...stored,
    upi: { ...DEFAULT_STORE_SETTINGS.upi, ...stored.upi },
    razorpay: { ...DEFAULT_STORE_SETTINGS.razorpay, ...stored.razorpay },
    deliveryZones: stored.deliveryZones || DEFAULT_STORE_SETTINGS.deliveryZones,
    guestCheckoutEnabled:
      stored.guestCheckoutEnabled ?? DEFAULT_STORE_SETTINGS.guestCheckoutEnabled,
    storeLogo: stored.storeLogo || DEFAULT_STORE_SETTINGS.storeLogo,
    darkModeEnabled: stored.darkModeEnabled ?? DEFAULT_STORE_SETTINGS.darkModeEnabled,
  };
}

function dispatchSettingsUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('store-settings-updated'));
  }
}

export function getStoreSettings() {
  return mergeSettings(getJson(storageKeys.STORE_SETTINGS_KEY, null));
}

export async function saveStoreSettings(updates, baseSettings = null) {
  if (USE_API) {
    const current = baseSettings || (await settingsApi.get());
    const merged = mergeSettings({
      ...current,
      ...updates,
      upi: { ...current.upi, ...updates.upi },
      razorpay: { ...current.razorpay, ...updates.razorpay },
    });
    const saved = await settingsApi.save(merged);
    dispatchSettingsUpdated();
    return saved;
  }

  const current = getStoreSettings();
  const next = mergeSettings({
    ...current,
    ...updates,
    upi: { ...current.upi, ...updates.upi },
    razorpay: { ...current.razorpay, ...updates.razorpay },
    updatedAt: new Date().toISOString(),
  });

  setJson(storageKeys.STORE_SETTINGS_KEY, next);
  dispatchSettingsUpdated();
  return next;
}

export function getDeliveryFee(subtotal, settings = getStoreSettings()) {
  if (subtotal >= settings.freeDeliveryThreshold) return 0;
  return settings.deliveryFee;
}

export function getAvailablePaymentMethods(settings = getStoreSettings()) {
  const methods = settings.enabledPaymentMethods || DEFAULT_STORE_SETTINGS.enabledPaymentMethods;

  return methods.filter((methodId) => {
    if (methodId === 'razorpay') {
      return settings.razorpay?.enabled && settings.razorpay?.keyId?.trim();
    }
    if (methodId === 'upi') {
      return settings.upi?.vpa?.trim();
    }
    return true;
  });
}
