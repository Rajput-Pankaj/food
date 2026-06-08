const RAZORPAY_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let scriptPromise = null;

function loadRazorpayScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Razorpay is only available in the browser.'));
  }

  if (window.Razorpay) return Promise.resolve(window.Razorpay);

  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(window.Razorpay);
      script.onerror = () => reject(new Error('Failed to load Razorpay checkout.'));
      document.body.appendChild(script);
    });
  }

  return scriptPromise;
}

export async function openRazorpayCheckout({
  keyId,
  amount,
  orderId,
  customerName,
  customerEmail,
  customerPhone,
  storeName,
}) {
  const Razorpay = await loadRazorpayScript();
  const amountPaise = Math.round(Number(amount) * 100);

  return new Promise((resolve, reject) => {
    const options = {
      key: keyId,
      amount: amountPaise,
      currency: 'INR',
      name: storeName || 'FoodExpress',
      description: `Order #${orderId.slice(0, 8).toUpperCase()}`,
      handler(response) {
        resolve({
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id || null,
          razorpaySignature: response.razorpay_signature || null,
        });
      },
      prefill: {
        name: customerName || '',
        email: customerEmail || '',
        contact: customerPhone || '',
      },
      notes: {
        foodexpress_order_id: orderId,
      },
      theme: { color: '#16a34a' },
      modal: {
        ondismiss() {
          reject(new Error('Payment cancelled.'));
        },
      },
    };

    const rzp = new Razorpay(options);
    rzp.on('payment.failed', (response) => {
      reject(new Error(response.error?.description || 'Payment failed.'));
    });
    rzp.open();
  });
}
