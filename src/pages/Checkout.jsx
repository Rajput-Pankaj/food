import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuMapPin, LuShoppingBag, LuStore } from 'react-icons/lu';
import PageLayout from '../components/PageLayout';
import OrderSummaryCard from '../components/checkout/OrderSummaryCard';
import UpiQrPanel from '../components/checkout/UpiQrPanel';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { saveOrder } from '../utils/orderStorage';
import {
  fetchCustomerCheckoutDefaults,
  getCustomerProfile,
  getDefaultAddress,
} from '../utils/customerStorage';
import { USE_API } from '../config/api';
import {
  getAvailablePaymentMethods,
  getDeliveryFee,
} from '../utils/settingsStorage';
import { openRazorpayCheckout } from '../utils/razorpay';
import { ORDER_TYPES, PAYMENT_METHODS } from '../constants/storeSettings';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export default function Checkout() {
  useDocumentTitle('Checkout');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, cartTotal, clearCart } = useCart();
  const { settings } = useStoreSettings();

  const pendingOrderId = useMemo(() => crypto.randomUUID(), []);
  const [checkoutDefaults, setCheckoutDefaults] = useState(() =>
    USE_API
      ? { address: '', phone: '' }
      : {
          address: getDefaultAddress(user.id)?.address || '',
          phone: getDefaultAddress(user.id)?.phone || getCustomerProfile(user.id).phone || '',
        }
  );

  useEffect(() => {
    if (!USE_API) return;
    fetchCustomerCheckoutDefaults().then(setCheckoutDefaults).catch(() => {});
  }, [user.id]);

  const availablePaymentMethods = useMemo(
    () => getAvailablePaymentMethods(settings),
    [settings]
  );

  const defaultOrderType = settings.takeawayEnabled
    ? settings.deliveryEnabled
      ? 'delivery'
      : 'takeaway'
    : 'delivery';

  const defaultPayment =
    availablePaymentMethods[0] || PAYMENT_METHODS.cod.id;

  const [orderType, setOrderType] = useState(defaultOrderType);
  const [formData, setFormData] = useState({
    address: checkoutDefaults.address,
    phone: checkoutDefaults.phone,
    paymentMethod: defaultPayment,
    notes: '',
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      address: checkoutDefaults.address || prev.address,
      phone: checkoutDefaults.phone || prev.phone,
    }));
  }, [checkoutDefaults.address, checkoutDefaults.phone]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const deliveryFee =
    orderType === 'takeaway' ? 0 : getDeliveryFee(cartTotal, settings);
  const orderTotal = cartTotal + deliveryFee;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const buildOrder = (paymentMeta = {}) => ({
    id: pendingOrderId,
    userId: user.id,
    userEmail: user.email,
    items: cart,
    subtotal: cartTotal,
    deliveryFee,
    total: orderTotal,
    orderType,
    address:
      orderType === 'takeaway'
        ? settings.storeAddress
        : formData.address.trim(),
    phone: formData.phone.trim(),
    paymentMethod: formData.paymentMethod,
    paymentStatus: paymentMeta.paymentStatus || 'pending',
    razorpayPaymentId: paymentMeta.razorpayPaymentId || null,
    razorpayOrderId: paymentMeta.razorpayOrderId || null,
    notes: formData.notes.trim(),
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  const validateForm = () => {
    if (!formData.phone.trim()) {
      setError('Please provide your phone number.');
      return false;
    }

    if (orderType === 'delivery' && !formData.address.trim()) {
      setError('Please provide your delivery address.');
      return false;
    }

    if (cart.length === 0) {
      setError('Your cart is empty. Add items before checkout.');
      return false;
    }

    if (!availablePaymentMethods.includes(formData.paymentMethod)) {
      setError('Selected payment method is not available. Choose another option.');
      return false;
    }

    return true;
  };

  const finalizeOrder = async (paymentMeta) => {
    const order = buildOrder(paymentMeta);
    await saveOrder(order);
    clearCart();
    navigate('/order-success', {
      state: {
        orderId: order.id,
        total: orderTotal,
        orderType,
        paymentMethod: formData.paymentMethod,
        paymentStatus: order.paymentStatus,
      },
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      if (formData.paymentMethod === 'razorpay') {
        const payment = await openRazorpayCheckout({
          keyId: settings.razorpay.keyId,
          amount: orderTotal,
          orderId: pendingOrderId,
          customerName: user.name,
          customerEmail: user.email,
          customerPhone: formData.phone.trim(),
          storeName: settings.storeName,
        });

        await finalizeOrder({
          paymentStatus: 'paid',
          razorpayPaymentId: payment.razorpayPaymentId,
          razorpayOrderId: payment.razorpayOrderId,
        });
        return;
      }

      await finalizeOrder({
        paymentStatus: formData.paymentMethod === 'cod' ? 'pending' : 'pending',
      });
    } catch (submitError) {
      setError(submitError.message || 'Unable to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <PageLayout mainClassName="flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 max-w-md w-full">
          <LuShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">Add some delicious food before checking out.</p>
          <Link
            to="/menu"
            className="inline-flex bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
          >
            Browse Menu
          </Link>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout mainClassName="max-w-6xl mx-auto w-full px-3 sm:px-4 lg:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Checkout</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1">
          Review your order and choose how you&apos;d like to receive it.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-3 space-y-5">
          {error && (
            <p className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl p-3">
              {error}
            </p>
          )}

          {(settings.deliveryEnabled || settings.takeawayEnabled) && (
            <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Order type</h2>
              <div className="grid sm:grid-cols-2 gap-3">
                {settings.deliveryEnabled && (
                  <button
                    type="button"
                    onClick={() => setOrderType('delivery')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      orderType === 'delivery'
                        ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <LuMapPin className="w-5 h-5 text-green-600 mb-2" />
                    <p className="font-semibold text-gray-900">{ORDER_TYPES.delivery.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{ORDER_TYPES.delivery.description}</p>
                  </button>
                )}
                {settings.takeawayEnabled && (
                  <button
                    type="button"
                    onClick={() => setOrderType('takeaway')}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      orderType === 'takeaway'
                        ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                        : 'border-gray-200 hover:border-green-200'
                    }`}
                  >
                    <LuStore className="w-5 h-5 text-green-600 mb-2" />
                    <p className="font-semibold text-gray-900">{ORDER_TYPES.takeaway.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{ORDER_TYPES.takeaway.description}</p>
                  </button>
                )}
              </div>
            </section>
          )}

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">
              {orderType === 'takeaway' ? 'Contact details' : 'Delivery details'}
            </h2>

            {orderType === 'takeaway' && (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 text-sm text-amber-900">
                <p className="font-semibold">Pickup location</p>
                <p className="mt-1">{settings.storeAddress}</p>
                <p className="mt-2 text-amber-800">
                  We&apos;ll notify you when your order is ready for pickup.
                </p>
              </div>
            )}

            {orderType === 'delivery' && (
              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Delivery address *
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-green-500"
                  placeholder="House no., street, area, city"
                  required={orderType === 'delivery'}
                />
              </div>
            )}

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone number *
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-green-500"
                placeholder="+91 98765 43210"
                required
              />
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Order notes (optional)
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-xl p-3 focus:outline-none focus:border-green-500"
                placeholder={
                  orderType === 'takeaway'
                    ? 'Pickup instructions, spice level, etc.'
                    : 'Gate code, landmark, special instructions...'
                }
              />
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 sm:p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Payment method</h2>

            {availablePaymentMethods.length === 0 ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl p-3">
                No payment methods configured. Admin can set up UPI and Razorpay in Settings.
              </p>
            ) : (
              <div className="space-y-2">
                {availablePaymentMethods.map((methodId) => {
                  const method = PAYMENT_METHODS[methodId];
                  if (!method) return null;

                  return (
                    <label
                      key={methodId}
                      className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${
                        formData.paymentMethod === methodId
                          ? 'border-green-500 bg-green-50 ring-1 ring-green-500'
                          : 'border-gray-200 hover:border-green-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={methodId}
                        checked={formData.paymentMethod === methodId}
                        onChange={handleChange}
                        className="mt-1 text-green-600 focus:ring-green-500"
                      />
                      <span>
                        <span className="block font-semibold text-gray-900">{method.label}</span>
                        <span className="block text-xs text-gray-500 mt-0.5">
                          {method.description}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            )}

            {formData.paymentMethod === 'upi' && settings.upi.vpa && (
              <UpiQrPanel settings={settings} amount={orderTotal} orderId={pendingOrderId} />
            )}
          </section>

          <button
            type="submit"
            disabled={isSubmitting || availablePaymentMethods.length === 0}
            className="w-full bg-green-600 text-white py-3.5 rounded-xl font-bold hover:bg-green-700 transition-colors disabled:opacity-60 text-base"
          >
            {isSubmitting
              ? 'Processing...'
              : formData.paymentMethod === 'razorpay'
                ? `Pay Rs.${orderTotal}/- with Razorpay`
                : formData.paymentMethod === 'upi'
                  ? `Confirm Payment & Place Order — Rs.${orderTotal}/-`
                  : `Place Order — Rs.${orderTotal}/-`}
          </button>
        </form>

        <div className="lg:col-span-2">
          <OrderSummaryCard
            cart={cart}
            cartTotal={cartTotal}
            deliveryFee={deliveryFee}
            orderTotal={orderTotal}
            freeDeliveryThreshold={settings.freeDeliveryThreshold}
            orderType={orderType}
          />
        </div>
      </div>
    </PageLayout>
  );
}
