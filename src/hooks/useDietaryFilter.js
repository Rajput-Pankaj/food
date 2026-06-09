import { useCallback, useEffect, useState } from 'react';
import { customerApi } from '../api';
import { USE_API } from '../config/api';
import { useAuth } from '../context/AuthContext';
import { getCustomerProfile } from '../utils/customerStorage';

export function useDietaryFilter() {
  const { user, isCustomer } = useAuth();
  const [dietaryFilter, setDietaryFilter] = useState('all');
  const [hasProfilePreference, setHasProfilePreference] = useState(false);

  const syncFromProfile = useCallback(async () => {
    if (!isCustomer || !user) {
      setDietaryFilter('all');
      setHasProfilePreference(false);
      return;
    }

    if (USE_API) {
      try {
        const profile = await customerApi.getProfile();
        if (profile.dietaryPreference) {
          setDietaryFilter(profile.dietaryPreference);
          setHasProfilePreference(true);
        } else {
          setDietaryFilter('all');
          setHasProfilePreference(false);
        }
      } catch {
        setDietaryFilter('all');
        setHasProfilePreference(false);
      }
      return;
    }

    const profile = getCustomerProfile(user.id);
    if (profile.dietaryPreference) {
      setDietaryFilter(profile.dietaryPreference);
      setHasProfilePreference(true);
    } else {
      setDietaryFilter('all');
      setHasProfilePreference(false);
    }
  }, [isCustomer, user]);

  useEffect(() => {
    syncFromProfile();
  }, [syncFromProfile, user?.id]);

  useEffect(() => {
    const handlePreferenceUpdate = () => syncFromProfile();
    window.addEventListener('customer-preference-updated', handlePreferenceUpdate);
    return () => window.removeEventListener('customer-preference-updated', handlePreferenceUpdate);
  }, [syncFromProfile]);

  return {
    dietaryFilter,
    setDietaryFilter,
    hasProfilePreference,
    resetToProfilePreference: syncFromProfile,
  };
}
