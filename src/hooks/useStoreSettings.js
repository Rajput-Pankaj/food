import { useEffect, useState } from 'react';
import { settingsApi } from '../api';
import { USE_API } from '../config/api';
import { getStoreSettings } from '../utils/settingsStorage';

export function useStoreSettings() {
  const [settings, setSettings] = useState(getStoreSettings);
  const [loading, setLoading] = useState(USE_API);

  useEffect(() => {
    const refresh = async () => {
      if (USE_API) {
        try {
          const data = await settingsApi.get();
          setSettings(data);
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
