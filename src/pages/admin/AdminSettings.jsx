import { useEffect, useState } from 'react';
import { saveStoreSettings } from '../../utils/settingsStorage';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { PAYMENT_METHODS } from '../../constants/storeSettings';

const PAYMENT_OPTIONS = Object.values(PAYMENT_METHODS);

export default function AdminSettings() {
  const { settings: current } = useStoreSettings();
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (!current) return;
    setForm({
      storeName: current.storeName,
      storeAddress: current.storeAddress,
      storePhone: current.storePhone,
      deliveryFee: current.deliveryFee,
      freeDeliveryThreshold: current.freeDeliveryThreshold,
      deliveryEnabled: current.deliveryEnabled,
      takeawayEnabled: current.takeawayEnabled,
      enabledPaymentMethods: [...current.enabledPaymentMethods],
      upiVpa: current.upi.vpa,
      upiPayeeName: current.upi.payeeName,
      razorpayKeyId: current.razorpay.keyId,
      razorpayEnabled: current.razorpay.enabled,
    });
  }, [current]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const togglePaymentMethod = (methodId) => {
    setForm((prev) => {
      const enabled = prev.enabledPaymentMethods.includes(methodId)
        ? prev.enabledPaymentMethods.filter((id) => id !== methodId)
        : [...prev.enabledPaymentMethods, methodId];
      return { ...prev, enabledPaymentMethods: enabled };
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    if (!form) return;

    if (form.enabledPaymentMethods.includes('upi') && !form.upiVpa.trim()) {
      setError('UPI ID is required when UPI payments are enabled.');
      return;
    }

    if (form.razorpayEnabled && !form.razorpayKeyId.trim()) {
      setError('Razorpay Key ID is required when Razorpay is enabled.');
      return;
    }

    try {
      await saveStoreSettings({
        storeName: form.storeName.trim(),
        storeAddress: form.storeAddress.trim(),
        storePhone: form.storePhone.trim(),
        deliveryFee: Number(form.deliveryFee) || 0,
        freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
        deliveryEnabled: form.deliveryEnabled,
        takeawayEnabled: form.takeawayEnabled,
        enabledPaymentMethods: form.enabledPaymentMethods,
        upi: {
          vpa: form.upiVpa.trim(),
          payeeName: form.upiPayeeName.trim() || form.storeName.trim(),
        },
        razorpay: {
          keyId: form.razorpayKeyId.trim(),
          enabled: form.razorpayEnabled,
        },
      });
      setMessage('Store settings saved successfully.');
    } catch {
      setError('Could not save settings. Please try again.');
    }
  };

  if (!form) {
    return (
      <div className="text-sm text-gray-500">Loading store settings...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Store Settings</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Configure payments, delivery, takeaway and store details for checkout.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {message && (
          <p className="text-green-700 text-sm bg-green-50 border border-green-200 rounded-xl p-3">
            {message}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
            {error}
          </p>
        )}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Store information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="storeName" className="block text-sm font-medium text-gray-700 mb-1">
                Store name
              </label>
              <input
                id="storeName"
                name="storeName"
                value={form.storeName}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700 mb-1">
                Store phone
              </label>
              <input
                id="storePhone"
                name="storePhone"
                value={form.storePhone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700 mb-1">
                Store / pickup address
              </label>
              <textarea
                id="storeAddress"
                name="storeAddress"
                rows={2}
                value={form.storeAddress}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Fulfillment options</h3>
          <div className="flex flex-wrap gap-4">
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="deliveryEnabled"
                checked={form.deliveryEnabled}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Enable delivery
            </label>
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="takeawayEnabled"
                checked={form.takeawayEnabled}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Enable takeaway / pickup
            </label>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="deliveryFee" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery fee (Rs.)
              </label>
              <input
                id="deliveryFee"
                name="deliveryFee"
                type="number"
                min="0"
                value={form.deliveryFee}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label
                htmlFor="freeDeliveryThreshold"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Free delivery above (Rs.)
              </label>
              <input
                id="freeDeliveryThreshold"
                name="freeDeliveryThreshold"
                type="number"
                min="0"
                value={form.freeDeliveryThreshold}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Payment methods</h3>
          <div className="space-y-2">
            {PAYMENT_OPTIONS.map((method) => (
              <label
                key={method.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200"
              >
                <input
                  type="checkbox"
                  checked={form.enabledPaymentMethods.includes(method.id)}
                  onChange={() => togglePaymentMethod(method.id)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span>
                  <span className="block text-sm font-semibold text-gray-800">{method.label}</span>
                  <span className="block text-xs text-gray-500">{method.description}</span>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-gray-900">UPI settings</h3>
          <p className="text-sm text-gray-500">
            Customers get a dynamic QR code with the exact order amount at checkout.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="upiVpa" className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID (VPA) *
              </label>
              <input
                id="upiVpa"
                name="upiVpa"
                value={form.upiVpa}
                onChange={handleChange}
                placeholder="yourname@upi"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
            <div>
              <label htmlFor="upiPayeeName" className="block text-sm font-medium text-gray-700 mb-1">
                Payee name on UPI
              </label>
              <input
                id="upiPayeeName"
                name="upiPayeeName"
                value={form.upiPayeeName}
                onChange={handleChange}
                placeholder="FoodExpress"
                className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500"
              />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Razorpay settings</h3>
          <p className="text-sm text-gray-500">
            Use your Razorpay test or live Key ID. For production, verify payments on a backend
            server.
          </p>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="razorpayEnabled"
              checked={form.razorpayEnabled}
              onChange={handleChange}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Enable Razorpay checkout
          </label>
          <div>
            <label htmlFor="razorpayKeyId" className="block text-sm font-medium text-gray-700 mb-1">
              Razorpay Key ID
            </label>
            <input
              id="razorpayKeyId"
              name="razorpayKeyId"
              value={form.razorpayKeyId}
              onChange={handleChange}
              placeholder="rzp_test_xxxxxxxx"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-green-500 font-mono text-sm"
            />
          </div>
        </section>

        <button
          type="submit"
          className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
        >
          Save settings
        </button>
      </form>
    </div>
  );
}
