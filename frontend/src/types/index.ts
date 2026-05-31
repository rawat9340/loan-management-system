// Shared TypeScript types for frontend

export type UserRole =
  | 'ADMIN'
  | 'BORROWER'
  | 'SALES'
  | 'SANCTION'
  | 'DISBURSEMENT'
  | 'COLLECTION';

export type EmploymentType = 'SALARIED' | 'SELF_EMPLOYED' | 'UNEMPLOYED';

export type BREStatus = 'PASS' | 'FAIL' | 'PENDING';

export type BorrowerStatus = 'REGISTERED' | 'APPLIED';

export type LoanStatus =
  | 'APPLIED'
  | 'REJECTED'
  | 'SANCTIONED'
  | 'DISBURSED'
  | 'CLOSED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface BorrowerProfile {
  _id: string;
  userId: string;
  firstName: string;
  lastName: string;
  fullName?: string;
  dob: string;
  age: number;
  pan: string;
  phone: string;
  address: string;
  employmentType: EmploymentType;
  employerName?: string;
  salary: number;
  salarySlipUrl?: string;
  breStatus: BREStatus;
  breReasons: string[];
  status: BorrowerStatus;
  createdAt: string;
}

export interface Loan {
  _id: string;
  borrowerId: BorrowerProfile | string;
  userId: User | string;
  amount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  remainingAmount?: number;
  status: LoanStatus;
  rejectionReason?: string;
  appliedAt: string;
  sanctionedAt?: string;
  sanctionedBy?: User | string;
  disbursedAt?: string;
  disbursedBy?: User | string;
  closedAt?: string;
  totalPaid: number;
  createdAt: string;
}

export interface Payment {
  _id: string;
  loanId: string;
  borrowerId: string;
  amount: number;
  utr: string;
  paymentDate: string;
  recordedBy: User | string;
  cumulativePaid: number;
  note?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{ msg: string; param?: string; path?: string }>;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  borrowerProfile: BorrowerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoanFormData {
  // Step 1: Personal
  firstName: string;
  lastName: string;
  dob: string;
  pan: string;
  phone: string;
  address: string;
  // Step 2: Employment
  employmentType: EmploymentType;
  employerName: string;
  salary: number;
  // Step 3: Document
  salarySlip: File | null;
  // Step 4: Loan
  amount: number;
  tenure: number;
}

export interface DashboardStats {
  totalBorrowers: number;
  loans: {
    applied: number;
    sanctioned: number;
    disbursed: number;
    closed: number;
    rejected: number;
    total: number;
  };
  totalDisbursedAmount: number;
}
