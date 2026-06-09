import { useEffect, useState } from 'react';
import { settingsApi } from '../api';
import { USE_API } from '../config/api';
import { DEFAULT_STORE_SETTINGS } from '../constants/storeSettings';
import { getStoreSettings } from '../utils/settingsStorage';

function mergeFromDefaults(data) {
  if (!data) return { ...DEFAULT_STORE_SETTINGS };
  return {
    ...DEFAULT_STORE_SETTINGS,
    ...data,
    upi: { ...DEFAULT_STORE_SETTINGS.upi, ...data.upi },
    razorpay: { ...DEFAULT_STORE_SETTINGS.razorpay, ...data.razorpay },
    guestCheckoutEnabled: data.guestCheckoutEnabled ?? DEFAULT_STORE_SETTINGS.guestCheckoutEnabled,
    deliveryZones: data.deliveryZones || DEFAULT_STORE_SETTINGS.deliveryZones,
    storeLogo: data.storeLogo || DEFAULT_STORE_SETTINGS.storeLogo,
    darkModeEnabled: data.darkModeEnabled ?? DEFAULT_STORE_SETTINGS.darkModeEnabled,
  };
}

export function useStoreSettings() {
  const [settings, setSettings] = useState(() =>
    USE_API ? mergeFromDefaults(null) : getStoreSettings()
  );
  const [loading, setLoading] = useState(USE_API);

  useEffect(() => {
    const refresh = async () => {
      if (USE_API) {
        try {
          const data = await settingsApi.get();
          setSettings(mergeFromDefaults(data));
        } catch (error) {
          console.error('Failed to load settings:', error);
        } finally {
          setLoading(false);
        }
        return;
      }
      setSettings(getStoreSettings());
    };

    refresh();
    window.addEventListener('store-settings-updated', refresh);
    return () => window.removeEventListener('store-settings-updated', refresh);
  }, []);

  return { settings, loading };
}
