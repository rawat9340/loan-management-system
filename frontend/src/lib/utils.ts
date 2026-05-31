import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (dateStr: string | Date): string => {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(dateStr));
};

export const calculateAge = (dob: string): number => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const calculateSI = (
  principal: number,
  tenure: number,
  rate: number = 12
): { si: number; total: number } => {
  const si = (principal * rate * tenure) / (365 * 100);
  return {
    si: Math.round(si * 100) / 100,
    total: Math.round((principal + si) * 100) / 100,
  };
};

export const getLoanStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    APPLIED: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
    REJECTED: 'bg-red-500/20 text-red-400 border border-red-500/30',
    SANCTIONED: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    DISBURSED: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
    CLOSED: 'bg-green-500/20 text-green-400 border border-green-500/30',
  };
  return colors[status] || 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
};

export const getBREStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    PASS: 'bg-green-500/20 text-green-400 border border-green-500/30',
    FAIL: 'bg-red-500/20 text-red-400 border border-red-500/30',
    PENDING: 'bg-gray-500/20 text-gray-400 border border-gray-500/30',
  };
  return colors[status] || colors.PENDING;
};

export const getRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    ADMIN: 'Administrator',
    BORROWER: 'Borrower',
    SALES: 'Sales Officer',
    SANCTION: 'Sanction Officer',
    DISBURSEMENT: 'Disbursement Officer',
    COLLECTION: 'Collection Officer',
  };
  return labels[role] || role;
};

export const getRoleDashboardPath = (role: string): string => {
  const paths: Record<string, string> = {
    ADMIN: '/dashboard/admin',
    BORROWER: '/dashboard/borrower',
    SALES: '/dashboard/sales',
    SANCTION: '/dashboard/sanction',
    DISBURSEMENT: '/dashboard/disbursement',
    COLLECTION: '/dashboard/collection',
  };
  return paths[role] || '/dashboard';
};
