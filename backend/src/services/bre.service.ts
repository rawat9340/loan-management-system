import { IBorrower } from '../models/Borrower';

export interface BREResult {
  passed: boolean;
  reasons: string[];
}

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const MIN_AGE = 23;
const MAX_AGE = 50;
const MIN_SALARY = 25000;

export const runBRE = (borrower: Partial<IBorrower>): BREResult => {
  const reasons: string[] = [];

  // Age validation
  if (borrower.age === undefined || borrower.age < MIN_AGE || borrower.age > MAX_AGE) {
    reasons.push(`Age must be between ${MIN_AGE} and ${MAX_AGE} years. Current age: ${borrower.age}`);
  }

  // Salary validation
  if (borrower.salary === undefined || borrower.salary < MIN_SALARY) {
    reasons.push(`Monthly salary must be at least ₹${MIN_SALARY.toLocaleString('en-IN')}. Provided: ₹${(borrower.salary || 0).toLocaleString('en-IN')}`);
  }

  // Employment validation
  if (borrower.employmentType === 'UNEMPLOYED') {
    reasons.push('Unemployed applicants are not eligible for a loan.');
  }

  // PAN validation
  if (!borrower.pan || !PAN_REGEX.test(borrower.pan)) {
    reasons.push(`PAN format is invalid. Expected format: ABCDE1234F. Provided: ${borrower.pan || 'N/A'}`);
  }

  return {
    passed: reasons.length === 0,
    reasons,
  };
};

export const calculateAge = (dob: Date): number => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};
