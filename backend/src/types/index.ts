// Shared TypeScript types for the Loan Management System

export type UserRole =
  | 'ADMIN'
  | 'BORROWER'
  | 'SALES'
  | 'SANCTION'
  | 'DISBURSEMENT'
  | 'COLLECTION';

export type EmploymentType =
  | 'SALARIED'
  | 'SELF_EMPLOYED'
  | 'UNEMPLOYED';

export type BREStatus = 'PASS' | 'FAIL' | 'PENDING';

export type BorrowerStatus = 'REGISTERED' | 'APPLIED';

export type LoanStatus =
  | 'APPLIED'
  | 'REJECTED'
  | 'SANCTIONED'
  | 'DISBURSED'
  | 'CLOSED';

export interface JWTPayload {
  userId: string;
  role: UserRole;
  email: string;
}

export interface AuthRequest extends Express.Request {
  user?: JWTPayload;
}

// Declare module augmentation for Express
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}
