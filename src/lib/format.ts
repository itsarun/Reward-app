/**
 * Formats a number as Bangladeshi Taka (BDT ৳)
 * e.g., 0.5 -> ৳0.50, 10 -> ৳10.00, 1000 -> ৳1,000.00
 */
export function formatBDT(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '৳0.00';
  }
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `-৳${formatted}` : `৳${formatted}`;
}

export function formatBDTWithSign(amount: number | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '৳0.00';
  }
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount > 0 ? `+৳${formatted}` : amount < 0 ? `-৳${formatted}` : `৳${formatted}`;
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDate(timestamp: number): string {
  if (!timestamp) return 'Just now';
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Just now';
  const diff = Date.now() - timestamp;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
