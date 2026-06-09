import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, customerApi } from '../../api';
import { USE_API } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import {
  getCustomerProfile,
  saveCustomerProfile,
} from '../../utils/customerStorage';

export default function ProfileSection() {
  const { user, updateProfile, logout } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState(user.name);
  const [phone, setPhone] = useState('');
  const [dietaryPreference, setDietaryPreference] = useState('none');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loading, setLoading] = useState(USE_API);

  useEffect(() => {
    const load = async () => {
      if (USE_API) {
        try {
          const profile = await customerApi.getProfile();
          setPhone(profile.phone || '');
          setDietaryPreference(profile.dietaryPreference || 'none');
        } catch {
          setError('Could not load profile.');
        } finally {
          setLoading(false);
        }
        return;
      }

      const storedProfile = getCustomerProfile(user.id);
      setPhone(storedProfile.phone || '');
      setDietaryPreference(storedProfile.dietaryPreference || 'none');
      setLoading(false);
    };

    load();
  }, [user.id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ name: trimmedName });
      await saveCustomerProfile(user.id, {
        phone: phone.trim(),
        dietaryPreference: dietaryPreference === 'none' ? null : dietaryPreference,
      });
      window.dispatchEvent(new Event('customer-preference-updated'));
      setMessage('Profile updated successfully.');
    } catch {
      setError('Could not save profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    setPasswordError('');
    setPasswordMessage('');

    if (!currentPassword || !newPassword) {
      setPasswordError('Current and new password are required.');
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setPasswordError('New password must be at least 8 characters with a letter and a number.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password changed. Redirecting to login...');
      await logout();
      navigate('/login', { replace: true, state: { message: 'Password updated. Please sign in again.' } });
    } catch (err) {
      setPasswordError(err.message || 'Could not change password.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">My Profile</h2>
        <p className="text-sm text-gray-500 mb-5">Update your personal details.</p>

        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            {error}
          </p>
        )}
        {message && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              id="profile-name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
              required
            />
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="profile-email"
              type="email"
              value={user.email}
              disabled
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 bg-gray-50 text-gray-500 cursor-not-allowed"
            />
            <p className="text-xs text-gray-400 mt-1">
              {USE_API ? 'Email cannot be changed.' : 'Email cannot be changed in demo mode.'}
            </p>
          </div>

          <div>
            <span className="block text-sm font-medium text-gray-700 mb-2">Menu Preference</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {[
                { value: 'none', label: 'No preference', hint: 'Show all items' },
                { value: 'veg', label: 'Veg only', hint: 'Vegetarian dishes' },
                { value: 'non_veg', label: 'Non-Veg only', hint: 'Non-vegetarian dishes' },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex flex-col gap-0.5 p-3 rounded-lg border cursor-pointer transition-colors ${
                    dietaryPreference === option.value
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-green-200'
                  }`}
                >
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <input
                      type="radio"
                      name="dietary-preference"
                      value={option.value}
                      checked={dietaryPreference === option.value}
                      onChange={(event) => setDietaryPreference(event.target.value)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    {option.label}
                  </span>
                  <span className="text-xs text-gray-500 pl-6">{option.hint}</span>
                </label>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2">
              When set, the menu defaults to your preference. You can still switch filters while browsing.
            </p>
          </div>

          <div>
            <label htmlFor="profile-phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="profile-phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
              placeholder="+91 98765 43210"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="bg-green-600 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>

      {USE_API && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800 mb-1">Change Password</h2>
          <p className="text-sm text-gray-500 mb-5">Update your account password.</p>

          {passwordError && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              {passwordError}
            </p>
          )}
          {passwordMessage && (
            <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              {passwordMessage}
            </p>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                Current password
              </label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                autoComplete="current-password"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                New password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                autoComplete="new-password"
              />
              <p className="text-xs text-gray-400 mt-1">At least 8 characters with a letter and a number.</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm new password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                autoComplete="new-password"
              />
            </div>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="bg-gray-800 text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-900 transition-colors disabled:opacity-60"
            >
              {isChangingPassword ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
