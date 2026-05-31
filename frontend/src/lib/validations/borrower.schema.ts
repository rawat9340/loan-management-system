import { z } from 'zod';

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

const calculateAge = (dob: string): number => {
  const today = new Date();
  const birth = new Date(dob);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const personalDetailsSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters').trim(),
  lastName: z.string().min(1, 'Last name is required').trim(),
  dob: z
    .string()
    .min(1, 'Date of birth is required')
    .check((ctx) => {
      const age = calculateAge(ctx.value);
      if (age < 23) {
        ctx.issues.push({ code: 'custom', message: 'You must be at least 23 years old', input: ctx.value });
      }
      if (age > 50) {
        ctx.issues.push({ code: 'custom', message: 'You must be 50 years old or younger', input: ctx.value });
      }
    }),
  pan: z
    .string()
    .min(1, 'PAN is required')
    .toUpperCase()
    .check((ctx) => {
      if (!PAN_REGEX.test(ctx.value)) {
        ctx.issues.push({ code: 'custom', message: 'Invalid PAN format. Example: ABCDE1234F', input: ctx.value });
      }
    }),
  phone: z
    .string()
    .check((ctx) => {
      if (!/^[6-9]\d{9}$/.test(ctx.value)) {
        ctx.issues.push({ code: 'custom', message: 'Invalid Indian phone number (10 digits starting with 6-9)', input: ctx.value });
      }
    }),
  address: z.string().min(10, 'Please provide a complete address (min 10 characters)').trim(),
});

export const employmentSchema = z.object({
  employmentType: z.enum(['SALARIED', 'SELF_EMPLOYED', 'UNEMPLOYED']),
  employerName: z.string().optional(),
  salary: z
    .number({ error: 'Salary must be a number' })
    .min(25000, 'Minimum salary required is ₹25,000 per month'),
}).check((ctx) => {
  if (ctx.value.employmentType === 'UNEMPLOYED') {
    ctx.issues.push({
      code: 'custom',
      message: 'Unemployed applicants are not eligible for a loan',
      path: ['employmentType'],
      input: ctx.value.employmentType,
    });
  }
});

export const loanDetailsSchema = z.object({
  amount: z
    .number({ error: 'Loan amount is required' })
    .min(50000, 'Minimum loan amount is ₹50,000')
    .max(500000, 'Maximum loan amount is ₹5,00,000'),
  tenure: z
    .number({ error: 'Tenure is required' })
    .int('Tenure must be a whole number')
    .min(30, 'Minimum tenure is 30 days')
    .max(365, 'Maximum tenure is 365 days'),
});

export const rejectLoanSchema = z.object({
  reason: z
    .string()
    .min(10, 'Please provide a detailed rejection reason (min 10 characters)')
    .trim(),
});

export const paymentSchema = z.object({
  amount: z
    .number({ error: 'Amount must be a number' })
    .positive('Amount must be positive'),
  utr: z
    .string()
    .min(6, 'UTR must be at least 6 characters')
    .max(30, 'UTR cannot exceed 30 characters')
    .trim()
    .toUpperCase(),
  paymentDate: z.string().optional(),
  note: z.string().optional(),
});

export type PersonalDetailsFormData = z.infer<typeof personalDetailsSchema>;
export type EmploymentFormData = z.infer<typeof employmentSchema>;
export type LoanDetailsFormData = z.infer<typeof loanDetailsSchema>;
export type RejectLoanFormData = z.infer<typeof rejectLoanSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
