export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(num);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const getConditionDetails = (condition) => {
  switch (condition) {
    case 'LIKE_NEW':
      return { label: 'Like New', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'EXCELLENT':
      return { label: 'Excellent', badgeClass: 'bg-blue-100 text-blue-800 border-blue-200' };
    case 'GOOD':
      return { label: 'Good', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' };
    case 'FAIR':
      return { label: 'Fair', badgeClass: 'bg-slate-100 text-slate-800 border-slate-200' };
    default:
      return { label: condition || 'Used', badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};

export const getOrderStatusDetails = (status) => {
  switch (status) {
    case 'PENDING':
      return { label: 'Offer Pending', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'ACCEPTED':
      return { label: 'Accepted - Item Reserved', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'REJECTED':
      return { label: 'Declined / Cancelled', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'COMPLETED':
      return { label: 'Purchase Completed', badgeClass: 'bg-blue-100 text-blue-800 border-blue-300' };
    default:
      return { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-300' };
  }
};

export const getProductStatusDetails = (status) => {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Available', badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    case 'RESERVED':
    case 'PENDING_SALE':
      return { label: 'Reserved', badgeClass: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'SOLD':
      return { label: 'Sold Out', badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
    default:
      return { label: status, badgeClass: 'bg-slate-100 text-slate-700 border-slate-200' };
  }
};