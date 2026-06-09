/** Format amount in Indian Rupees with en-IN grouping (e.g. ₹1,23,456). */
export function formatINR(amount, { compact = false, decimals = 0 } = {}) {
  const value = Number(amount) || 0;

  if (compact) {
    if (value >= 1_00_00_000) return `₹${(value / 1_00_00_000).toFixed(2)} Cr`;
    if (value >= 1_00_000) return `₹${(value / 1_00_000).toFixed(2)} L`;
    if (value >= 1_000) return `₹${(value / 1_000).toFixed(1)}K`;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatINRFull(amount) {
  return formatINR(amount, { compact: false, decimals: 0 });
}

export function formatINRCompact(amount) {
  return formatINR(amount, { compact: true });
}
