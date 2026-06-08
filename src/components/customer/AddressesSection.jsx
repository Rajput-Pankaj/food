import { useEffect, useState } from 'react';
import { MdDelete, MdEdit, MdStar } from 'react-icons/md';
import {
  addAddress,
  deleteAddress,
  fetchAddresses,
  getAddresses,
  updateAddress,
} from '../../utils/customerStorage';
import { USE_API } from '../../config/api';

const emptyForm = { label: '', address: '', phone: '', isDefault: false };

export default function AddressesSection({ userId }) {
  const [addresses, setAddresses] = useState(() => (USE_API ? [] : getAddresses(userId)));
  const [loading, setLoading] = useState(USE_API);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');

  const refresh = async () => {
    if (USE_API) {
      const data = await fetchAddresses();
      setAddresses(data);
      setLoading(false);
      return;
    }
    setAddresses(getAddresses(userId));
  };

  useEffect(() => {
    refresh().catch(() => setLoading(false));
    const handleUpdate = () => {
      refresh().catch(() => setLoading(false));
    };
    window.addEventListener('customer-addresses-updated', handleUpdate);
    return () => window.removeEventListener('customer-addresses-updated', handleUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsFormOpen(false);
    setError('');
  };

  const openAddForm = () => {
    setForm({ ...emptyForm, isDefault: addresses.length === 0 });
    setEditingId(null);
    setIsFormOpen(true);
    setError('');
  };

  const openEditForm = (entry) => {
    setForm({
      label: entry.label,
      address: entry.address,
      phone: entry.phone,
      isDefault: entry.isDefault,
    });
    setEditingId(entry.id);
    setIsFormOpen(true);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!form.label.trim() || !form.address.trim() || !form.phone.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    if (editingId) {
      await updateAddress(userId, editingId, form);
    } else {
      await addAddress(userId, form);
    }
    await refresh();
    resetForm();
  };

  const handleDelete = async (addressId) => {
    if (!window.confirm('Delete this address?')) return;
    const updated = await deleteAddress(userId, addressId);
    if (Array.isArray(updated)) setAddresses(updated);
    else await refresh();
  };

  const handleSetDefault = async (addressId) => {
    await updateAddress(userId, addressId, { isDefault: true });
    await refresh();
  };

  if (loading) {
    return <div className="text-sm text-gray-500">Loading addresses...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-800">Saved Addresses</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage delivery addresses for faster checkout.</p>
        </div>
        <button
          type="button"
          onClick={openAddForm}
          className="bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-700 transition-colors shrink-0"
        >
          Add Address
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h3 className="font-semibold text-gray-800 mb-4">
            {editingId ? 'Edit Address' : 'New Address'}
          </h3>

          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
              {error}
            </p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
            <div>
              <label htmlFor="address-label" className="block text-sm font-medium text-gray-700 mb-1">
                Label
              </label>
              <input
                id="address-label"
                type="text"
                value={form.label}
                onChange={(event) => setForm({ ...form, label: event.target.value })}
                placeholder="Home, Work, etc."
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="address-text" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                id="address-text"
                rows={3}
                value={form.address}
                onChange={(event) => setForm({ ...form, address: event.target.value })}
                placeholder="House no., street, area, city"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <div>
              <label htmlFor="address-phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <input
                id="address-phone"
                type="tel"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
                placeholder="+91 98765 43210"
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:outline-none focus:border-green-500"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(event) => setForm({ ...form, isDefault: event.target.checked })}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Set as default address
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700"
              >
                {editingId ? 'Update Address' : 'Save Address'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-10 text-center">
          <p className="text-4xl mb-3">📍</p>
          <p className="text-gray-500 text-sm sm:text-base mb-1">No saved addresses yet.</p>
          <p className="text-gray-400 text-xs sm:text-sm">Add one for faster checkout.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2">
          {addresses.map((entry) => (
            <article key={entry.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <h3 className="font-semibold text-gray-800 truncate">{entry.label}</h3>
                  {entry.isDefault && (
                    <span className="inline-flex items-center gap-0.5 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full shrink-0">
                      <MdStar className="w-3 h-3" />
                      Default
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => openEditForm(entry)}
                    className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg"
                    aria-label="Edit address"
                  >
                    <MdEdit className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    aria-label="Delete address"
                  >
                    <MdDelete className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-gray-600 break-words">{entry.address}</p>
              <p className="text-sm text-gray-500 mt-2">{entry.phone}</p>
              {!entry.isDefault && (
                <button
                  type="button"
                  onClick={() => handleSetDefault(entry.id)}
                  className="mt-3 text-xs font-medium text-green-600 hover:text-green-700"
                >
                  Set as default
                </button>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
