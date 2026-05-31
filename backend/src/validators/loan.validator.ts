import { body } from 'express-validator';

export const loanApplicationValidator = [
  body('amount')
    .notEmpty().withMessage('Loan amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 50000, max: 500000 }).withMessage('Loan amount must be between ₹50,000 and ₹5,00,000'),
  body('tenure')
    .notEmpty().withMessage('Tenure is required')
    .isInt({ min: 30, max: 365 }).withMessage('Tenure must be between 30 and 365 days'),
];

export const rejectLoanValidator = [
  body('reason')
    .trim()
    .notEmpty().withMessage('Rejection reason is required')
    .isLength({ min: 10 }).withMessage('Please provide a detailed rejection reason (min 10 characters)'),
];

export const paymentValidator = [
  body('loanId')
    .notEmpty().withMessage('Loan ID is required')
    .isMongoId().withMessage('Invalid loan ID'),
  body('amount')
    .notEmpty().withMessage('Payment amount is required')
    .isNumeric().withMessage('Amount must be a number')
    .isFloat({ min: 1 }).withMessage('Payment amount must be at least ₹1'),
  body('utr')
    .trim()
    .notEmpty().withMessage('UTR is required')
    .isLength({ min: 6, max: 30 }).withMessage('UTR must be between 6 and 30 characters'),
  body('paymentDate')
    .optional()
    .isISO8601().withMessage('Invalid payment date format'),
  body('note')
    .optional()
    .trim(),
];
