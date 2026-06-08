import { useEffect, useState } from 'react';
import { LuCopy, LuRefreshCw } from 'react-icons/lu';
import { buildUpiPaymentUrl, generateUpiQrDataUrl } from '../../utils/upi';

export default function UpiQrPanel({ settings, amount, orderId }) {
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const upiUrl = buildUpiPaymentUrl({
    vpa: settings.upi.vpa,
    payeeName: settings.upi.payeeName || settings.storeName,
    amount,
    orderId,
    transactionNote: `FoodExpress ${orderId.slice(0, 8).toUpperCase()}`,
  });

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      setError('');
      try {
        const dataUrl = await generateUpiQrDataUrl(upiUrl);
        if (!cancelled) setQrDataUrl(dataUrl);
      } catch {
        if (!cancelled) setError('Could not generate UPI QR code.');
      }
    };

    generate();
    return () => {
      cancelled = true;
    };
  }, [upiUrl]);

  const handleCopyVpa = async () => {
    try {
      await navigator.clipboard.writeText(settings.upi.vpa);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="rounded-2xl border border-violet-200 bg-violet-50/60 p-4 sm:p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-bold text-violet-900">Pay via UPI QR</h3>
          <p className="text-sm text-violet-800/80 mt-1">
            Scan with PhonePe, Google Pay, Paytm or any UPI app. Amount is pre-filled.
          </p>
        </div>
        <span className="text-lg font-bold text-violet-900 shrink-0">Rs.{amount}/-</span>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-white rounded-2xl p-3 border border-violet-100 shadow-sm">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="UPI payment QR code" className="w-48 h-48 sm:w-52 sm:h-52" />
          ) : (
            <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-violet-400">
              <LuRefreshCw className="w-8 h-8 animate-spin" />
            </div>
          )}
        </div>

        <div className="text-sm space-y-3 w-full">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">UPI ID</p>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm font-mono bg-white px-3 py-2 rounded-lg border border-violet-100 flex-1 truncate">
                {settings.upi.vpa}
              </code>
              <button
                type="button"
                onClick={handleCopyVpa}
                className="p-2 rounded-lg bg-white border border-violet-100 text-violet-700 hover:bg-violet-100 transition-colors"
                aria-label="Copy UPI ID"
              >
                <LuCopy className="w-4 h-4" />
              </button>
            </div>
            {copied && <p className="text-xs text-green-600 mt-1">UPI ID copied!</p>}
          </div>
          <p className="text-xs text-violet-800/70 break-all">
            Payee: {settings.upi.payeeName || settings.storeName}
          </p>
          <p className="text-xs text-violet-800/70">
            After payment, click &ldquo;Confirm &amp; Place Order&rdquo; below.
          </p>
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
