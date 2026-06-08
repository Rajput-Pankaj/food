import QRCode from 'qrcode';

export function buildUpiPaymentUrl({ vpa, payeeName, amount, transactionNote, orderId }) {
  const params = new URLSearchParams({
    pa: vpa.trim(),
    pn: payeeName.trim(),
    am: Number(amount).toFixed(2),
    cu: 'INR',
    tn: transactionNote || `FoodExpress Order ${orderId?.slice(0, 8) || ''}`.trim(),
  });

  return `upi://pay?${params.toString()}`;
}

export async function generateUpiQrDataUrl(upiUrl) {
  return QRCode.toDataURL(upiUrl, {
    width: 280,
    margin: 2,
    color: { dark: '#111827', light: '#ffffff' },
  });
}
