import { useEffect, useRef, useState } from 'react';
import MediaPicker from '../../components/admin/MediaPicker';
import { StoreLogoMark } from '../../components/StoreLogo';
import { saveStoreSettings } from '../../utils/settingsStorage';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { PAYMENT_METHODS } from '../../constants/storeSettings';

const PAYMENT_OPTIONS = Object.values(PAYMENT_METHODS);

function mapSettingsToForm(current) {
  return {
    storeName: current.storeName || '',
    storeAddress: current.storeAddress || '',
    storePhone: current.storePhone || '',
    storeEmail: current.storeEmail || '',
    storeLogo: current.storeLogo || '',
    deliveryFee: current.deliveryFee ?? 49,
    freeDeliveryThreshold: current.freeDeliveryThreshold ?? 500,
    deliveryEnabled: current.deliveryEnabled ?? true,
    takeawayEnabled: current.takeawayEnabled ?? true,
    guestCheckoutEnabled: current.guestCheckoutEnabled ?? true,
    enabledPaymentMethods: [...(current.enabledPaymentMethods || ['cod'])],
    upiVpa: current.upi?.vpa || '',
    upiPayeeName: current.upi?.payeeName || '',
    razorpayKeyId: current.razorpay?.keyId || '',
    razorpayEnabled: current.razorpay?.enabled ?? false,
    darkModeEnabled: current.darkModeEnabled ?? true,
  };
}

export default function AdminSettings() {
  const { settings: current, loading } = useStoreSettings();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  const [saving, setSaving] = useState(false);
  const [logoPickerOpen, setLogoPickerOpen] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (!current || loading || initialized.current) return;
    setForm(mapSettingsToForm(current));
    initialized.current = true;
  }, [current, loading]);

  useEffect(() => () => {
    initialized.current = false;
  }, []);

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
    setWarning('');

    if (!form || !current) return;

    let paymentMethods = [...form.enabledPaymentMethods];
    const notes = [];

    if (paymentMethods.includes('upi') && !form.upiVpa.trim()) {
      paymentMethods = paymentMethods.filter((id) => id !== 'upi');
      notes.push('UPI was disabled because no UPI ID was provided.');
    }

    if (form.razorpayEnabled && !form.razorpayKeyId.trim()) {
      notes.push('Razorpay stays off until a Key ID is entered.');
    }

    const razorpayEnabled = form.razorpayEnabled && Boolean(form.razorpayKeyId.trim());
    if (form.razorpayEnabled && !razorpayEnabled) {
      paymentMethods = paymentMethods.filter((id) => id !== 'razorpay');
    }

    setSaving(true);
    try {
      const saved = await saveStoreSettings(
        {
          storeName: form.storeName.trim(),
          storeAddress: form.storeAddress.trim(),
          storePhone: form.storePhone.trim(),
          storeEmail: form.storeEmail.trim(),
          storeLogo: form.storeLogo || '',
          deliveryFee: Number(form.deliveryFee) || 0,
          freeDeliveryThreshold: Number(form.freeDeliveryThreshold) || 0,
          deliveryEnabled: form.deliveryEnabled,
          takeawayEnabled: form.takeawayEnabled,
          guestCheckoutEnabled: form.guestCheckoutEnabled,
          darkModeEnabled: form.darkModeEnabled,
          enabledPaymentMethods: paymentMethods.length ? paymentMethods : ['cod'],
          upi: {
            vpa: form.upiVpa.trim(),
            payeeName: form.upiPayeeName.trim() || form.storeName.trim(),
          },
          razorpay: {
            keyId: form.razorpayKeyId.trim(),
            enabled: razorpayEnabled,
          },
        },
        current
      );

      setForm(mapSettingsToForm(saved));
      setMessage('Store settings saved successfully.');
      if (notes.length) setWarning(notes.join(' '));
    } catch (err) {
      setError(err.message || 'Could not save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (!form) {
    return <div className="text-sm text-gray-500">Loading store settings...</div>;
  }

  const hasCustomLogo = Boolean(form.storeLogo?.trim());
  const savedHasCustomLogo = Boolean(current?.storeLogo?.trim());
  const logoDirty = hasCustomLogo !== savedHasCustomLogo || form.storeLogo !== (current?.storeLogo || '');

  return (
    <div className="space-y-6 pb-24">
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
        {warning && (
          <p className="text-amber-800 text-sm bg-amber-50 border border-amber-200 rounded-xl p-3">
            {warning}
          </p>
        )}
        {error && (
          <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
            {error}
          </p>
        )}

        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
          <h3 className="font-bold text-gray-900">Store information</h3>

          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="shrink-0 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Currently on site
              </p>
              <StoreLogoMark storeLogo={form.storeLogo} storeName={form.storeName} size="lg" />
              <p className="text-xs text-gray-500 max-w-[6rem] text-center sm:text-left">
                {hasCustomLogo ? 'Custom logo' : 'Default icon'}
              </p>
            </div>
            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium text-gray-700">Store logo</p>
              <p className="text-xs text-gray-500">
                {hasCustomLogo
                  ? 'This image appears in the site header. Click Save settings after choosing or removing a logo.'
                  : 'The green burger icon is the default brand mark. Upload a square image to replace it in the header and footer.'}
              </p>
              {logoDirty && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
                  Unsaved logo change — click Save settings below to apply.
                </p>
              )}
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setLogoPickerOpen(true)}
                  className="text-sm font-semibold text-green-600 hover:text-green-700"
                >
                  {hasCustomLogo ? 'Change logo' : 'Upload custom logo'}
                </button>
                {hasCustomLogo && (
                  <button
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, storeLogo: '' }))}
                    className="text-sm font-semibold text-red-600 hover:text-red-700"
                  >
                    Revert to default icon
                  </button>
                )}
              </div>
            </div>
          </div>

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
                required
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
              <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700 mb-1">
                Store email (order notifications)
              </label>
              <input
                id="storeEmail"
                name="storeEmail"
                type="email"
                value={form.storeEmail}
                onChange={handleChange}
                placeholder="orders@yourstore.com"
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
            <label className="inline-flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                name="guestCheckoutEnabled"
                checked={form.guestCheckoutEnabled}
                onChange={handleChange}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              Allow guest checkout
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
          <h3 className="font-bold text-gray-900">Appearance</h3>
          <p className="text-sm text-gray-500">
            Control whether customers can switch between light and dark mode on the storefront.
          </p>
          <label className="inline-flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="darkModeEnabled"
              checked={form.darkModeEnabled}
              onChange={handleChange}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            Allow dark mode toggle on storefront
          </label>
          <p className="text-xs text-gray-500">
            When disabled, the site stays in light mode and the theme switch is hidden from the header.
            Admin panel theme toggle is not affected.
          </p>
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
            Required only if UPI is enabled above. Customers get a dynamic QR code at checkout.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="upiVpa" className="block text-sm font-medium text-gray-700 mb-1">
                UPI ID (VPA)
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
            Use your Razorpay test or live Key ID. Secret key stays on the server only.
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

        <div className="sticky bottom-0 bg-slate-100/95 backdrop-blur border-t border-gray-200 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto bg-green-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </form>

      <MediaPicker
        open={logoPickerOpen}
        onClose={() => setLogoPickerOpen(false)}
        onSelect={(url) => setForm((prev) => ({ ...prev, storeLogo: url }))}
        title="Choose store logo"
      />
    </div>
  );
}
